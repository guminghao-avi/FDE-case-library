import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pdfBase = 'https://assets.datawhale.cn/Datawhale%20FDE%E6%A1%88%E4%BE%8B100.pdf';

// `pdfPage` is the physical PDF page used by #page=. The printed page number
// shown in the PDF is one lower because the document has an unnumbered cover.
const entries = {
  'datawhale-001': { no: 1, printedPage: 6, pdfPage: 7, webCase: 'cases-009', zh: '从师徒带教到AI辅助培训：FDE用AI破解制造业经验传承难题', en: 'From master-apprentice coaching to AI-assisted training' },
  'datawhale-005': { no: 2, printedPage: 14, pdfPage: 15, webCase: 'cases-007', zh: '从人工审材料到自动化办件：FDE用AI提升车管所网办效率', en: 'From manual document review to automated vehicle-service processing' },
  'datawhale-008': { no: 3, printedPage: 24, pdfPage: 25, webCase: 'cases-001', zh: '从案头工作到智能协作：FDE用AI优化诉讼律师的案件处理能力', en: 'From desk work to intelligent collaboration for litigation teams' },
  'datawhale-006': { no: 4, printedPage: 33, pdfPage: 34, webCase: 'cases-008', zh: '从人工研判到智能调度：FDE用AI重构城市规划研判流程', en: 'From manual analysis to intelligent urban-planning coordination' },
  'datawhale-014': { no: 5, printedPage: 46, pdfPage: 47, webCase: 'cases-013', zh: '从大海捞针到全链路提效：FDE用AI重构TikTok达人建联与履约', en: 'AI-assisted TikTok creator discovery, outreach, and fulfillment' },
  'datawhale-012': { no: 6, printedPage: 55, pdfPage: 56, webCase: 'cases-010', zh: '从经验装车到智能规划：FDE用AI优化跨境物流装载效率', en: 'From experience-based loading to intelligent cross-border logistics planning' },
  'datawhale-022': { no: 7, printedPage: 67, pdfPage: 68, webCase: 'cases-017', zh: '从个人提效到组织能力：FDE用AI推动企业研发转型', en: 'From individual productivity to organization-wide R&D capability' },
  'datawhale-002': { no: 8, printedPage: 76, pdfPage: 77, webCase: 'cases-024', zh: '从物料难找到精准定位：FDE用AI减少工业企业采购浪费', en: 'From hard-to-find materials to precise industrial procurement matching' },
  'datawhale-009': { no: 9, printedPage: 86, pdfPage: 87, webCase: 'cases-018', zh: '从“表哥表姐”到智能执行：FDE用AI重构央国企财务流程效率', en: 'From spreadsheet-heavy work to intelligent public-enterprise finance execution' },
  'datawhale-010': { no: 10, printedPage: 95, pdfPage: 96, webCase: 'cases-015', zh: '从人工核对到智能对账：FDE用AI让线下零售对账又快又准', en: 'From manual checks to intelligent reconciliation for offline retail' },
  'datawhale-015': { no: 11, printedPage: 105, pdfPage: 106, webCase: 'cases-004', zh: '从文件散乱到随取随用：FDE用AI帮外贸企业把资料变成可用资产', en: 'Turning scattered foreign-trade files into reusable business assets' },
  'datawhale-016': { no: 12, printedPage: 118, pdfPage: 119, webCase: 'cases-021', zh: '从人工盯图到公司级生产：FDE用AI重塑鞋服电商素材工作流', en: 'From manual image review to company-scale fashion e-commerce content production' },
  'datawhale-007': { no: 13, printedPage: 128, pdfPage: 129, webCase: 'cases-011', zh: '从纸质流程到数据驱动：FDE用AI推动传统消防维保企业数字化转型', en: 'From paper processes to data-driven fire-maintenance operations' },
  'datawhale-021': { no: 14, printedPage: 135, pdfPage: 136, webCase: 'cases-014', zh: '从技术交付到业务自驱：FDE用AI推动国企工作流程真正落地', en: 'From technical delivery to business-owned AI workflows in a state-owned enterprise' },
  'datawhale-017': { no: 15, printedPage: 145, pdfPage: 146, webCase: 'cases-003', zh: '从经验写稿到稳定量产：FDE用AI重构本地生活短视频内容生产', en: 'From experience-based writing to scaled local-services video production' },
  'datawhale-019': { no: 16, printedPage: 157, pdfPage: 158, webCase: 'cases-005', zh: '从人工分析到分钟级洞察：FDE用AI重构电信网络数据分析', en: 'From manual analysis to minute-level telecom-network insight' },
  'datawhale-003': { no: 17, printedPage: 165, pdfPage: 166, webCase: 'cases-019', zh: '从老师傅报价到AI深度协同：FDE用AI重构非标制造售前链路', en: 'AI collaboration for non-standard manufacturing presales and quotation' },
  'datawhale-020': { no: 18, printedPage: 177, pdfPage: 178, webCase: 'cases-020', zh: '从纸质台账到AI经营：一家生物科技上市公司的0帧起手数智化', en: 'From paper ledgers to AI-assisted operations at a listed biotech company' },
  'datawhale-024': { no: 19, printedPage: 185, pdfPage: 186, webCase: 'cases-023', zh: '从人工排队到审核前置：FDE用AI重构消费品研发协同与包装审核', en: 'AI-assisted consumer-product R&D collaboration and packaging review' },
  'datawhale-023': { no: 20, printedPage: 196, pdfPage: 197, webCase: 'cases-022', zh: '从看不清订单到看清经营：FDE用AI让制造企业的经营流程更透明', en: 'Using AI to make manufacturing order and operating workflows transparent' },
  'datawhale-018': { no: 21, printedPage: 206, pdfPage: 207, webCase: 'cases-002', zh: '从人工绘图到智能协作：FDE用AI重塑建筑图纸交付流程', en: 'From manual drafting to intelligent collaboration in architectural delivery' },
  'datawhale-013': { no: 22, printedPage: 215, pdfPage: 216, webCase: 'cases-012', zh: '从库存割裂到业务联动：FDE用AI打通跨境电商的库存、补货与广告决策', en: 'Connecting inventory, replenishment, and advertising decisions in cross-border e-commerce' },
  'datawhale-004': { no: 23, printedPage: 225, pdfPage: 226, webCase: 'cases-006', zh: '从老板报价到长尾承接：FDE用AI打通工程租赁获客与报价', en: 'Using AI to support long-tail lead intake and quotation in equipment rental' },
  'datawhale-011': { no: 24, printedPage: 233, pdfPage: 234, webCase: 'cases-016', zh: '从发货到动销：FDE用AI打通跨境快消的海外数据断层', en: 'Using AI to connect overseas sell-in and sell-through data for consumer goods' },
};

