import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const errors = [];

const requiredSnippets = [
  '<script src="data/cases.js"></script>',
  'const CASES = window.FDE_CASES || [];',
  'id="evidence"',
  'id="source"',
  'id="industry"',
  'id="detailSegment"',
  'id="modal"',
  'source_record',
];

for (const snippet of requiredSnippets) {
  if (!html.includes(snippet)) errors.push(`缺少首页关键标记：${snippet}`);
}

if (html.indexOf('data/cases.js') > html.indexOf('const CASES = window.FDE_CASES || [];')) {
  errors.push('data/cases.js 必须在首页逻辑之前加载。');
}

const inlineScripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)];
for (const [index, match] of inlineScripts.entries()) {
  try {
    new vm.Script(match[1], { filename: `index.html:inline-script-${index + 1}` });
  } catch (error) {
    errors.push(`首页内联脚本 ${index + 1} 语法错误：${error.message}`);
  }
}

if (errors.length) {
  console.error(`首页检查失败（${errors.length} 项）：`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`首页检查通过：${inlineScripts.length} 段内联脚本语法有效，关键数据与筛选入口齐全。`);
