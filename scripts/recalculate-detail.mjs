import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { calculateDetail } from './detail-rubric.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataPath = path.join(root, 'data', 'cases.json');
const cases = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const classified = cases.map((item) => ({ ...item, ...calculateDetail(item) }));

fs.writeFileSync(dataPath, `${JSON.stringify(classified, null, 2)}\n`);
const counts = Object.fromEntries(
  ['deep', 'standard', 'overview'].map((level) => [level, classified.filter((item) => item.detail_level === level).length]),
);
console.log(`已按详细度重新分类 ${classified.length} 条案例：${JSON.stringify(counts)}`);
