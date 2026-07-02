"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROVIDER_BASE_URLS = void 0;
exports.getBaseURL = getBaseURL;
exports.PROVIDER_BASE_URLS = {
    openrouter: 'https://openrouter.ai/api/v1',
    siliconflow: 'https://api.siliconflow.cn/v1'
};
function getBaseURL(provider, customUrl) {
    if (provider === 'custom') {
        if (!customUrl) {
            throw new Error('ai_base_url is required when ai_provider is custom');
        }
        return customUrl;
    }
    const url = exports.PROVIDER_BASE_URLS[provider];
    if (!url) {
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
    return url;
}
