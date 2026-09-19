import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const legacyPath = path.join(root, 'fde_case_library_100.html');
const dataPath = path.join(root, 'data', 'cases.json');
const force = process.argv.includes('--force');
const rewriteIndex = process.argv.includes('--rewrite-index');

if (fs.existsSync(dataPath) && !force) {
  throw new Error('data/cases.json 已存在。迁移脚本只用于首次导入；如确需重建数据，请显式传入 --force。');
}
const legacyHtml = fs.readFileSync(legacyPath, 'utf8');
const casesMatch = legacyHtml.match(/const CASES = (\[.*?\]);\s*\/\/ Global/s);

if (!casesMatch) {
  throw new Error('无法从旧版 HTML 中找到 CASES 数据。');
}

const legacyCases = JSON.parse(casesMatch[1]);
const accessedAt = '2026-09-19';

const datawhaleSources = {
  '匿名律师团队|诉讼检索 / 证据梳理 / 文书初稿': ['cases-001', '诉讼律师案件智能工作台'],
  '匿名建筑设计企业|图纸理解与交付辅助': ['cases-002', '建筑消防施工图智能生成'],
  '匿名本地生活企业|门店短视频内容工厂': ['cases-003', '本地生活短视频内容AI生产实践'],
  '匿名外贸企业|邮件、报价与产品资料自动化': ['cases-004', '跨境电商AI工作流矩阵'],
  '匿名电信企业|网络数据分析 / 智能问数': ['cases-005', '从人工分析到分钟级洞察：AI重构电信网络数据分析'],
  '匿名工程租赁企业|长尾需求承接 / 产品匹配': ['cases-006', '从老板报价到长尾承接：AI打通工程租赁获客与报价'],
  '匿名车管所|网上业务材料预审': ['cases-007', '从人工审材料到自动化办件：用 AI 提升车管所网办效率'],
  '匿名城市规划机构|城市规划研判': ['cases-008', '从人工研判到智能调度：AI重构城市规划编制流程'],
  '匿名德国零部件企业|老师傅经验传承 / 新人培训': ['cases-009', '从师徒带教到 AI 辅助培训：AI 破解制造业经验传承难题'],
  '匿名跨境物流企业|集装箱装载优化': ['cases-010', '跨境物流智能装车规划'],
  '匿名消防维保企业|纸质记录数字化 / 维保报告': ['cases-011', '消防维保流程数字化提效'],
  '匿名跨境电商企业|库存与补货': ['cases-012', '跨境电商库存补货与广告联动实践'],
  '匿名TikTok电商团队|达人筛选与建联': ['cases-013', 'TikTok达人建联与履约协同实践'],
  '匿名线下零售企业|门店对账': ['cases-015', '线下零售门店智能对账'],
  '匿名跨境快消企业|Sell-in / Sell-through经营分析': ['cases-016', '跨境快消海外市场数据流转'],
  '匿名央国企|财务流程自动化': ['cases-018', '央国企财务流程AI化'],
  '匿名非标制造企业|售前方案与报价': ['cases-019', '用AI重构非标制造售前链路'],
  '匿名生物科技企业|经营台账数字化': ['cases-020', '从纸质台账到AI经营：一家生物科技上市公司的0帧起手数智化'],
  '匿名鞋服电商企业|商品图片与文案生产': ['cases-021', 'AI重塑鞋服电商素材工作流'],
  '匿名工业企业|工业采购 / 物料定位': ['cases-024', '从物料难找到精准定位：用 AI 减少工业企业采购浪费'],
};

const industryGroup = (industry) => {
  if (/医疗|生命|医药/.test(industry)) return '医疗与生命科学';
  if (/金融|资产管理|保险/.test(industry)) return '金融与保险';
  if (/政府|政务|公共服务|农业/.test(industry)) return '政务与公共服务';
  if (/零售|电商|消费品|餐饮|食品/.test(industry)) return '零售与消费';
  if (/航空|铁路|物流|交通|汽车平台|旅行/.test(industry)) return '交通、旅行与物流';
  if (/能源|油气|公用事业|矿业/.test(industry)) return '能源与公用事业';
  if (/制造|工业|材料|电池|建材|电子|汽车/.test(industry)) return '制造与工业';
  if (/法律|建筑|工程|CRO/.test(industry)) return '专业服务';
  if (/媒体|营销|内容|赛车|体育/.test(industry)) return '媒体、营销与体育';
  if (/科技|软件|SaaS|互联网|网络安全|AI开发|IT服务|企业软件/.test(industry)) return '科技与软件';
  return '企业运营与其他';
};

