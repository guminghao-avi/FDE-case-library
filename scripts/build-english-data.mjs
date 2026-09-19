import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const zhPath = path.join(root, 'data', 'cases.json');
const enPath = path.join(root, 'data', 'cases.en.json');
const jsPath = path.join(root, 'data', 'cases.en.js');

const zhCases = JSON.parse(fs.readFileSync(zhPath, 'utf8'));
const enCases = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const zhIds = zhCases.map((item) => item.id);
const enIds = enCases.map((item) => item.id);

if (zhCases.length !== enCases.length) {
  throw new Error(`中英文案例数量不一致：${zhCases.length} / ${enCases.length}`);
}
if (JSON.stringify(zhIds) !== JSON.stringify(enIds)) {
  throw new Error('中英文案例 ID 或顺序不一致');
}

for (const [index, item] of enCases.entries()) {
  for (const field of ['id', 'company', 'scenario', 'problem', 'solution', 'human', 'result', 'case_summary']) {
    if (!item[field] || String(item[field]).trim().length < 2) {
      throw new Error(`#${index + 1} ${item.id || '(missing id)'}: English field ${field} is missing`);
    }
  }
}

fs.writeFileSync(
  jsPath,
  `// Generated from data/cases.en.json by npm run build:data. Do not edit directly.\nwindow.FDE_CASES = ${JSON.stringify(enCases)};\n`,
);
console.log(`英文数据校验通过：${enCases.length} 条案例`);
