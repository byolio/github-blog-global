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
exports.jekyllPrettyUrl = jekyllPrettyUrl;
const path = __importStar(require("path"));
const gray_matter_1 = __importDefault(require("gray-matter"));
const POST_FILENAME_RE = /^(\d{4})-(\d{1,2})-(\d{1,2})-(.+)$/;
function pad2(n) {
    return String(n).padStart(2, '0');
}
function parseDateParts(value) {
    if (value instanceof Date && !isNaN(value.getTime())) {
        return {
            year: String(value.getUTCFullYear()),
            month: pad2(value.getUTCMonth() + 1),
            day: pad2(value.getUTCDate())
        };
    }
    if (typeof value === 'string') {
        const m = value.trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
        if (m) {
            return { year: m[1], month: pad2(m[2]), day: pad2(m[3]) };
        }
    }
    return undefined;
}
// URL Jekyll assigns to a post under the global `permalink: pretty` setting
// (/:categories/:year/:month/:day/:title/). A `date` in front matter overrides
// the filename date, matching Jekyll behavior. Returns undefined when the
// filename doesn't follow the YYYY-MM-DD-slug post convention.
function jekyllPrettyUrl(postPath, frontMatterDate) {
    const base = path.basename(postPath).replace(/\.(md|markdown)$/i, '');
    const m = base.match(POST_FILENAME_RE);
    if (!m)
        return undefined;
    let year = m[1];
    let month = pad2(m[2]);
    let day = pad2(m[3]);
    const slug = m[4];
    const fmDate = parseDateParts(frontMatterDate);
    if (fmDate) {
        year = fmDate.year;
        month = fmDate.month;
        day = fmDate.day;
    }
    return `/${year}/${month}/${day}/${slug}/`;
}
class FileGenerator {
    // Where older versions of this tool used to put Jekyll translations
    // ({lang}/_posts/...). Files there are picked up by site.posts and pollute
    // the homepage/tags, so callers use this to locate and delete them.
    static legacyGeneratedPath(originalPath, targetLang, detectResult) {
        if (detectResult.framework === 'hexo')
            return undefined;
        const relativeFilename = path.relative(detectResult.postsDir, originalPath).replace(/\\/g, '/');
        return path.join(targetLang, '_posts', relativeFilename).replace(/\\/g, '/');
    }
    static generate(originalPath, translatedContent, targetLang, detectResult) {
        const { framework, postsDir } = detectResult;
        // Get file name relative to postsDir
        const relativeFilename = path.relative(postsDir, originalPath).replace(/\\/g, '/');
        let generatedPath = '';
        if (framework === 'hexo') {
            // hexo path: /source/_posts/{lang}/filename
            generatedPath = path.join('source', '_posts', targetLang, relativeFilename).replace(/\\/g, '/');
        }
        else {
            // Jekyll (and fallback): emit a *page* at /{lang}/filename instead of a
            // post under /{lang}/_posts/. Jekyll collects posts from ANY _posts
            // directory into site.posts, so translations placed there would appear
            // on the homepage (paginator), in site.tags, archive and search
            // alongside the originals. Pages are excluded from all of those.
            generatedPath = path.join(targetLang, relativeFilename).replace(/\\/g, '/');
        }
        const parsed = (0, gray_matter_1.default)(translatedContent);
        const updatedData = { ...parsed.data };
        updatedData.lang = targetLang;
        // Themes (e.g. Hux) list every titled page in the top navigation bar;
        // translated pages must not show up there.
        updatedData['hide-in-nav'] = true;
        updatedData.sitemap = false;
        let permalink;
        if (framework !== 'hexo') {
            if (typeof updatedData.permalink === 'string') {
                // Original had an explicit permalink: prefix it with the language
                const cleanPerm = updatedData.permalink.trim().replace(/^\/+/, '');
                permalink = cleanPerm.startsWith(`${targetLang}/`)
                    ? `/${cleanPerm}`
                    : `/${targetLang}/${cleanPerm}`;
            }
            else {
                // Mirror the original post's pretty-permalink URL under /{lang}/
                const url = jekyllPrettyUrl(originalPath, updatedData.date);
                if (url)
                    permalink = `/${targetLang}${url}`;
            }
            if (permalink) {
                updatedData.permalink = permalink;
            }
            // Pages don't inherit a date from the filename like posts do; keep the
            // original post date visible in themes that render page.date.
            if (!updatedData.date) {
                const base = path.basename(originalPath);
                const m = base.match(/^(\d{4})-(\d{1,2})-(\d{1,2})-/);
                if (m)
                    updatedData.date = `${m[1]}-${pad2(m[2])}-${pad2(m[3])}`;
            }
        }
        const content = gray_matter_1.default.stringify(parsed.content, updatedData);
        return {
            generatedPath,
            content,
            permalink
        };
    }
}
exports.FileGenerator = FileGenerator;
