import * as fs from 'fs';
import * as path from 'path';
import { Command } from 'commander';
import { select, input, checkbox, confirm, password } from '@inquirer/prompts';
import { Orchestrator } from './core/orchestrator';
import { BlogGlobalConfig } from './core/config';
import { SUPPORTED_LANGUAGES, isValidLanguageCode, getSupportedLanguageCodesList } from './utils/languages';

function parseSimpleYaml(content: string): Record<string, any> {
  const result: Record<string, any> = {};
  const lines = content.split(/\r?\n/);
  let currentKey = '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    if (trimmed.startsWith('-') && currentKey) {
      const val = trimmed.substring(1).trim().replace(/['"]/g, '');
      if (!result[currentKey]) result[currentKey] = [];
      if (Array.isArray(result[currentKey])) {
        result[currentKey].push(val);
      }
      continue;
    }

    const colonIndex = line.indexOf(':');
    if (colonIndex !== -1) {
      const key = line.substring(0, colonIndex).trim();
      const val = line.substring(colonIndex + 1).trim().replace(/['"]/g, '');
      currentKey = key;
      if (val) {
        result[key] = val;
      } else {
        result[key] = [];
      }
    }
  }
  return result;
}

function loadConfigFile(workspacePath: string): Partial<BlogGlobalConfig> {
  const configPath = path.join(workspacePath, '.blog-global.yml');
  if (fs.existsSync(configPath)) {
    try {
      const content = fs.readFileSync(configPath, 'utf8');
      const parsed = parseSimpleYaml(content);
      const config: Partial<BlogGlobalConfig> = {};
      
      if (parsed.provider) config.aiProvider = parsed.provider;
      if (parsed.model) config.aiModel = parsed.model;
      if (parsed.base_lang) config.baseLang = parsed.base_lang;
      if (parsed.target_langs) {
        config.targetLangs = Array.isArray(parsed.target_langs)
          ? parsed.target_langs
          : parsed.target_langs.split(',').map((l: string) => l.trim());
      }
      return config;
    } catch {
      // Ignore config file parsing errors
    }
  }
  return {};
}

async function runInteractive(workspacePath: string, configFromFile: Partial<BlogGlobalConfig>): Promise<BlogGlobalConfig> {
  const aiProvider = await select({
    message: 'Select AI Provider:',
    choices: [
      { name: 'OpenRouter', value: 'openrouter' },
      { name: 'SiliconFlow (硅基流动)', value: 'siliconflow' },
      { name: 'Custom URL', value: 'custom' }
    ],
    default: configFromFile.aiProvider || 'openrouter'
  }) as any;

  const aiApiKey = await input({
    message: 'Enter your API Key:',
    validate: (val) => val.trim().length > 0 ? true : 'API Key cannot be empty'
  });

  let aiBaseUrl: string | undefined;
  if (aiProvider === 'custom') {
    aiBaseUrl = await input({
      message: 'Enter Custom API Base URL:',
      validate: (val) => val.trim().length > 0 ? true : 'Base URL cannot be empty'
    });
  }

  const defaultModel = configFromFile.aiModel || (aiProvider === 'siliconflow' ? 'deepseek-ai/DeepSeek-V3' : 'google/gemini-2.5-flash');
  const modelChoice = await select({
    message: 'Select Translation Model:',
    choices: [
      { name: 'google/gemini-2.5-flash', value: 'google/gemini-2.5-flash' },
      { name: 'deepseek-ai/DeepSeek-V3', value: 'deepseek-ai/DeepSeek-V3' },
      { name: 'Qwen/Qwen2.5-72B-Instruct', value: 'Qwen/Qwen2.5-72B-Instruct' },
      { name: 'Enter model name manually...', value: 'manual' }
    ],
    default: ['google/gemini-2.5-flash', 'deepseek-ai/DeepSeek-V3', 'Qwen/Qwen2.5-72B-Instruct'].includes(defaultModel) ? defaultModel : 'manual'
  });

  let aiModel = modelChoice;
  if (modelChoice === 'manual') {
    aiModel = await input({
      message: 'Enter Model Name:',
      default: defaultModel,
      validate: (val) => val.trim().length > 0 ? true : 'Model name cannot be empty'
    });
  }

  const baseLang = await input({
    message: 'Enter Source Language Code (e.g., zh-CN, en):',
    default: configFromFile.baseLang || 'zh-CN',
    validate: (val) => isValidLanguageCode(val) ? true : 'Unsupported language code'
  });

  const langChoices = SUPPORTED_LANGUAGES
    .filter(lang => lang.code !== baseLang)
    .map(lang => ({
      name: `${lang.code} - ${lang.nativeName} (${lang.englishName})`,
      value: lang.code,
      checked: configFromFile.targetLangs?.includes(lang.code) || false
    }));

  const targetLangs = await checkbox({
    message: 'Select Target Languages (Space to select, Enter to confirm):',
    choices: langChoices,
    validate: (val) => val.length > 0 ? true : 'Select at least one target language'
  });

  const baseBranch = await input({
    message: 'Enter Git Base Branch for PR (e.g. main, master):',
    default: configFromFile.baseBranch || 'main',
    validate: (val) => val.trim().length > 0 ? true : 'Base Branch cannot be empty'
  });

  const createPr = await confirm({
    message: 'Do you want to automatically create a Pull Request?',
    default: true
  });

  let githubToken: string | undefined;
  if (createPr) {
    githubToken = process.env.GITHUB_TOKEN || await input({
      message: 'Enter GitHub Personal Access Token (or press enter to use GITHUB_TOKEN env var):'
    });
    if (!githubToken && process.env.GITHUB_TOKEN) {
      githubToken = process.env.GITHUB_TOKEN;
    }
  }

  return {
    aiProvider,
    aiApiKey,
    aiModel,
    aiBaseUrl,
    baseLang,
    targetLangs,
    githubToken,
    createPr,
    baseBranch
  };
}

async function main() {
  const program = new Command();
  const workspacePath = process.cwd();
  const configFromFile = loadConfigFile(workspacePath);

  program
    .name('blog-global')
    .description('Auto-translate GitHub Pages blog posts via AI')
    .version('1.0.0')
    .option('--provider <provider>', 'AI provider: openrouter | siliconflow | custom')
    .option('--api-key <key>', 'AI provider API key')
    .option('--model <model>', 'Model name')
    .option('--base-url <url>', 'Custom AI base URL')
    .option('--base-lang <lang>', 'Source language code')
    .option('--target-langs <langs>', 'Comma-separated target language codes')
    .option('--create-pr', 'Automatically create a Pull Request')
    .option('--base-branch <branch>', 'Base branch name for the PR (e.g. main)')
    .option('--token <token>', 'GitHub Token for PR creation');

  program.parse(process.argv);
  const options = program.opts();

  let config: BlogGlobalConfig;

  // Check if we can run directly without interactive prompts
  const aiApiKey = options.apiKey || process.env.BLOG_GLOBAL_API_KEY;
  const hasConfigFile = !!(configFromFile.aiProvider && configFromFile.aiModel && configFromFile.baseLang && configFromFile.targetLangs && configFromFile.targetLangs.length > 0);
  const hasCliOptions = !!(options.provider || options.apiKey || options.model || options.baseLang || options.targetLangs);

  const runDirectly = hasCliOptions || (hasConfigFile && aiApiKey);

  if (runDirectly) {
    const aiProvider = options.provider || configFromFile.aiProvider;
    const finalApiKey = aiApiKey;
    const aiModel = options.model || configFromFile.aiModel;
    const aiBaseUrl = options.baseUrl;
    const baseLang = options.baseLang || configFromFile.baseLang || 'zh-CN';
    const targetLangsStr = options.targetLangs;
    const targetLangs = targetLangsStr
      ? targetLangsStr.split(',').map((l: string) => l.trim())
      : configFromFile.targetLangs;
    const createPr = !!(options.createPr || configFromFile.createPr);
    const githubToken = options.token || process.env.GITHUB_TOKEN;

    if (!aiProvider) {
      console.error('Error: --provider is required in non-interactive mode.');
      process.exit(1);
    }
    if (!finalApiKey) {
      console.error('Error: --api-key (or BLOG_GLOBAL_API_KEY env var) is required in non-interactive mode.');
      process.exit(1);
    }
    if (!aiModel) {
      console.error('Error: --model is required in non-interactive mode.');
      process.exit(1);
    }
    if (!targetLangs || targetLangs.length === 0) {
      console.error('Error: --target-langs is required in non-interactive mode.');
      process.exit(1);
    }
    if (!isValidLanguageCode(baseLang)) {
      console.error(`Error: Invalid --base-lang "${baseLang}". Supported language codes: ${getSupportedLanguageCodesList()}`);
      process.exit(1);
    }
    for (const lang of targetLangs) {
      if (!isValidLanguageCode(lang)) {
        console.error(`Error: Invalid target language "${lang}". Supported language codes: ${getSupportedLanguageCodesList()}`);
        process.exit(1);
      }
    }

    config = {
      aiProvider: aiProvider as any,
      aiApiKey: finalApiKey,
      aiModel,
      aiBaseUrl,
      baseLang,
      targetLangs,
      githubToken,
      createPr,
      baseBranch: options.baseBranch || configFromFile.baseBranch || 'main'
    };
  } else {
    // Interactive mode
    config = await runInteractive(workspacePath, configFromFile);
  }

  console.log('\nRunning translation...');
  // Force Orchestrator not to create PR automatically inside run() so CLI can handle it interactively with retries!
  const prRequested = !!config.createPr;
  const interactivePrFlow = !runDirectly;
  const orchestratorConfig = { ...config, createPr: false };
  const orchestrator = new Orchestrator(orchestratorConfig, workspacePath);
  const result = await orchestrator.run();

  if (result.success) {
    console.log(`\nSuccess! Translated ${result.translatedCount} posts.`);

    if (prRequested && result.filesToCommit && result.filesToCommit.length > 0) {
      let prUrl: string | undefined;
      let githubToken = config.githubToken;
      let baseBranch = config.baseBranch || 'main';

      console.log('\nStarting Pull Request creation...');

      while (true) {
        if (!githubToken) {
          if (!interactivePrFlow) {
            console.error('\nError: --token (or GITHUB_TOKEN env var) is required to create a Pull Request in non-interactive mode.');
            process.exit(1);
          }
          console.log('\nGitHub Token is required to create a Pull Request.');
          githubToken = await input({
            message: 'Enter GitHub Personal Access Token (or press Enter to cancel PR creation):'
          });
          githubToken = githubToken?.trim();
          if (!githubToken) {
            console.log('Skipping Pull Request creation.');
            break;
          }
        }

        try {
          const { GitPRManager } = require('./core/git-pr');
          const gitPRManager = new GitPRManager({
            workspacePath,
            githubToken,
            baseBranch
          });

          const branchName = `blog-global/translate-${Date.now()}`;
          const prTitle = '[blog-global] Auto translation update';
          const prBody = `This Pull Request was automatically generated by [blog-global](https://github.com/your-name/blog-global) to translate blog posts.

### Summary of Changes:
- Translated posts to: ${config.targetLangs.join(', ')}
- Updated language switching links across all pages
- Updated \`.blog-global/state.json\`

*This is an automated PR. Please review and merge.*`;

          prUrl = await gitPRManager.createPullRequest(
            branchName,
            prTitle,
            prBody,
            result.filesToCommit
          );
          console.log(`\nPull Request created successfully: ${prUrl}`);
          break; // Success! Exit retry loop.
        } catch (err: any) {
          console.error(`\nError during Pull Request creation: ${err.message || err}`);

          if (!interactivePrFlow) {
            console.error('Non-interactive mode: aborting after Pull Request failure. Your translated and modified files have been saved locally.');
            process.exit(1);
          }

          // Ask if they want to retry or abort
          const retryChoice = await select({
            message: 'How would you like to proceed?',
            choices: [
              { name: 'Change Base Branch and Retry', value: 'change_branch' },
              { name: 'Change GitHub Token and Retry', value: 'change_token' },
              { name: 'Skip Pull Request creation (files are kept locally)', value: 'skip' }
            ]
          });

          if (retryChoice === 'change_branch') {
            baseBranch = await input({
              message: 'Enter Git Base Branch for PR:',
              default: baseBranch,
              validate: (val) => val.trim().length > 0 ? true : 'Base Branch cannot be empty'
            });
          } else if (retryChoice === 'change_token') {
            githubToken = await input({
              message: 'Enter new GitHub Personal Access Token:',
              validate: (val) => val.trim().length > 0 ? true : 'Token cannot be empty'
            });
          } else {
            console.log('Skipping Pull Request creation. Your translated and modified files have been saved locally.');
            break;
          }
        }
      }
    }
  } else {
    console.error('\nError during execution:', result.error);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
