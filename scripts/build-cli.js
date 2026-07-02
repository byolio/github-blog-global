const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Running ncc build for CLI...');
execSync('npx ncc build src/cli.ts -o dist/cli-bundle --minify', { stdio: 'inherit' });

console.log('Prepending shebang to dist/cli.js...');
const bundlePath = path.join(__dirname, '../dist/cli-bundle/index.js');
const outputPath = path.join(__dirname, '../dist/cli.js');

const content = fs.readFileSync(bundlePath, 'utf8');
const outputContent = '#!/usr/bin/env node\n' + content;

fs.writeFileSync(outputPath, outputContent, 'utf8');

console.log('Cleaning up temporary bundle...');
fs.rmSync(path.join(__dirname, '../dist/cli-bundle'), { recursive: true, force: true });

console.log('CLI build completed successfully!');
