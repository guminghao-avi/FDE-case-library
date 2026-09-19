import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];

const pages = [
  { file: 'index.html', data: 'data/cases.js', languageLink: 'index.en.html' },
  { file: 'index.en.html', data: 'data/cases.en.js', languageLink: 'index.html' },
];

let scriptCount = 0;
for (const page of pages) {
  const html = fs.readFileSync(path.join(root, page.file), 'utf8');
  const requiredSnippets = [
    `<script src="${page.data}"></script>`,
    'const CASES = window.FDE_CASES || [];',
    `href="${page.languageLink}"`,
    'id="evidence"',
    'id="source"',
    'id="industry"',
    'id="detailSegment"',
    'id="modal"',
    'source_record',
  ];

  for (const snippet of requiredSnippets) {
    if (!html.includes(snippet)) errors.push(`${page.file} 缺少关键标记：${snippet}`);
  }

  if (html.indexOf(page.data) > html.indexOf('const CASES = window.FDE_CASES || [];')) {
    errors.push(`${page.file}: ${page.data} 必须在页面逻辑之前加载。`);
  }

  const inlineScripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)];
  scriptCount += inlineScripts.length;
  for (const [index, match] of inlineScripts.entries()) {
    try {
      new vm.Script(match[1], { filename: `${page.file}:inline-script-${index + 1}` });
    } catch (error) {
      errors.push(`${page.file} 内联脚本 ${index + 1} 语法错误：${error.message}`);
    }
  }
}

if (errors.length) {
  console.error(`首页检查失败（${errors.length} 项）：`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`中英文页面检查通过：${scriptCount} 段内联脚本语法有效，关键数据、语言入口与筛选功能齐全。`);
