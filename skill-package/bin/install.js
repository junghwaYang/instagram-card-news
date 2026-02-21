#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');

const SKILL_NAME = 'card-news-setup';
const HOME = process.env.HOME || process.env.USERPROFILE;
const SKILL_DIR = path.join(HOME, '.claude', 'skills', SKILL_NAME);
const REPO_RAW = 'https://raw.githubusercontent.com/junghwaYang/card-news-setup/main';

function download(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function main() {
  console.log('');
  console.log('  Instagram Card News Generator');
  console.log('  Claude Code Skill Installer');
  console.log('  ─────────────────────────────');
  console.log('');

  fs.mkdirSync(SKILL_DIR, { recursive: true });

  console.log('  Downloading skill...');
  const content = await download(`${REPO_RAW}/SKILL.md`);
  fs.writeFileSync(path.join(SKILL_DIR, 'SKILL.md'), content, 'utf8');

  console.log(`  Installed to: ${SKILL_DIR}/SKILL.md`);
  console.log('');
  console.log('  Done! Now you can use:');
  console.log('');
  console.log('    1. Open Claude Code in an empty folder');
  console.log('    2. Type: /card-news-setup');
  console.log('    3. Wait for the project to be generated');
  console.log('    4. Then: "카드뉴스 만들어줘: AI 트렌드 2025"');
  console.log('');
}

main().catch((err) => {
  console.error('  Installation failed:', err.message);
  process.exit(1);
});
