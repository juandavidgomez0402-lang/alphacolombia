import { mkdir, readdir, copyFile, writeFile, readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import JavaScriptObfuscator from 'javascript-obfuscator';
import { minify as minifyHtml } from 'html-minifier-terser';
import CleanCSS from 'clean-css';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');

const ASSET_EXT = new Set([
  '.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.ico',
  '.mp4', '.webm', '.woff', '.woff2', '.ttf'
]);

const reservedNames = [
  'openSupportModal',
  'closeSupportModal',
  'openBancolombiaUpdateModal',
  'closeBancolombiaUpdateModal',
  'openDaviplataUpdateModal',
  'closeDaviplataUpdateModal',
  'closeVendorNotice',
  'openOfficialVendors'
];

const obfuscatorOptions = {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.75,
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 0.3,
  identifierNamesGenerator: 'hexadecimal',
  renameGlobals: false,
  reservedNames,
  selfDefending: true,
  stringArray: true,
  stringArrayEncoding: ['base64'],
  stringArrayThreshold: 0.8,
  splitStrings: true,
  splitStringsChunkLength: 8,
  transformObjectKeys: true,
  unicodeEscapeSequence: false
};

async function ensureCleanDist() {
  await rm(dist, { recursive: true, force: true });
  await mkdir(dist, { recursive: true });
}

async function copyAssets() {
  const entries = await readdir(root, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const ext = path.extname(entry.name).toLowerCase();
    if (!ASSET_EXT.has(ext)) continue;
    await copyFile(path.join(root, entry.name), path.join(dist, entry.name));
  }
}

function obfuscateJs(code) {
  return JavaScriptObfuscator.obfuscate(code, obfuscatorOptions).getObfuscatedCode();
}

async function obfuscateHtml(filename) {
  const source = await readFile(path.join(root, filename), 'utf8');
  const withObfuscatedScripts = source.replace(
    /<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/gi,
    (_match, attrs, code) => {
      const js = code.trim();
      if (!js) return `<script${attrs}></script>`;
      return `<script${attrs}>${obfuscateJs(js)}</script>`;
    }
  );

  return minifyHtml(withObfuscatedScripts, {
    collapseWhitespace: true,
    removeComments: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    minifyCSS: true,
    minifyJS: false
  });
}

async function obfuscateCss() {
  const css = await readFile(path.join(root, 'styles.css'), 'utf8');
  const result = new CleanCSS({ level: 2 }).minify(css);
  if (result.errors.length) {
    throw new Error(result.errors.join('\n'));
  }
  return result.styles;
}

async function obfuscateScriptJs() {
  const js = await readFile(path.join(root, 'script.js'), 'utf8');
  return obfuscateJs(js);
}

await ensureCleanDist();
await copyAssets();

await writeFile(path.join(dist, 'index.html'), await obfuscateHtml('index.html'), 'utf8');
await writeFile(path.join(dist, 'loading.html'), await obfuscateHtml('loading.html'), 'utf8');
await writeFile(path.join(dist, 'styles.css'), await obfuscateCss(), 'utf8');
await writeFile(path.join(dist, 'script.js'), await obfuscateScriptJs(), 'utf8');

console.log('Sitio ofuscado en dist/');
