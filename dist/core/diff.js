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
exports.DiffDetector = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
const fs_utils_1 = require("../utils/fs-utils");
class DiffDetector {
    static getHash(content) {
        return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
    }
    static getDiff(workspacePath, state, postsDir, ignoreCheck, targetLangs = []) {
        const added = [];
        const modified = [];
        const deleted = [];
        const fullPostsDir = path.join(workspacePath, postsDir);
        const existingFiles = new Set();
        if (fs.existsSync(fullPostsDir)) {
            const scanDir = (dir) => {
                const entries = fs.readdirSync(dir, { withFileTypes: true });
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    const relativePath = path.relative(workspacePath, fullPath).replace(/\\/g, '/');
                    if (ignoreCheck(relativePath)) {
                        continue;
                    }
                    if (entry.isDirectory()) {
                        scanDir(fullPath);
                    }
                    else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.markdown'))) {
                        existingFiles.add(relativePath);
                        const content = (0, fs_utils_1.readTextFile)(fullPath);
                        const currentHash = this.getHash(content);
                        const fileState = state.files[relativePath];
                        if (!fileState) {
                            added.push(relativePath);
                        }
                        else if (fileState.hash !== currentHash) {
                            modified.push(relativePath);
                        }
                        else if (targetLangs.some(lang => !fileState.translated[lang])) {
                            // Content unchanged, but a previous run failed to translate into
                            // one or more target languages. Retry those on this run.
                            modified.push(relativePath);
                        }
                    }
                }
            };
            scanDir(fullPostsDir);
        }
        // Detect deleted files
        for (const relativePath of Object.keys(state.files)) {
            if (!existingFiles.has(relativePath)) {
                deleted.push(relativePath);
            }
        }
        return { added, modified, deleted };
    }
}
exports.DiffDetector = DiffDetector;
