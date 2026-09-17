// Builds dist/veil-<version>.zip for the Chrome Web Store from the last commit.
// The zip holds the extension/ folder, with manifest.json at its root.
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const manifest = require('../extension/manifest.json');
const pkg = require('../package.json');

const problems = [];
if (manifest.description.length > 132) problems.push(`manifest description has ${manifest.description.length} characters (limit 132)`);
if (manifest.name.length > 75) problems.push(`manifest name has ${manifest.name.length} characters (limit 75)`);
if (manifest.version !== pkg.version) problems.push(`manifest version ${manifest.version} differs from package.json ${pkg.version}`);
if (execFileSync('git', ['status', '--porcelain']).length) problems.push('the working tree has uncommitted changes, which the zip would not include');
if (problems.length) {
  console.error(`Cannot package:\n- ${problems.join('\n- ')}`);
  process.exit(1);
}

fs.mkdirSync('dist', { recursive: true });
const out = `dist/veil-${manifest.version}.zip`;
execFileSync('git', ['archive', '--format=zip', '-o', out, 'HEAD:extension']);
console.log(`Wrote ${out}`);
