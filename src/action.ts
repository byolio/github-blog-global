import * as core from '@actions/core';
import * as path from 'path';
import { Orchestrator } from './core/orchestrator';
import { BlogGlobalConfig } from './core/config';
import { isValidLanguageCode, getSupportedLanguageCodesList } from './utils/languages';

async function run() {
  try {
    const aiProvider = core.getInput('ai_provider', { required: true }) as any;
    const aiApiKey = core.getInput('ai_api_key', { required: true });
    const aiModel = core.getInput('ai_model', { required: true });
    const aiBaseUrl = core.getInput('ai_base_url') || undefined;
    const baseLang = core.getInput('base_lang', { required: true });
    const targetLangsInput = core.getInput('target_langs', { required: true });
    const githubToken = core.getInput('github_token') || undefined;

    const targetLangs = targetLangsInput
      .split(',')
      .map(lang => lang.trim())
      .filter(Boolean);

    // Validate languages
    if (!isValidLanguageCode(baseLang)) {
      throw new Error(`Invalid base_lang: ${baseLang}. Supported language codes: ${getSupportedLanguageCodesList()}`);
    }

    for (const lang of targetLangs) {
      if (!isValidLanguageCode(lang)) {
        throw new Error(`Invalid target_lang: ${lang}. Supported language codes: ${getSupportedLanguageCodesList()}`);
      }
    }

    const config: BlogGlobalConfig = {
      aiProvider,
      aiApiKey,
      aiModel,
      aiBaseUrl,
      baseLang,
      targetLangs,
      githubToken,
      createPr: !!githubToken
    };

    const workspacePath = process.env.GITHUB_WORKSPACE || process.cwd();
    console.log(`Starting blog-global translation in workspace: ${workspacePath}`);

    const orchestrator = new Orchestrator(config, workspacePath);
    const result = await orchestrator.run();

    if (result.success) {
      core.setOutput('translated_count', result.translatedCount);
      if (result.prUrl) {
        core.setOutput('pr_url', result.prUrl);
      }
      console.log(`Successfully completed. Translated ${result.translatedCount} articles.`);
    } else {
      throw new Error(result.error);
    }
  } catch (error: any) {
    core.setFailed(error.message || String(error));
  }
}

run();
