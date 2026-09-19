import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { calculateDetail, DETAIL_LEVELS } from './detail-rubric.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataPath = path.join(root, 'data', 'cases.json');
const cases = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const required = [
  'id', 'source', 'company', 'industry', 'industry_group', 'scenario', 'fde',
  'problem', 'solution', 'human', 'result', 'maturity', 'maturity_stage', 'url',
  'architecture', 'components', 'fde_actions', 'reusable', 'evidence',
  'evidence_level', 'source_record', 'analysis_boundary', 'verification_notes',
  'detail_score', 'detail_level', 'detail_label', 'detail_dimensions', 'missing_details',
];

const errors = [];
const warnings = [];
const ids = new Set();
const sourceRecordFields = [
  'title', 'publisher', 'url', 'source_type', 'directness',
  'claim_origin', 'independently_verified', 'accessed_at',
];
const boundaryFields = ['business_problem', 'solution', 'architecture', 'fde_actions', 'result'];
const minimumTextLength = { problem: 10, solution: 20, human: 10, result: 10, case_summary: 30 };

for (const [index, item] of cases.entries()) {
  const label = `#${index + 1} ${item.id || '(无 id)'}`;
  for (const field of required) {
    if (item[field] === undefined || item[field] === null || item[field] === '') {
      errors.push(`${label}: 缺少 ${field}`);
    }
  }
  if (ids.has(item.id)) errors.push(`${label}: id 重复`);
  ids.add(item.id);
  if (!/^[a-z0-9-]+$/.test(item.id)) errors.push(`${label}: id 只能包含小写字母、数字和连字符`);
  if (!['A', 'B', 'C', 'D'].includes(item.evidence_level)) {
    errors.push(`${label}: evidence_level 必须是 A/B/C/D`);
  }
  if (!DETAIL_LEVELS.includes(item.detail_level)) errors.push(`${label}: detail_level 非法`);
  if (item.technical_reference !== undefined && typeof item.technical_reference !== 'boolean') {
    errors.push(`${label}: technical_reference 必须是布尔值`);
  }
  if (item.technical_reference === true) {
    if (item.detail_dimensions?.technical_workflow !== 2) {
      errors.push(`${label}: 技术方案参考案例的 technical_workflow 必须为 2`);
    }
    if (item.analysis_boundary?.architecture === '公开信息与编辑推演混合') {
      errors.push(`${label}: 技术方案参考案例不能仅依据编辑推演标记`);
    }
  }
  const expectedDetail = calculateDetail(item);
  if (item.detail_score !== expectedDetail.detail_score || item.detail_level !== expectedDetail.detail_level) {
    errors.push(`${label}: 详细度分类已过期，请运行 npm run classify:detail`);
  }
  if (JSON.stringify(item.detail_dimensions) !== JSON.stringify(expectedDetail.detail_dimensions)) {
    errors.push(`${label}: detail_dimensions 与当前评分规则不一致`);
  }
  if (item.detail_label !== expectedDetail.detail_label) errors.push(`${label}: detail_label 与当前评分规则不一致`);
  if (JSON.stringify(item.missing_details) !== JSON.stringify(expectedDetail.missing_details)) {
    errors.push(`${label}: missing_details 与当前评分规则不一致`);
  }
  if (!/^https:\/\//.test(item.url)) errors.push(`${label}: url 必须使用 https`);
  for (const field of sourceRecordFields) {
    if (item.source_record?.[field] === undefined || item.source_record?.[field] === '') {
      errors.push(`${label}: source_record.${field} 缺失`);
    }
  }
  for (const field of boundaryFields) {
    if (!item.analysis_boundary?.[field]) errors.push(`${label}: analysis_boundary.${field} 缺失`);
  }
  if (item.source_record?.url !== item.url) warnings.push(`${label}: 主 URL 与 source_record.url 不一致`);
  if (typeof item.source_record?.independently_verified !== 'boolean') {
    errors.push(`${label}: independently_verified 必须是布尔值`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(item.source_record?.accessed_at || '')) {
    errors.push(`${label}: accessed_at 必须使用 YYYY-MM-DD`);
  }
  if (item.source_record?.independently_verified === true && !(item.additional_sources?.length > 0)) {
    warnings.push(`${label}: 标记为独立核验，但没有记录补充来源`);
  }
  for (const [field, minLength] of Object.entries(minimumTextLength)) {
    if (String(item[field] || '').trim().length < minLength) {
      errors.push(`${label}: ${field} 过短，至少需要 ${minLength} 个字符`);
    }
  }
  for (const field of ['architecture', 'components', 'fde_actions', 'reusable', 'verification_notes']) {
    if (!Array.isArray(item[field]) || item[field].length === 0) errors.push(`${label}: ${field} 必须是非空数组`);
  }
  if (!Array.isArray(item.additional_sources)) errors.push(`${label}: additional_sources 必须是数组`);
  for (const [sourceIndex, source] of (item.additional_sources || []).entries()) {
    if (!source.title || !/^https:\/\//.test(source.url || '')) {
      errors.push(`${label}: additional_sources[${sourceIndex}] 必须包含标题和 HTTPS 链接`);
    }
  }
}

const urlUsage = new Map();
for (const item of cases) urlUsage.set(item.url, (urlUsage.get(item.url) || 0) + 1);
for (const [url, count] of urlUsage) {
  if (count >= 5) warnings.push(`来源链接被 ${count} 个案例复用：${url}`);
}

if (errors.length) {
  console.error(`数据校验失败（${errors.length} 项）：`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

fs.writeFileSync(
  path.join(root, 'data', 'cases.js'),
  `// 由 npm run build:data 从 data/cases.json 生成，请勿手改。\nwindow.FDE_CASES = ${JSON.stringify(cases)};\n`,
);

const bySource = Object.fromEntries(
  [...new Set(cases.map((item) => item.source))]
    .map((source) => [source, cases.filter((item) => item.source === source).length]),
);
const byEvidence = Object.fromEntries(
  ['A', 'B', 'C', 'D'].map((level) => [level, cases.filter((item) => item.evidence_level === level).length]),
);
const byDetail = Object.fromEntries(
  DETAIL_LEVELS.map((level) => [level, cases.filter((item) => item.detail_level === level).length]),
);
const technicalReferenceCount = cases.filter((item) => item.technical_reference === true).length;

console.log(`校验通过：${cases.length} 条案例`);
console.log(`来源分布：${JSON.stringify(bySource)}`);
console.log(`详细度分布：${JSON.stringify(byDetail)}`);
console.log(`证据等级：${JSON.stringify(byEvidence)}`);
console.log(`技术方案参考：${technicalReferenceCount} 条`);
if (warnings.length) {
  console.warn(`警告（${warnings.length} 项）：`);
  warnings.forEach((warning) => console.warn(`- ${warning}`));
}
