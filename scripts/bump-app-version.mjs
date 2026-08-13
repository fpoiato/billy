#!/usr/bin/env node
/**
 * Bumps APP_VERSION in frontend/js/version.js (patch by default).
 * Usage:
 *   node scripts/bump-app-version.mjs           # 0.1.0 -> 0.1.1
 *   node scripts/bump-app-version.mjs minor     # 0.1.0 -> 0.2.0
 *   node scripts/bump-app-version.mjs major     # 0.1.0 -> 1.0.0
 *   node scripts/bump-app-version.mjs 1.2.3     # set exact
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const file = resolve('frontend/js/version.js');
const source = readFileSync(file, 'utf8');
const match = source.match(/Billy\.APP_VERSION = '(\d+)\.(\d+)\.(\d+)';/);
if (!match) {
  console.error('Could not find Billy.APP_VERSION = \'x.y.z\' in', file);
  process.exit(1);
}

const [, majorS, minorS, patchS] = match;
let major = Number(majorS);
let minor = Number(minorS);
let patch = Number(patchS);

const arg = process.argv[2] ?? 'patch';
if (/^\d+\.\d+\.\d+$/.test(arg)) {
  [major, minor, patch] = arg.split('.').map(Number);
} else if (arg === 'major') {
  major += 1;
  minor = 0;
  patch = 0;
} else if (arg === 'minor') {
  minor += 1;
  patch = 0;
} else if (arg === 'patch') {
  patch += 1;
} else {
  console.error('Unknown bump kind:', arg);
  process.exit(1);
}

const next = `${major}.${minor}.${patch}`;
const updated = source.replace(
  /Billy\.APP_VERSION = '\d+\.\d+\.\d+';/,
  `Billy.APP_VERSION = '${next}';`,
);
writeFileSync(file, updated);
console.log(`APP_VERSION -> ${next}`);
