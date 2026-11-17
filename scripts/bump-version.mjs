import fs from 'fs';
import path from 'path';

const root = process.cwd();

// 1. Update version.json
const versionPath = path.join(root, 'version.json');
const versionData = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
const parts = versionData.version.replace(/^v/, '').split('.');
parts[2] = String(Number(parts[2]) + 1).padStart(2, '0');
const semver = parts.join('.');
const nextVersion = `v${semver}`;

versionData.version = nextVersion;
versionData.buildDate = new Date().toISOString().slice(0, 10);
fs.writeFileSync(versionPath, JSON.stringify(versionData, null, 2) + '\n', 'utf8');

// 2. Sync package.json
const pkgPath = path.join(root, 'package.json');
const pkgData = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkgData.version = semver;
fs.writeFileSync(pkgPath, JSON.stringify(pkgData, null, 2) + '\n', 'utf8');

// 3. Sync sw.js CACHE_NAME
const swPath = path.join(root, 'sw.js');
if (fs.existsSync(swPath)) {
  const swContent = fs.readFileSync(swPath, 'utf8')
    .replace(/const CACHE_NAME = 'labtrack-cache-v[^']+';/, `const CACHE_NAME = 'labtrack-cache-${nextVersion}';`);
  fs.writeFileSync(swPath, swContent, 'utf8');
}

// 4. Sync index.html footer version
const indexPath = path.join(root, 'index.html');
if (fs.existsSync(indexPath)) {
  const indexContent = fs.readFileSync(indexPath, 'utf8')
    .replace(/(<span id="footer-version">)v[^<]+(<\/span>)/, `$1${nextVersion}$2`);
  fs.writeFileSync(indexPath, indexContent, 'utf8');
}

console.log(`Bumped LabTrack to ${nextVersion}`);