const maturityStage = (maturity) => {
  if (/规模|大规模|行业级/.test(maturity)) return '规模化';
  if (/生产|已落地|见成效/.test(maturity)) return '已上线';
  if (/POC|验证|部署中/.test(maturity)) return '验证阶段';
  return '未明确';
};

const genericOfficialUrls = new Set([
  'https://www.palantir.com/',
  'https://www.palantir.com/new-homepage/',
  'https://openai.com/stories/',
  'https://openai.com/business/customer-stories/',
  'https://openai.com/business/why-openai/enterprises/',
  'https://openai.com/business/guides-and-resources/the-state-of-enterprise-ai-2025-report/',
]);

const publisherFor = (source) => source === 'Datawhale' ? 'Datawhale FDE100' : source;

const enrichCase = (item, sourceIndex) => {
  const originalUrl = item.url;
  const key = `${item.company}|${item.scenario}`;
  const officialDatawhale = item.source === 'Datawhale' ? datawhaleSources[key] : null;
  const url = officialDatawhale
    ? `https://fde100.datawhale.cn/cases/${officialDatawhale[0]}`
    : originalUrl;
  const isGenericOfficial = genericOfficialUrls.has(url);
  const evidenceLevel = isGenericOfficial ? 'B' : 'A';
  const relation = {
    '明确FDE': '明确FDE',
    '典型Forward Deployed': '典型前向部署模式',
    '企业部署案例': '企业部署案例',
    '伴随式部署': '伴随式部署',
    '明确FDE/伴随式部署': '明确FDE与伴随式部署',
  }[item.fde] || item.fde;
  const explicitFde = item.source === 'Datawhale';
  const sourceTitle = officialDatawhale?.[1] || `${item.company}：${item.scenario}`;

  return {
    id: `${item.source.toLowerCase()}-${String(sourceIndex + 1).padStart(3, '0')}`,
    ...item,
    url,
    industry_group: industryGroup(item.industry),
    maturity_stage: maturityStage(item.maturity),
    fde_relation: relation,
    evidence_level: evidenceLevel,
    evidence_label: evidenceLevel === 'A' ? 'A级｜案例级直接来源' : 'B级｜官方汇总来源',
    source_record: {
      title: sourceTitle,
      publisher: publisherFor(item.source),
      url,
      source_type: explicitFde ? '经发布方审核的脱敏案例' : '厂商官方客户材料',
      directness: evidenceLevel === 'A' ? '案例级直接来源' : '汇总页或多案例报告',
      claim_origin: explicitFde ? '案例发布方披露' : '厂商或客户公开披露',
      independently_verified: false,
      accessed_at: accessedAt,
    },
    analysis_boundary: {
      business_problem: '基于公开材料概括',
      solution: '基于公开材料概括',
      architecture: explicitFde ? '公开信息与编辑推演混合' : '公开信息与编辑推演混合',
      fde_actions: explicitFde ? '访谈信息与编辑归纳混合' : 'FDE视角编辑推演',
      result: explicitFde ? '案例发布方披露' : '厂商或客户披露',
    },
    verification_notes: [
      item.evidence,
      evidenceLevel === 'A'
        ? '来源可直接定位到该案例；数值仍属于来源方披露，不代表独立审计。'
        : '当前链接为官方汇总入口，尚需补充可直接定位该案例的深链接或页码。',
    ],
    additional_sources: originalUrl !== url
      ? [{ title: '旧版使用的二次整理或汇总来源', url: originalUrl }]
      : [],
  };
};

const counters = new Map();
const cases = legacyCases.map((item) => {
  const index = counters.get(item.source) || 0;
  counters.set(item.source, index + 1);
  return enrichCase(item, index);
});

