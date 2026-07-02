"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const orchestrator_1 = require("./core/orchestrator");
const languages_1 = require("./utils/languages");
async function run() {
    try {
        const aiProvider = core.getInput('ai_provider', { required: true });
        const aiApiKey = core.getInput('ai_api_key', { required: true });
        const aiModel = core.getInput('ai_model', { required: true });
        const aiBaseUrl = core.getInput('ai_base_url') || undefined;
        const baseLang = core.getInput('base_lang', { required: true });
        const targetLangsInput = core.getInput('target_langs', { required: true });
        const githubToken = core.getInput('github_token') || undefined;
        const siteUrl = core.getInput('site_url') || undefined;
        const targetLangs = targetLangsInput
            .split(',')
            .map(lang => lang.trim())
            .filter(Boolean);
        // Validate languages
        if (!(0, languages_1.isValidLanguageCode)(baseLang)) {
            throw new Error(`Invalid base_lang: ${baseLang}. Supported language codes: ${(0, languages_1.getSupportedLanguageCodesList)()}`);
        }
        for (const lang of targetLangs) {
            if (!(0, languages_1.isValidLanguageCode)(lang)) {
                throw new Error(`Invalid target_lang: ${lang}. Supported language codes: ${(0, languages_1.getSupportedLanguageCodesList)()}`);
            }
        }
        const config = {
            aiProvider,
            aiApiKey,
            aiModel,
            aiBaseUrl,
            baseLang,
            targetLangs,
            githubToken,
            createPr: !!githubToken,
            siteUrl
        };
        const workspacePath = process.env.GITHUB_WORKSPACE || process.cwd();
        console.log(`Starting blog-global translation in workspace: ${workspacePath}`);
        const orchestrator = new orchestrator_1.Orchestrator(config, workspacePath);
        const result = await orchestrator.run();
        if (result.success) {
            core.setOutput('translated_count', result.translatedCount);
            if (result.prUrl) {
                core.setOutput('pr_url', result.prUrl);
            }
            console.log(`Successfully completed. Translated ${result.translatedCount} articles.`);
        }
        else {
            throw new Error(result.error);
        }
    }
    catch (error) {
        core.setFailed(error.message || String(error));
    }
}
run();
