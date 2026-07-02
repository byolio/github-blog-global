import OpenAI from 'openai';
import matter from 'gray-matter';
import { BlogGlobalConfig, getBaseURL } from './config';

export interface TranslationTask {
  filePath: string;
  content: string;
  sourceLang: string;
  targetLang: string;
}

export interface TranslationResult {
  filePath: string;
  targetLang: string;
  translatedContent: string;
  success: boolean;
  error?: string;
}

export class Translator {
  private openai: OpenAI;
  private config: BlogGlobalConfig;

  constructor(config: BlogGlobalConfig) {
    this.config = config;
    this.openai = new OpenAI({
      apiKey: config.aiApiKey,
      baseURL: getBaseURL(config.aiProvider, config.aiBaseUrl)
    });
  }

  private async retryWithBackoff<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (retries <= 0) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
      return this.retryWithBackoff(fn, retries - 1, delay * 2);
    }
  }

  private async translateSingle(task: TranslationTask): Promise<string> {
    const { content, sourceLang, targetLang } = task;

    // Parse front matter using gray-matter
    const parsed = matter(content);
    const originalData = { ...parsed.data };
    const originalBody = parsed.content;

    // Extract fields to translate
    const fieldsToTranslate: Record<string, any> = {};
    if (originalData.title) fieldsToTranslate.title = originalData.title;
    if (originalData.description) fieldsToTranslate.description = originalData.description;
    if (originalData.summary) fieldsToTranslate.summary = originalData.summary;
    if (originalData.tags) fieldsToTranslate.tags = originalData.tags;

    const systemPrompt = `You are a professional blog post translator. Translate the given content from ${sourceLang} to ${targetLang}.
You will be provided with a JSON object containing 'frontMatter' and 'body'.
Translate 'frontMatter' (only the values of 'title', 'description', 'summary', and elements of 'tags' array if they exist) and the 'body' string.

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
        response_format: { type: 'json_object' }
      });

      const responseText = completion.choices[0]?.message?.content;
      if (!responseText) {
        throw new Error('Empty response from AI model');
      }
      return responseText;
    });

    const translatedData = JSON.parse(response);
    const translatedFrontMatter = translatedData.frontMatter || {};
    const translatedBody = translatedData.body || '';

    // Merge translated front matter back
    const mergedData = { ...originalData };
    if (translatedFrontMatter.title) mergedData.title = translatedFrontMatter.title;
    if (translatedFrontMatter.description) mergedData.description = translatedFrontMatter.description;
    if (translatedFrontMatter.summary) mergedData.summary = translatedFrontMatter.summary;
    if (translatedFrontMatter.tags) mergedData.tags = translatedFrontMatter.tags;

    // Stringify back with gray-matter
    return matter.stringify(translatedBody, mergedData);
  }

  async translate(tasks: TranslationTask[], concurrency = 3): Promise<TranslationResult[]> {
    const results: TranslationResult[] = [];
    const totalTasks = tasks.length;
    let completedTasks = 0;

    // Track unique files and their total target languages
    const totalFiles = new Set(tasks.map(t => t.filePath)).size;
    const fileLanguagesCount: Record<string, number> = {};
    for (const task of tasks) {
      fileLanguagesCount[task.filePath] = (fileLanguagesCount[task.filePath] || 0) + 1;
    }
    const fileCompletedLanguages: Record<string, number> = {};
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
        } catch (error: any) {
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