const addedDatawhaleCases = [
  {
    id: 'datawhale-021',
    source: 'Datawhale',
    company: '匿名省属国企电商子公司',
    industry: '零售/电商',
    industry_group: '零售与消费',
    scenario: '多业务线AI工作流与组织能力建设',
    fde: '明确FDE',
    fde_relation: '明确FDE',
    problem: '多条电商业务线持续增长，但法务、财务、内控等专业岗位受编制限制；大量审核经验存在员工脑中，已有AI底座也没有真正进入业务工作流。',
    solution: '先由知识萃取师梳理岗位隐性知识与流程，再建设包含知识库、多模型调度、Agent编排和MCP接口的统一AI平台，按法务、财务、行政等场景逐步落地Agent，并通过培训建立业务团队的自我迭代能力。',
    human: 'AI负责合同初筛、票据核对等重复工作；法务、财务及业务人员保留最终确认和责任。',
    result: 'Datawhale审核案例称，法务场景可节省1个法务编制，整体覆盖法务、财务、人事、业务、技术等约10人/年的用工成本。',
    maturity: '已落地/扩展中',
    maturity_stage: '已上线',
    url: 'https://fde100.datawhale.cn/cases/cases-014',
    architecture: ['OA / ERP / 数据中台与岗位知识', '知识萃取与隐性流程显性化', '统一AI平台：知识库、多模型、Agent编排、MCP', '法务/财务/行政场景Agent', 'AI初筛与执行，人最终确认', '培训、使用反馈与新知识持续沉淀'],
    components: ['企业知识库', '多模型调度', 'Agent编排', 'MCP/业务系统接口', 'OA/ERP', 'Human-in-the-loop'],
    fde_actions: ['进入法务、财务、运营等岗位梳理隐性流程', '把专家经验转成规则、例外与人工升级条件', '复用现有OA、ERP和数据中台，不重造业务系统', '按场景构建Agent并明确人机责任边界', '推动人事与业务部门参与培训和采用运营'],
    reusable: ['AI底座上线不等于业务采用', '知识萃取和流程梳理应早于Agent开发', '企业AI转型需要业务、人事和IT共同负责', '以窄场景验证价值，再扩展Agent矩阵'],
    evidence: 'Datawhale FDE100审核通过的脱敏案例，公开了组织背景、解决方案和效果口径；未提供独立审计材料。',
    case_summary: '这个案例最值得参考的是：项目没有停在统一AI平台，而是把岗位知识萃取、场景Agent和组织培训放进同一条落地链路。',
    evidence_level: 'A',
    evidence_label: 'A级｜案例级直接来源',
    source_record: { title: '国企电商AI工作流落地', publisher: 'Datawhale FDE100', url: 'https://fde100.datawhale.cn/cases/cases-014', source_type: '经发布方审核的脱敏案例', directness: '案例级直接来源', claim_origin: '案例发布方披露', independently_verified: false, accessed_at: accessedAt },
    analysis_boundary: { business_problem: '公开页面披露', solution: '公开页面披露', architecture: '依据公开方案结构化整理', fde_actions: '依据公开页面归纳', result: '案例发布方披露' },
    verification_notes: ['页面标记为 VERIFIED CASE / 审核通过。', '效果数字属于案例发布方披露，不代表独立审计。'],
    additional_sources: [],
  },
  {
    id: 'datawhale-022',
    source: 'Datawhale',
    company: '匿名头部基金公司',
    industry: '金融',
    industry_group: '金融与保险',
    scenario: 'AI Coding研发团队转型',
    fde: '明确FDE',
    fde_relation: '明确FDE',
    problem: '开发人员已经各自使用AI Coding工具，但工具、方法和能力标准不统一，传统PRD与角色分工也没有适应AI协作，个人提效无法变成组织能力。',
    solution: '构建面向AI Coding的Spec文档体系，重新定义产品、前后端、测试和运维的输入输出；用五天半线下深度实践边培训边诊断，并分阶段扩展到产品经理和管理者。',
    human: 'AI承担代码与文档生成、分析和执行；研发人员保留架构、评审、测试、合并与生产责任。',
    result: 'Datawhale审核案例称，写代码时间节省约三分之一，写文档时间节省50%以上。',
    maturity: '已落地/持续迭代',
    maturity_stage: '已上线',
    url: 'https://fde100.datawhale.cn/cases/cases-017',
    architecture: ['真实研发任务与现有协作流程', '团队能力与工具使用基线诊断', 'Spec文档体系与角色输入输出', 'AI Coding工具进入开发循环', '编译、测试、Review和生产约束', '复盘形成企业自己的协作规范'],
    components: ['Codex/Claude Code等AI Coding工具', 'Spec文档', '代码仓库', '测试与Review', '分角色培训', '组织采用机制'],
    fde_actions: ['现场验证团队真实AI Coding水平', '识别个人习惯与团队统一之间的冲突', '与客户共创Spec文档而非照搬模板', '按老板、研发、产品和HR设计不同目标', '分三期迭代培训内容与协作方式'],
    reusable: ['AI Coding转型不是单次工具培训', '先定义角色输入输出，再统一工具', '用真实项目验证方法而非只看课程完成率', '把个人经验沉淀成团队可执行的Spec'],
    evidence: 'Datawhale FDE100审核通过的脱敏案例，公开了五天半实践方式、Spec体系及时间节省口径；未提供独立审计材料。',
    case_summary: '这个案例展示了AI Coding从个人工具走向团队研发制度时，真正需要重构的是文档、角色边界和协作流程。',
    evidence_level: 'A', evidence_label: 'A级｜案例级直接来源',
    source_record: { title: '基金公司AI Coding研发转型', publisher: 'Datawhale FDE100', url: 'https://fde100.datawhale.cn/cases/cases-017', source_type: '经发布方审核的脱敏案例', directness: '案例级直接来源', claim_origin: '案例发布方披露', independently_verified: false, accessed_at: accessedAt },
    analysis_boundary: { business_problem: '公开页面披露', solution: '公开页面披露', architecture: '依据公开方案结构化整理', fde_actions: '依据公开页面归纳', result: '案例发布方披露' },
    verification_notes: ['页面标记为 VERIFIED CASE / 审核通过。', '效果数字属于案例发布方披露，不代表独立审计。'],
    additional_sources: [],
  },
  {
    id: 'datawhale-023',
    technical_reference: true,
    source: 'Datawhale',
    company: '匿名汽车零部件供应链企业',
    industry: '制造业',
    industry_group: '制造与工业',
    scenario: '制造经营流程透明化与异常闭环',
    fde: '明确FDE', fde_relation: '明确FDE',
    problem: '订单、采购、库存、发货和回款数据虽然都在ERP中，但没有按经营逻辑串联；真实业务偏差难以表达，异常依赖人工发现，老板仍需到处问人。',
    solution: '保留原ERP作为交易系统，只读同步到业务镜像库，以订单为主线重构业务链路；用AI和规则完成关系匹配与异常识别，通过经营看板和飞书卡片让异常主动上浮。',
    human: '系统负责关联、校验和异常提示；采购、生产、财务和管理者处理例外并承担业务决策责任。',
    result: '形成订单全链路穿透、异常主动提醒和经营看板；Datawhale公开页面未披露统一量化收益。',
    maturity: '已落地/演示中', maturity_stage: '已上线',
    url: 'https://fde100.datawhale.cn/cases/cases-022',
    architecture: ['管家婆ERP中的订单/采购/库存/发货/回款数据', '只读同步到独立业务镜像库', '以订单为主线重构业务关系', 'AI与规则完成匹配、核对和异常识别', '经营看板与飞书异常卡片', '人工处置结果回写异常闭环'],
    components: ['ERP只读同步', '业务镜像库', '数据关系匹配', '规则/AI异常识别', '经营看板', '飞书通知'],
    fde_actions: ['跟随真实订单识别ERP标准流程与现场事实的偏差', '保留原ERP并设计只读集成边界', '统一订单、采购、库存、发货和回款关系', '把管理者提问转成异常规则与责任节点', '设计正常自动流转、异常主动上浮的闭环'],
    reusable: ['企业已有数据不等于已经看清经营', '先做只读镜像可降低替换核心系统的风险', '看板应展示可行动异常而不只是汇总数字', '按业务对象串联数据比按系统模块展示更有效'],
    evidence: 'Datawhale FDE100审核通过的脱敏案例，公开了业务流程、只读集成与异常闭环方案；未披露统一量化收益。',
    case_summary: '这个案例的核心不是再造ERP，而是在不干扰原交易系统的前提下，把分散数据重组为可追责、可处置的经营链路。',
    evidence_level: 'A', evidence_label: 'A级｜案例级直接来源',
    source_record: { title: '制造企业经营流程透明化', publisher: 'Datawhale FDE100', url: 'https://fde100.datawhale.cn/cases/cases-022', source_type: '经发布方审核的脱敏案例', directness: '案例级直接来源', claim_origin: '案例发布方披露', independently_verified: false, accessed_at: accessedAt },
    analysis_boundary: { business_problem: '公开页面披露', solution: '公开页面披露', architecture: '依据公开方案结构化整理', fde_actions: '依据公开页面归纳', result: '案例发布方披露' },
    verification_notes: ['页面标记为 VERIFIED CASE / 审核通过。', '公开页面未给统一量化结果。'],
    additional_sources: [],
  },
  {
    id: 'datawhale-024',
    technical_reference: true,
    source: 'Datawhale',
    company: '匿名食品消费品企业',
    industry: '消费品/食品',
    industry_group: '零售与消费',
    scenario: '产品研发协同与包装智能审核',
    fde: '明确FDE', fde_relation: '明确FDE',
    problem: '企业每年开发100多个SKU，包装审核涉及设计、法规、渠道和产品经理多方，重复检查形成排队瓶颈；研发与渠道经验分散在人脑和多个系统中。',
    solution: '把包装审核拆成OCR/VLM理解、确定性规则代码、历史经验和人工判断四层；让Agent进入业务群持续识别问题并沉淀上下文，同时培养业务Builder自行搭建工作流。',
    human: 'AI预审错字、法规、NRV计算和渠道历史规则；产品经理、设计师及法规人员保留审美、定位、合规和最终发布责任。',
    result: '形成包装预审、产品生命周期知识沉淀和业务Builder培养方案；Datawhale公开页面未披露统一量化收益。',
    maturity: '落地/持续迭代', maturity_stage: '已上线',
    url: 'https://fde100.datawhale.cn/cases/cases-023',
    architecture: ['产品需求、配方、设计稿、法规与渠道规则', 'OCR/VLM解析包装内容', '确定性脚本校验错字、法规与NRV计算', '历史驳回与渠道反馈形成经验库', 'AI预审后由专业人员判断', '结果、整改闭环与新经验持续沉淀'],
    components: ['OCR/VLM', '规则代码', '知识库', 'Agent/Skill/Workflow', '业务群上下文', 'Human-in-the-loop'],
    fde_actions: ['拆解包装审核中的确定性检查和专业判断', '把Agent放入业务群观察真实协作两到三周', '将驳回、整改和渠道反馈沉淀为规则', '设计AI架构师与AI HRBP双重角色', '通过黑客松培养业务人员成为Builder'],
    reusable: ['高风险审核应让规则、模型和人分层负责', '让Agent观察真实协作可补足访谈遗漏', '把每次驳回变成下一次预审的上下文', '组织自我造血能力比一次性交付更重要'],
    evidence: 'Datawhale FDE100审核通过的脱敏案例，公开了分层审核、Agent进群与Builder培养方案；未披露统一量化收益。',
    case_summary: '这个案例把包装审核从多人排队检查改成AI前置预审，并把每次驳回和整改转化为下一次可复用的组织知识。',
    evidence_level: 'A', evidence_label: 'A级｜案例级直接来源',
    source_record: { title: '从人工排队到审核前置：AI重构消费品研发协同与包装审核', publisher: 'Datawhale FDE100', url: 'https://fde100.datawhale.cn/cases/cases-023', source_type: '经发布方审核的脱敏案例', directness: '案例级直接来源', claim_origin: '案例发布方披露', independently_verified: false, accessed_at: accessedAt },
    analysis_boundary: { business_problem: '公开页面披露', solution: '公开页面披露', architecture: '依据公开方案结构化整理', fde_actions: '依据公开页面归纳', result: '案例发布方披露' },
    verification_notes: ['页面标记为 VERIFIED CASE / 审核通过。', '公开页面未给统一量化结果。'],
    additional_sources: [],
  },
];

