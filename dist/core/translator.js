"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Translator = void 0;
const openai_1 = __importDefault(require("openai"));
const gray_matter_1 = __importDefault(require("gray-matter"));
const config_1 = require("./config");
class Translator {
    openai;
    config;
    constructor(config) {
        this.config = config;
        this.openai = new openai_1.default({
            apiKey: config.aiApiKey,
            baseURL: (0, config_1.getBaseURL)(config.aiProvider, config.aiBaseUrl)
        });
    }
    getRetryAfterMs(error) {
        const status = error?.status ?? error?.response?.status;
        if (status !== 429)
            return undefined;
        const headers = error?.headers ?? error?.response?.headers;
        const retryAfter = headers?.get ? headers.get('retry-after') : headers?.['retry-after'];
        if (!retryAfter)
            return undefined;
        const seconds = Number(retryAfter);
        return Number.isFinite(seconds) ? seconds * 1000 : undefined;
    }
    async retryWithBackoff(fn, retries = 3, delay = 1000) {
        try {
            return await fn();
        }
        catch (error) {
            if (retries <= 0)
                throw error;
            const retryAfterMs = this.getRetryAfterMs(error);
            await new Promise(resolve => setTimeout(resolve, retryAfterMs ?? delay));
            return this.retryWithBackoff(fn, retries - 1, delay * 2);
        }
    }
    // Some models ignore response_format and wrap JSON in markdown code fences
    // or add leading/trailing text; extract the JSON object defensively.
    extractJson(text) {
        const trimmed = text.trim();
        // Only strip fences when the WHOLE response is wrapped in a single
        // ```json ... ``` block (some models do this despite json_object mode).
        // The translated body itself may legitimately contain ``` code fences,
        // so we must not match those inner occurrences.
        const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*)\s*```$/i);
        if (fenceMatch) {
            const inner = fenceMatch[1].trim();
            try {
                JSON.parse(inner);
                return inner;
            }
            catch {
                // Fall through; the fence-looking text wasn't actually a clean wrapper
            }
        }
        try {
            JSON.parse(trimmed);
            return trimmed;
        }
        catch {
            // Fall back to slicing from the first '{' to the last '}' in the text
        }
        const start = trimmed.indexOf('{');
        const end = trimmed.lastIndexOf('}');
        if (start !== -1 && end !== -1 && end > start) {
            return trimmed.slice(start, end + 1);
        }
        return trimmed;
    }
    async translateSingle(task) {
        const { content, sourceLang, targetLang } = task;
        // Parse front matter using gray-matter
        const parsed = (0, gray_matter_1.default)(content);
        const originalData = { ...parsed.data };
        const originalBody = parsed.content;
        // Extract fields to translate
        const fieldsToTranslate = {};
        if (originalData.title)
            fieldsToTranslate.title = originalData.title;
        if (originalData.subtitle)
            fieldsToTranslate.subtitle = originalData.subtitle;
        if (originalData.description)
            fieldsToTranslate.description = originalData.description;
        if (originalData.summary)
            fieldsToTranslate.summary = originalData.summary;
        // Tags are intentionally NOT translated: they are shared taxonomy keys
        // across the whole site, and translating them would create duplicate
        // foreign-language tags in site.tags.
        const systemPrompt = `You are a professional blog post translator. Translate the given content from ${sourceLang} to ${targetLang}.
You will be provided with a JSON object containing 'frontMatter' and 'body'.
Translate 'frontMatter' (only the values of 'title', 'subtitle', 'description', and 'summary' if they exist) and the 'body' string.

Strict Rules:
1. Maintain all Markdown formatting in the translated body (headings, lists, bold, italics, links, images, tables).
2. Do NOT translate code blocks (\`\`\`...\`\`\`) or inline code (\`...\`). Leave them exactly as they are.
3. Keep all HTML tags in the body intact.
4. Keep image source paths unchanged.
5. Keep technical terms, brand names, and proper nouns in English if that is standard in the target language.
6. Return your response as a valid JSON object matching the exact structure of the input, containing 'frontMatter' and 'body'. Do NOT add any extra markdown formatting or conversational text around the JSON.`;
        const userMessage = JSON.stringify({
            frontMatter: fieldsToTranslate,
            body: originalBody
        });
        const response = await this.retryWithBackoff(async () => {
            const completion = await this.openai.chat.completions.create({
                model: this.config.aiModel,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage }
                ],
                temperature: 0.1,
                // SiliconFlow defaults max_tokens to a small value (512), which would
                // truncate any real article. Request a generous output budget.
                max_tokens: this.config.aiProvider === 'siliconflow' ? 8192 : undefined,
                response_format: { type: 'json_object' }
            });
            const choice = completion.choices[0];
            if (choice?.finish_reason === 'length') {
                throw new Error('AI response was truncated (finish_reason=length). The article may be too long for the model output limit.');
            }
            const responseText = choice?.message?.content;
            if (!responseText) {
                throw new Error('Empty response from AI model');
            }
            return responseText;
        });
        const translatedData = JSON.parse(this.extractJson(response));
        const translatedFrontMatter = translatedData.frontMatter || {};
        const translatedBody = translatedData.body || '';
        // Merge translated front matter back
        const mergedData = { ...originalData };
        if (translatedFrontMatter.title)
            mergedData.title = translatedFrontMatter.title;
        if (translatedFrontMatter.subtitle)
            mergedData.subtitle = translatedFrontMatter.subtitle;
        if (translatedFrontMatter.description)
            mergedData.description = translatedFrontMatter.description;
        if (translatedFrontMatter.summary)
            mergedData.summary = translatedFrontMatter.summary;
        // Stringify back with gray-matter
        return gray_matter_1.default.stringify(translatedBody, mergedData);
    }
    async translate(tasks, concurrency = 3) {
        const results = [];
        const totalTasks = tasks.length;
        let completedTasks = 0;
        // Track unique files and their total target languages
        const totalFiles = new Set(tasks.map(t => t.filePath)).size;
        const fileLanguagesCount = {};
        for (const task of tasks) {
            fileLanguagesCount[task.filePath] = (fileLanguagesCount[task.filePath] || 0) + 1;
        }
        const fileCompletedLanguages = {};
        let completedFiles = 0;
        // Process in batches of concurrency size to avoid rate limits
        for (let i = 0; i < tasks.length; i += concurrency) {
            const batch = tasks.slice(i, i + concurrency);
            const batchPromises = batch.map(async (task) => {
                try {
                    const translatedContent = await this.translateSingle(task);
                    completedTasks++;
                    fileCompletedLanguages[task.filePath] = (fileCompletedLanguages[task.filePath] || 0) + 1;
                    if (fileCompletedLanguages[task.filePath] === fileLanguagesCount[task.filePath]) {
                        completedFiles++;
                    }
                    console.log(`[Progress] ${completedFiles}/${totalFiles} files translated (AI tasks: ${completedTasks}/${totalTasks} using ${this.config.aiModel})`);
                    return {
                        filePath: task.filePath,
                        targetLang: task.targetLang,
                        translatedContent,
                        success: true
                    };
                }
                catch (error) {
                    completedTasks++;
                    fileCompletedLanguages[task.filePath] = (fileCompletedLanguages[task.filePath] || 0) + 1;
                    if (fileCompletedLanguages[task.filePath] === fileLanguagesCount[task.filePath]) {
                        completedFiles++;
                    }
                    console.log(`[Progress] ${completedFiles}/${totalFiles} files translated (AI tasks: ${completedTasks}/${totalTasks} using ${this.config.aiModel})`);
                    return {
                        filePath: task.filePath,
                        targetLang: task.targetLang,
                        translatedContent: '',
                        success: false,
                        error: error.message || String(error)
                    };
                }
            });
            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);
        }
        return results;
    }
}
exports.Translator = Translator;
