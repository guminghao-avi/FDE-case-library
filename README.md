# 企业 AI 落地案例库

[简体中文](#企业-ai-落地案例库) · [English](#enterprise-ai-case-library)

一个面向公开学习和检索的企业 AI 部署案例库。项目不只收集“用了什么模型”，而是尽量还原：

> 业务问题 → 现场发现与方案设计 → 技术工作流 → 人机责任边界 → 上线与采用 → 业务结果 → 可复用经验

![企业 AI 落地案例库中文首页](docs/images/home-zh.png)

*截图摄于 2026-09-19，显示当时的 123 条案例；当前数量以页面和下方统计为准。*

带有 `⚙ 技术方案` 小标识的案例，是从深度案例中进一步筛出的实施参考模板：技术组件和工作流有案例级公开材料支持，不只是编辑推演。当前共有 **18 条**。

当前收录 **127 条**案例。首页首先按案例详细程度分为：

- 深度案例：35 条
- 标准案例：77 条
- 概览案例：15 条

来源包括：

- [Datawhale《FDE案例100》官方 PDF](https://assets.datawhale.cn/Datawhale%20FDE%E6%A1%88%E4%BE%8B100.pdf)：24 条，案例主链接可直接跳到对应 PDF 页
- Palantir 客户部署案例：45 条
- OpenAI 客户部署案例：34 条
- 企业年报、投资者材料、工程博客与内部项目复盘：16 条
- IBM、Microsoft、AWS、Google Cloud 逐案例材料：8 条

近期补充的深度案例包括 [拜耳 PRINCE](https://martinfowler.com/articles/reliable-llm-bayer.html)、[Nubank 客服 Agent](https://arxiv.org/html/2606.08867)、[Meta 专家知识系统](https://engineering.fb.com/2026/09/02/ml-applications/organizational-second-brain-ai-learns-from-experts/) 和 [Doctolib AI 平台](https://medium.com/doctolib/from-one-ai-product-to-an-ai-factory-e6337ffa75d9)。它们都披露了实施过程，但效果数字主要来自项目参与者；案例卡片逐条记录对照基线、上线范围和未公开信息。

## 最重要的阅读边界

本项目会明确区分三类内容：

1. **公开事实**：来源页面明确披露的公司、场景、方案或数字。
2. **来源方披露**：厂商、客户或案例发布方给出的效果数字，未必经过独立审计。
3. **编辑分析**：根据公开材料做出的架构抽象、FDE 动作拆解和可复用方法总结。

证据等级 A/B/C/D 衡量的是“来源是否能被定位和复核”，**不等于真实性评分，也不代表独立审计**。详见 [METHODOLOGY.md](METHODOLOGY.md)。

详细程度和证据等级是两套独立指标：案例可以来源可靠但公开细节很少，也可能描述很丰富但只有单一厂商披露。

## 使用方式

- 中文入口：`index.html`
- English entry: `index.en.html`

两个页面都覆盖全部127条案例，并可在顶部一键切换语言。英文数据与中文数据保持相同案例 ID、顺序、证据等级和详细度评分；重点深度案例经过人工术语精修，其余内容使用机器辅助翻译并保留原始来源供复核。

直接打开页面即可浏览。也可以启动一个本地静态服务器：

```bash
python3 -m http.server 8000
```

然后访问 `http://localhost:8000`。

## 项目结构

```text
.
├── index.html                       # GitHub Pages 入口
├── index.en.html                    # English GitHub Pages entry
├── docs/images/                     # README 页面截图
├── data/
│   ├── cases.json                   # 案例数据唯一事实源
│   ├── cases.js                     # 由 cases.json 自动生成，供页面直接加载
│   ├── cases.en.json                # 127条案例的英文镜像数据
│   ├── cases.en.js                  # 英文页面浏览器数据
│   └── case.schema.json             # 数据结构约束
├── scripts/
│   ├── build-data.mjs               # 校验中文数据并生成 cases.js
│   ├── build-english-data.mjs        # 校验中英文案例 ID 并生成英文浏览器数据
│   ├── build-english-page.mjs        # 从中文页面生成英文页面
│   ├── refine-english-cases.mjs      # 重点英文案例术语精修
│   ├── check-html.mjs               # 检查中英文页面入口和脚本语法
│   ├── detail-rubric.mjs            # 六维详细度评分规则
│   ├── recalculate-detail.mjs       # 重算详细度分类
│   └── migrate-legacy.mjs           # 从旧版单文件迁移的可复现脚本
├── METHODOLOGY.md                   # 来源、证据等级和编辑规范
├── CONTRIBUTING.md                  # 投稿与修订说明
├── AUDIT.md                         # 当前证据缺口和后续核验队列
└── fde_case_library_100.html        # 保留的旧版单文件
```

## 数据校验

不需要安装第三方依赖，只需 Node.js：

```bash
npm test
```

校验会检查：

- 必填字段与稳定 ID
- 主来源是否使用 HTTPS
- 证据等级是否合法
- 详细度得分与当前六维规则是否一致
- 来源账本与主链接是否一致
- 架构、FDE 动作、复用方法等字段是否为空
- 来源账本、字段边界和案例正文是否达到最低完整度
- 首页脚本语法与关键筛选入口是否完整
- 中英文案例数量、ID和顺序是否一致
- 中英文页面是否都包含语言切换、数据入口和详情弹窗
- 一个来源链接是否被过多案例复用

`migrate:legacy` 只用于首次从旧版页面导入。检测到 `data/cases.json` 后会拒绝覆盖；不要把它作为日常构建命令。

修改案例正文后，先运行 `npm run classify:detail` 更新派生分类，再运行 `npm test`。

Datawhale 24 条案例的 PDF 页码映射由 `npm run link:datawhale-pdf` 维护。主来源指向官方 PDF 的准确物理页码，原单案例网页保留在补充来源中。

## 如何引用

建议同时引用：

- 案例 ID，例如 `openai-034`
- 本项目的案例页面或数据版本
- 案例中标注的主要公开来源
- 对数字使用“来源方称”“官方案例披露”等限定语

不要把编辑推演的架构或 FDE 动作描述成客户已经公开确认的实施事实。

## 贡献

欢迎补充深链接、页码、原始材料、独立证据或更准确的技术边界。提交前请阅读 [CONTRIBUTING.md](CONTRIBUTING.md)，并运行：

```bash
npm test
```

## 许可证

本仓库原创代码、结构化数据和编辑内容采用 [MIT License](LICENSE)。允许商业使用、复制、修改、合并、发布、分发、再许可和销售副本；再分发时只需保留版权与许可证声明。

案例所引用的第三方商标、原始文章、图片、报告和其他来源材料仍归各自权利人所有；MIT License 只适用于仓库内由维护者原创的代码、摘要、字段设计和结构化整理，不授予任何第三方材料的权利。

---

# Enterprise AI Case Library

[简体中文](#企业-ai-落地案例库) · [English](#enterprise-ai-case-library)

An open, source-traceable library of enterprise AI deployments. Instead of collecting model names, the project reconstructs the complete delivery chain wherever public evidence allows:

> Operating problem → field discovery and solution design → technical workflow → human accountability → rollout and adoption → business outcome → reusable lessons

![Enterprise AI Case Library — English home page](docs/images/home-en.png)

*Screenshot taken on 2026-09-19, when the library had 123 cases; use the live page and the counts below for current totals.*

Cases marked `⚙ Technical reference` are a stricter subset of deep cases. Their technical components and implementation steps are supported by case-level public material rather than being filled in through editorial inference. The library currently contains **18 technical references**.

## Coverage

The repository contains **127 cases**, grouped by disclosed level of detail:

- Deep cases: 35
- Standard cases: 77
- Overview cases: 15

Source coverage:

- [Official Datawhale *FDE Case 100* PDF](https://assets.datawhale.cn/Datawhale%20FDE%E6%A1%88%E4%BE%8B100.pdf): 24 cases, with primary links opening the corresponding PDF page
- Palantir customer deployments: 45
- OpenAI customer deployments: 34
- First-party annual reports, investor materials, engineering blogs, and internal project retrospectives: 16
- IBM, Microsoft, AWS, and Google Cloud case-level materials: 8

Recent deep additions include [Bayer PRINCE](https://martinfowler.com/articles/reliable-llm-bayer.html), [Nubank's support agents](https://arxiv.org/html/2606.08867), [Meta's expert-knowledge system](https://engineering.fb.com/2026/09/02/ml-applications/organizational-second-brain-ai-learns-from-experts/), and [Doctolib's AI platform](https://medium.com/doctolib/from-one-ai-product-to-an-ai-factory-e6337ffa75d9). Each documents implementation, but outcome figures are largely participant-reported. Individual case sheets record comparison baselines, rollout scope, and missing evidence.

## Evidence boundary

The library distinguishes three kinds of statements:

1. **Public fact** — a company, workflow, architecture element, or metric stated in the linked source.
2. **Participant-reported claim** — an outcome reported by a vendor, customer, or case publisher that may not have been independently audited.
3. **Editorial analysis** — architecture abstraction, FDE action mapping, and reusable delivery lessons derived from public material.

Evidence levels A/B/C/D measure whether a source can be located and reviewed. They are **not truth scores and do not imply independent verification**. See [METHODOLOGY.md](METHODOLOGY.md).

Detail level and evidence level are separate dimensions: a source can be authoritative but disclose very little, while a richly documented case may still rely on one participant’s account.

## Bilingual website and data

- Chinese site: `index.html`
- English site: `index.en.html`
- Chinese source data: `data/cases.json`
- English mirror data: `data/cases.en.json`

Both interfaces include search, source and industry filters, detail-level segmentation, evidence labels, technical-reference badges, and a full case sheet covering the problem, solution, architecture, components, human controls, FDE actions, outcomes, and verification notes.

All 127 English records preserve the same case IDs, ordering, evidence levels, and detail scores as the Chinese source. Translation is machine-assisted; flagship deep cases receive additional human terminology review. The linked primary source remains authoritative when wording or interpretation is uncertain.

## Run locally

Open either HTML file directly, or start a static server:

```bash
python3 -m http.server 8000
```

Then visit:

- `http://localhost:8000/` for Chinese
- `http://localhost:8000/index.en.html` for English

## Validation

No third-party runtime dependencies are required. With Node.js installed:

```bash
npm test
```

Validation covers required fields, stable IDs, HTTPS sources, detail-score consistency, source ledgers, evidence boundaries, bilingual case parity, generated browser data, language-switch links, and JavaScript syntax in both pages.

The 24 Datawhale PDF page mappings are maintained by `npm run link:datawhale-pdf`. Each primary source opens the exact physical PDF page; the original single-case webpage remains available as an additional source.

## How to cite a case

Include:

- the stable case ID, such as `openai-034`;
- the project page or data version;
- the primary public source linked by the case;
- wording such as “the company reports” or “the official case study states” for participant-reported metrics.

Do not describe editorial architecture inference or FDE action mapping as if the customer publicly confirmed every implementation detail.

## Contributing

Contributions that add deep links, report page numbers, first-party evidence, independent verification, or more precise technical boundaries are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) and run `npm test` before opening a pull request.

## License

Original code, structured data, and editorial content in this repository are licensed under the [MIT License](LICENSE). Commercial use, copying, modification, merging, publishing, distribution, sublicensing, and sale are permitted, provided the copyright and license notice are retained.

Third-party trademarks, source articles, images, reports, and other referenced material remain the property of their respective owners. The MIT License applies only to original repository code, summaries, field design, and structured editorial work; it does not grant rights to third-party material.