cases.splice(20, 0, ...addedDatawhaleCases);

const dataDir = path.join(root, 'data');
fs.mkdirSync(dataDir, { recursive: true });
fs.writeFileSync(path.join(dataDir, 'cases.json'), `${JSON.stringify(cases, null, 2)}\n`);
fs.writeFileSync(path.join(dataDir, 'cases.js'), `// 由 npm run build:data 从 data/cases.json 生成，请勿手改。\nwindow.FDE_CASES = ${JSON.stringify(cases)};\n`);

let indexHtml = legacyHtml
  .replace('<title>FDE 企业 AI 落地案例库 ｜ Datawhale × Palantir × OpenAI</title>', '<title>企业 AI 落地案例库｜用 FDE 视角拆解</title>')
  .replace('按公司、行业和部署方式整理 Datawhale、Palantir 与 OpenAI 100个企业AI落地案例，深度拆解技术架构、FDE动作、人机边界与可复用方法。', '开放、可追溯的企业 AI 落地案例库。区分公开事实、来源方披露与 FDE 视角分析。')
  .replace('const CASES = ' + casesMatch[1] + ';', 'const CASES = window.FDE_CASES || [];')
  .replace('  <!-- Data and Client Logic -->\n  <script>', '  <!-- Data and Client Logic -->\n  <script src="data/cases.js"></script>\n  <script>');

const indexPath = path.join(root, 'index.html');
if (!fs.existsSync(indexPath) || rewriteIndex) {
  fs.writeFileSync(indexPath, indexHtml);
} else {
  console.log('保留现有 index.html；如确需从旧版重建，请显式传入 --rewrite-index。');
}
console.log(`已迁移 ${legacyCases.length} 条旧案例并补入 ${addedDatawhaleCases.length} 条官方案例，共 ${cases.length} 条。`);
