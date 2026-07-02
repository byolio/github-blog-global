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
exports.Detector = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class Detector {
    static detect(workspacePath) {
        const hasConfigYml = fs.existsSync(path.join(workspacePath, '_config.yml'));
        const hasPostsDir = fs.existsSync(path.join(workspacePath, '_posts'));
        const hasSourcePostsDir = fs.existsSync(path.join(workspacePath, 'source', '_posts'));
        const hasPackageJson = fs.existsSync(path.join(workspacePath, 'package.json'));
        let isHexo = false;
        if (hasPackageJson) {
            try {
                const pkg = JSON.parse(fs.readFileSync(path.join(workspacePath, 'package.json'), 'utf8'));
                if (pkg.dependencies?.hexo || pkg.devDependencies?.hexo) {
                    isHexo = true;
                }
            }
            catch {
                // Ignore JSON parsing errors
            }
        }
        if (hasConfigYml && hasPostsDir && !isHexo && !hasSourcePostsDir) {
            return {
                framework: 'jekyll',
                postsDir: '_posts',
                i18nStrategy: {
                    type: 'directory',
                    pattern: '/{lang}/_posts/{file}'
                }
            };
        }
        if (hasConfigYml && (hasSourcePostsDir || isHexo)) {
            return {
                framework: 'hexo',
                postsDir: 'source/_posts',
                i18nStrategy: {
                    type: 'directory',
                    pattern: '/source/_posts/{lang}/{file}'
                }
            };
        }
        // Default fallback or unknown
        return {
            framework: 'unknown',
            postsDir: '_posts',
            i18nStrategy: {
                type: 'directory',
                pattern: '/{lang}/_posts/{file}'
            }
        };
    }
}
exports.Detector = Detector;