const updateFile = (filename, language) => {
  const dataPath = path.join(root, 'data', filename);
  const cases = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const found = new Set();

  const updated = cases.map((item) => {
    const entry = entries[item.id];
    if (!entry) return item;
    if (item.source !== 'Datawhale') throw new Error(`${item.id}: expected Datawhale source`);
    found.add(item.id);

    const pdfUrl = `${pdfBase}#page=${entry.pdfPage}`;
    const webUrl = `https://fde100.datawhale.cn/cases/${entry.webCase}`;
    const webTitle = language === 'zh'
      ? `Datawhale FDE100 单案例网页｜NO.${String(entry.no).padStart(2, '0')}`
      : `Datawhale FDE100 case webpage | No. ${entry.no}`;
    const collectionTitle = language === 'zh'
      ? `Datawhale FDE案例100｜NO.${String(entry.no).padStart(2, '0')} ${entry.zh}`
      : `Datawhale FDE Case 100 | No. ${entry.no}: ${entry.en}`;

    const additionalSources = [
      { title: webTitle, url: webUrl },
      ...(item.additional_sources || []).filter((source) => source.url !== webUrl && !source.url.startsWith(pdfBase)),
    ];

    return {
      ...item,
      url: pdfUrl,
      source_record: {
        ...item.source_record,
        title: collectionTitle,
        url: pdfUrl,
        source_type: language === 'zh' ? '官方案例合集 PDF' : 'Official case collection PDF',
        collection_title: language === 'zh' ? 'Datawhale FDE案例100' : 'Datawhale FDE Case 100',
        case_number: entry.no,
        printed_page: entry.printedPage,
        pdf_page: entry.pdfPage,
      },
      additional_sources: additionalSources,
    };
  });

  const missing = Object.keys(entries).filter((id) => !found.has(id));
  if (missing.length) throw new Error(`${filename}: missing Datawhale cases: ${missing.join(', ')}`);
  if (found.size !== 24) throw new Error(`${filename}: expected 24 Datawhale cases, found ${found.size}`);

  fs.writeFileSync(dataPath, `${JSON.stringify(updated, null, 2)}\n`);
  console.log(`${filename}: linked ${found.size} Datawhale cases to exact PDF pages`);
};

updateFile('cases.json', 'zh');
updateFile('cases.en.json', 'en');
