const quantifiedPattern = /(?:\d[\d,.]*\s*(?:%|倍|万|亿|小时|分钟|天|周|月|年|人|家|个|条|美元|英镑|欧元|新元|SGD|USD|M|B)|[$€£]\s*\d)/i;

const textScore = (value, full, partial) => {
  const length = String(value || '').trim().length;
  if (length >= full) return 2;
  if (length >= partial) return 1;
  return 0;
};

export function calculateDetail(item) {
  const dimensions = {
    business_context: textScore(item.problem, 50, 25),
    solution_workflow: textScore(item.solution, 60, 30),
    technical_workflow:
      (item.architecture?.length >= 6 && item.components?.length >= 5) ? 2 :
      (item.architecture?.length >= 4 ? 1 : 0),
    human_governance:
      (String(item.human || '').length >= 35 && item.fde_actions?.length >= 5) ? 2 :
      (String(item.human || '').length >= 18 ? 1 : 0),
    measured_outcome: quantifiedPattern.test(item.result || '') ? 2 :
      (String(item.result || '').trim().length >= 20 ? 1 : 0),
    source_traceability: item.evidence_level === 'A' ? 2 :
      (['B', 'C'].includes(item.evidence_level) ? 1 : 0),
  };
  const score = Object.values(dimensions).reduce((sum, value) => sum + value, 0);
  const level = score >= 10 ? 'deep' : score >= 7 ? 'standard' : 'overview';
  const labels = {
    deep: '深度案例｜关键链路较完整',
    standard: '标准案例｜可参考但仍有缺口',
    overview: '概览案例｜作为线索使用',
  };
  const names = {
    business_context: '业务背景', solution_workflow: '改造流程',
    technical_workflow: '技术工作流', human_governance: '人机与治理',
    measured_outcome: '量化结果', source_traceability: '来源可定位性',
  };
  return {
    detail_score: score,
    detail_level: level,
    detail_label: labels[level],
    detail_dimensions: dimensions,
    missing_details: Object.entries(dimensions)
      .filter(([, value]) => value < 2)
      .map(([key]) => names[key]),
  };
}

export const DETAIL_LEVELS = ['deep', 'standard', 'overview'];
