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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileGenerator = void 0;
const path = __importStar(require("path"));
const gray_matter_1 = __importDefault(require("gray-matter"));
class FileGenerator {
    static generate(originalPath, translatedContent, targetLang, detectResult) {
        const { framework, postsDir } = detectResult;
        // Get file name relative to postsDir
        const relativeFilename = path.relative(postsDir, originalPath).replace(/\\/g, '/');
        let generatedPath = '';
        if (framework === 'jekyll') {
            // jekyll path: /{lang}/_posts/filename
            generatedPath = path.join(targetLang, '_posts', relativeFilename).replace(/\\/g, '/');
        }
        else if (framework === 'hexo') {
            // hexo path: /source/_posts/{lang}/filename
            generatedPath = path.join('source', '_posts', targetLang, relativeFilename).replace(/\\/g, '/');
        }
        else {
            // Fallback: directory based
            generatedPath = path.join(targetLang, postsDir, relativeFilename).replace(/\\/g, '/');
        }
        // Update lang and permalink in front matter
        const parsed = (0, gray_matter_1.default)(translatedContent);
        const updatedData = { ...parsed.data };
        // Inject lang
        updatedData.lang = targetLang;
        // Prepend targetLang to permalink if it exists
        if (typeof updatedData.permalink === 'string') {
            let perm = updatedData.permalink.trim();
            const langPrefix = `/${targetLang}/`;
            if (!perm.startsWith(langPrefix)) {
                // Strip leading slash if any, then prepend
                const cleanPerm = perm.startsWith('/') ? perm.substring(1) : perm;
                updatedData.permalink = `/${targetLang}/${cleanPerm}`;
            }
        }
        const content = gray_matter_1.default.stringify(parsed.content, updatedData);
        return {
            generatedPath,
            content
        };
    }
}
exports.FileGenerator = FileGenerator;
