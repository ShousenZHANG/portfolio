/**
 * 中文字典 — 不是英文站的直译,是面向大陆招聘市场、以中文简历
 * (public/cv/main.zh.txt)为唯一事实源的重写。中英站刻意不同:凡两边冲突,
 * /zh 以中文简历为准。
 *
 * 语域:克制的第一人称。不用「赋能/抓手/颠覆/极致/匠心/全方位/精通」;
 * 数字必须带基线或方法(「替代约 30 分钟/天的人工排查」),不写裸的百分比;
 * 产品与框架名保留英文(React、Copilot Studio、MCP、RAG),只在中西文之间
 * 补一个空格 —— 翻译它们是外行标志。
 *
 * 排版:所有中西文空格都在这里手工写死。不上 pangu.js、也不设
 * `text-autospace` —— Chromium 148 实测该属性计算值是 no-autospace,
 * 且只认 normal / no-autospace 两个值;手工空格 + 自动空格会在新浏览器上
 * 双倍留白。术语与按钮名用「」(大陆技术个人站的实际主流,不是 GB/T 的
 * “ ”),“ ” 只留给真正的引语;作品名用《》;省略号是两个 U+2026(……);
 * 破折号两个字宽(——)且两侧不留空;句内并列用、;全角括号()不留空格;
 * 不用感叹号。数字与 % 之间不留空(「专业前 10% 毕业」)。
 *
 * 结构必须与 en.js 逐键同构 —— index.js 刻意不做 fallback 合并,缺一个键
 * 就会在页面上渲染出字面量 "undefined"。函数键的入参个数也必须一致。
 *
 * 机械约束(改动即坏页):
 * - experience.cards[].title 必须保留 " — "(空格 + U+2014 + 空格),
 *   Experience.jsx 靠它切出「职位 / 公司」。
 * - experience.cards[].date 必须含 4 位阿拉伯数字年份,时间轴取
 *   /\d{4}/ 画年标;且不得命中 /present/i —— 中文简历没有在职岗位,
 *   NOW / 在职 徽标本就不该出现。
 * - showcase.projects[].description 的 {花括号} 是渲染期高亮标记。花括号
 *   边界落在汉字之间时不能加空格,落在汉字与拉丁/数字之间时,空格写在
 *   花括号「外面」—— 写在里面会把高亮块推出一格。
 * - jd.subScores 与 jd.eligibilityNames 的值被当成 React key,必须互不重复。
 * - hero.headline 是数组,长度本就可以和 en 不同(组件是 map 出来的)。
 *   但 Hero.jsx 会在相邻两个词之间塞一个字面量空格,只有带 br 的词后面
 *   那个空格会在行尾折叠 —— 中文这里因此只能切两段,详见 hero 里的注释。
 */

// 联系方式在三处出现(Contact 行、Footer 链接、E.D. 的失败兜底文案),
// 在这里定义一次。/zh 用国内可直接拨打与投递的邮箱与手机号。
const EMAIL = "17368139916@163.com";
const PHONE_DISPLAY = "(+86) 173 6813 9916";
const PHONE_HREF = "tel:+8617368139916";

export const zh = {
    // 页面骨架与共用零件(跳转链接、区块加载态、ErrorBoundary、
    // TitleHeader 的复制链接、LogoMark 的无障碍名)。
    misc: {
        skipLink: "跳到主要内容",
        sectionLoader: "正在加载内容",
        sectionFailed: "这一节没能加载出来。",
        retry: "重试",
        linkCopied: "链接已复制",
        // title 是 TitleHeader 手上那个已经本地化过的小节标题。
        copyLink: (title) => `复制「${title}」这一节的链接`,
        logoMarkAria: "张守森",
    },

    nav: {
        // 与页面顺序一一对应;#锚点留在 constants/index.js(站内 href 属于
        // 结构不属于文案),按下标配对。导航格子窄,统一压到两个汉字。
        links: ["经历", "项目", "技能"],
        contactCta: "联系我",
        menuOpen: "打开菜单",
        menuClose: "关闭菜单",
        mainNavLabel: "主导航",
        mobileNavLabel: "移动端导航",
        // 中文页以「张守森」为第一品牌名;Eddy Zhang 退到页脚版权行做副名。
        logoText: "张守森",
        orbAria: "打开 E.D.，张守森的 AI 助手（也可按 / 键）",
        orbTitle: "问问 E.D. · 按 / 键",
        orbLabel: "E.D.",
        tip: "第一次来？点开问问我的 AI",
    },

    hero: {
        eyebrow: "AI Agent 开发 · RAG 与 NL2SQL 落地 · 现居悉尼",
        // 三段切分,断点在第一个词的 br 上:
        //   我构建
        //   可验证的智能体。
        // 「可验证」单独成词,既是解码词也是签名色词 —— 这是中文简历抬头
        //「大模型输出可验证」的钩子,也是全网中文个人站没人占的那个词。
        // Hero.jsx 的词间空格已按 locale 关掉,中文这里不会出现可见空隙。
        headline: [
            { t: "我构建", sig: false, br: true },
            { t: "可验证", sig: true },
            { t: "的智能体。", sig: false },
        ],
        headlineAria: "我构建可验证的智能体。",
        // HR 扫一份简历只有一分钟,自动筛选还会先跑一遍关键词。所以这段
        // 必须把 JD 上真会出现的词都用明文摆出来:Agent、LangChain、
        // LangGraph、RAG、Milvus、Elasticsearch、NL2SQL —— 一个都不藏在图里。
        lead: "过去一年多，我在一家 2000 人规模的律所做企业级 Agent 落地：LangChain、LangGraph 编排，Milvus 向量检索、Elasticsearch 全文检索与 MySQL 结构化查询多路召回；每条答案标注来源，每条 SQL 先过校验再执行。下面这块 JD 匹配器也是我写的——粘一份岗位描述进去，当场算出匹配度。",
        ctaPrimary: "试试实时 AI 匹配",
        ctaCv: "下载简历",
        // 简历文件是「本地化数据」而不是资源常量:中文页发的是另一份 PDF,
        // 落到下载文件夹里也该是一个中文招聘方一眼认得出的名字。
        cvHref: "/files/Eddy_Zhang_CV_zh.pdf",
        cvDownloadName: "张守森-AI Agent开发-简历.pdf",
        available: "目前可到岗",
        stackLine: "LangChain · LangGraph · Milvus · Elasticsearch",
        askEd: "让 E.D. 替他回答 ↗",
        videoAria: "张守森的个人介绍视频",
        playAria: "播放 30 秒自我介绍",
        playLabel: "播放介绍 · 30 秒",
        figcaption: "30 秒自我介绍 · 我是谁",
    },

    counter: {
        // 数字是数据(CountUp 负责动画),标签接在数字后面读成一句完整中文:
        //「45% 故障排查周期缩短」。每个数字都能在中文简历里找到出处:
        // 45% / 55% 是两个 Agent 项目各自的成果行;10+ 是工单助手接入的
        // 技术系统工具数;100+ 是 GitHub 上实测的已合并 PR(写稿时 Dify 94、
        // Haystack 14),简历写的就是「累计 100+」。
        // 标签控制在 8 个字宽以内:手机上四格两列,再长就会在词中间折行
        //(实测「接入 Agent」被拆成「接 / 入」)。
        items: [
            { value: 45, suffix: "%", label: "故障排查周期缩短" },
            { value: 55, suffix: "%", label: "SQL 错误率下降" },
            { value: 10, suffix: "+", label: "技术系统工具接入" },
            { value: 100, suffix: "+", label: "开源 PR 已合并" },
        ],
    },

    // 证书条带 —— 数字块正下方、JD 匹配器之上。证书正式名保留英文原文
    //(证书名是专有名词),副行用中文简历自己的描述词。
    certs: {
        eyebrow: "证书与认证",
        listAria: "专业认证",
        verify: "验证",
        items: [
            {
                name: "Claude Certified Architect — Foundations",
                issuer: "Anthropic Claude 架构师认证",
                badge: "/certs/claude-architect-foundations.png",
                href: "https://www.credly.com/badges/65cd527d-e468-4455-a587-359bec7eb248",
            },
            {
                name: "Microsoft Certified: AI Agent Builder Associate",
                issuer: "微软 AI Agent 开发认证",
                badge: "/certs/microsoft-certified-associate.svg",
                href: "https://learn.microsoft.com/api/credentials/share/en-au/EddyZhang-6413/5756621B66C96460?sharingId=D0B50DD46044F2FC",
            },
        ],
    },

    // 开源条带 —— 在证书条带之下。星数是量级证明，卡片直接链到 GitHub 上
    // 「他本人已合并 PR」的筛选结果，和证书一样能自证。星数用简历里保守的
    // 取整（写稿时 Dify 已 158k、Haystack 26.7k）——只会涨的数字不会写错。
    // PR 数同理：写的是 2026 年 10 月 gh search 的实测值，只会往上走，
    // 点进链接看到的只会比这里多。
    oss: {
        eyebrow: "开源贡献",
        listAria: "开源贡献",
        // 身份写在页面上，而不是藏在链接的 ?author= 里：读者该在决定要不要
        // 点进去之前就知道这些贡献是谁的，而且这就是页脚与联系方式里同一个
        // GitHub 账号。
        handle: "@ShousenZHANG",
        handleHref: "https://github.com/ShousenZHANG",
        merged: (n) => `${n} 个 PR 已合并`,
        stars: "star",
        items: [
            {
                repo: "langgenius/dify",
                name: "Dify",
                blurb: "Agentic 大模型平台",
                stars: "150k+",
                prs: 94,
                work: "API 层严格类型化与 Pydantic 依赖注入重构",
                href: "https://github.com/langgenius/dify/pulls?q=is%3Apr+author%3AShousenZHANG+is%3Amerged",
            },
            {
                repo: "deepset-ai/haystack",
                name: "Haystack",
                blurb: "RAG 编排框架",
                stars: "26k+",
                prs: 14,
                work: "mypy 类型闸与文档切分器缺陷修复",
                href: "https://github.com/deepset-ai/haystack/pulls?q=is%3Apr+author%3AShousenZHANG+is%3Amerged",
            },
        ],
    },

    jd: {
        title: "把 JD 和我的简历比一比",
        sub: "01 / 实时 AI 演示",
        lead: "粘一份岗位描述进来，我自己写的 AI 引擎会当场算出匹配度。用的就是我在生产环境里跑的那套 RAG + 大模型。",
        tryLabel: "试试：",
        // 英文站的三条样例都押在澳洲工作权上,对大陆招聘方毫无意义。
        // 重写成三条真实读感的国内 JD(岗位职责 / 任职要求 / 年限 / 学历 /
        // 城市),分别打中匹配器的三条路径:高匹配、相邻领域、硬性不符。
        // 高匹配那条故意留了一个他没有的加分项(Kubernetes),免得读起来
        // 像照着简历写的;相邻领域选的是大模型算法 —— 他做的是 Agent 与
        // RAG 工程,没有训练与微调经历,引擎应当如实给出中段分。
        samples: [
            {
                label: "AI Agent 开发",
                body: "AI Agent 开发工程师｜25-40K·14薪｜上海，可远程。企业服务方向。岗位职责：基于 LangChain / LangGraph 开发面向内部员工的智能体，负责 RAG 检索链路（文档解析、向量化、混合召回）；建设 NL2SQL 智能问数能力；设计 Tools 接入与提示词工程，抑制模型幻觉。任职要求：1-3 年 AI 应用或后端开发经验；熟悉 Python 或 Java；有 Milvus、Elasticsearch 等检索组件的落地经验；本科及以上。加分项：有 Dify、Haystack 等开源项目贡献；熟悉 Spring Cloud 微服务；了解 Kubernetes。",
            },
            {
                label: "大模型算法工程师",
                body: "大模型算法工程师｜35-55K·15薪｜杭州。岗位职责：负责行业大模型的继续预训练、SFT 与 RLHF，搭建数据清洗与评测体系；优化推理性能与显存占用。任职要求：3 年以上 NLP 或大模型算法经验；精通 PyTorch，熟悉 DeepSpeed、Megatron 等分布式训练框架；有 LoRA、QLoRA 微调实战；在顶会发表过论文者优先；硕士及以上学历。",
            },
            {
                label: "资深后端 · 8 年 · 北京现场",
                body: "资深后端工程师｜40-60K·16薪｜北京海淀，现场办公，不支持远程。岗位职责：负责亿级流量交易系统的架构设计与性能优化，带 5 人以上后端小组。任职要求：8 年以上 Java 服务端经验，其中 3 年以上团队管理经验；深入理解 JVM 调优、分布式事务与高并发中间件；硕士及以上学历，计算机相关专业。",
            },
        ],
        loadingSteps: ["解析 JD", "比对我的简历", "计算匹配度"],
        placeholder: "把 JD 粘贴到这里：技术栈、岗位职责、年限要求、学历、城市……",
        inputAria: "岗位描述输入框",
        analyse: "开始比对",
        analysing: "比对中……",
        // 只读给读屏用。fitLabel 现在是纯展示串,zh 评分器发的是中文
        //(高度匹配 / 较为匹配 / 可以一谈 / 不匹配)—— 配色改由 fitKey 决定,
        // 所以这里可以直接接全角句号;headline 可能缺席(模型省略)。
        srResult: (fitLabel, score, headline) =>
            `${fitLabel}。匹配度 ${score} 分，满分 100 分。${headline ? headline : ""}`,
        moreCount: (n) => `另有 ${n} 项`,
        // 三段拼装,不是整句:按钮名在句中要套一层带色 <span>,组件在 JSX 里
        // 依次渲染 before / cta / after。中文这里改用「」包住按钮名 ——
        // 这正是「」在大陆技术写作里的本职,也省掉了英文版靠空格分隔的做法。
        emptyLoaded: {
            before: "JD 已载入，点",
            cta: "「开始比对」",
            after: "就能出分，结果几秒后显示在这里。",
        },
        emptyIdle: {
            before: "在上面挑一条示例，或粘贴一份真实 JD，再点",
            cta: "「开始比对」",
            after: "，几秒后结果显示在这里。",
        },
        outOf100: "/ 100",
        subScores: {
            exact: "精确匹配",
            related: "相关匹配",
            gap: "差距",
            confidence: "置信度",
        },
        // 键名就是接口返回的 dimensionScores 字段名,只翻值不动键。
        dims: {
            techStack: "技术栈",
            responsibilities: "岗位职责",
            domainContext: "业务领域",
            seniority: "职级与年限",
        },
        // 只是行标题。状态值 "OK"/"Issue"/"Unknown" 是线上枚举,组件用 ===
        // 比色,不能翻译。中文页的资格轴是「年限 + 城市」—— 大陆招聘不看
        // 工作签证,看的是年限卡不卡、城市能不能到岗;zh 评分器根本不吐
        // visa 这一格,组件也只渲染响应里真实存在的轴。visa 标签仍然留着:
        // 万一拿到一份旧结构的响应(缓存、回滚),行标题要有中文可显示,
        // 不能渲染成 undefined。
        eligibilityNames: {
            visa: "签证",
            experience: "年限",
            location: "城市",
        },
        // 枚举 → 显示文案的最后一步映射,也是本地化唯一可以碰它们的地方。
        statuses: { OK: "符合", Issue: "不符", Unknown: "未知" },
        statusUnknown: "未知",
        matched: "命中",
        gaps: "缺口",
        suggestions: "建议动作",
        riskFlags: "风险提示",
        // 只有前端的校验与传输错误在这里;服务端与大模型的错误串原样透出,
        // 它们住在 api/ 里。
        errors: {
            empty: "请先粘贴岗位描述。",
            // 调用方传原始上限,格式化归字典管(与改造前的
            // MAX_JD_LENGTH.toLocaleString() 保持一致)。
            tooLong: (max) => `JD 太长了，最多 ${max.toLocaleString()} 个字符。`,
            // 中文页取的是 /cv/main.zh.txt(见 useJDAnalysis 的 CV_URL),
            // 排错提示必须指向那一份,否则会把人引到英文简历上。
            cvMissing: "简历文本为空，请检查 /public/cv/main.zh.txt。",
            requestFailed: (status) => `请求失败：${status}`,
            failed: "分析失败，请稍后再试。",
        },
    },

    logos: {
        // 13 个 logo 名留在 LogoSection.jsx —— 品牌名各语言相同。
        eyebrow: "每天在用的工具",
    },

    experience: {
        // 这条时间轴里混着一段硕士学历(沿用英文站的结构),标题写成
        //「工作与教育经历」,免得中文读者把学历卡片当成一段工作。
        title: "工作与教育经历",
        sub: "02 / 经历",
        currentAria: "当前在职",
        // 中文简历没有在职岗位(Corrs 的工作 2026 年 9 月结束),下面的日期
        // 一条都不会命中 /present/i,这两个徽标是休眠文案。
        nowBadge: "现在",
        currentBadge: "在职",
        // 卡片只讲「做了什么、结果多少」,一条一件事;两个 Agent 项目的完整
        // 机制在下面「精选项目」里展开,这里不重复同一段描述。
        cards: [
            {
                title: "AI Agent 开发 — 科尔斯律师事务所（Corrs Chambers Westgarth）",
                date: "2025.07 – 2026.09",
                responsibilities: [
                    "AI 工单智能助手：面向全所 2000 人规模的 IT 技术支持，基于 LangChain 搭建 RAG 管道，标准化接入 10 余个技术系统工具，自动排查并辅助定位根因；故障排查周期缩短 45%。",
                    "智能问数 Agent：基于 LangGraph 编排可观测的 NL2SQL 工作流，Milvus、Elasticsearch、MySQL 三路并行召回；常规取数从按天排期缩短到分钟级。",
                    "幻觉抑制：分层级系统提示词、事实核查与知识溯源，每条排查方案标注来源文档与章节；SQL 先经 EXPLAIN 校验、失败自动纠错，生成错误率下降 55%。",
                    "对话记忆：MongoDB 存储会话与排查过程，每个工单会话独立维护上下文；无法在线解决的问题自动生成工单草稿，经人工确认后进入内部工单系统。",
                ],
            },
            {
                title: "信息技术硕士 — 新南威尔士大学（UNSW）",
                date: "2023.09 – 2025.06",
                responsibilities: [
                    "QS 世界排名第 19；专业前 10%。",
                    "负责澳洲高校编程大赛（Coding Fest 2025）亚军项目的后端：基于 Spring Cloud 的微服务竞赛平台。",
                ],
            },
            {
                title: "Java 后端开发 — 上海新致软件股份有限公司",
                date: "2022.08 – 2023.04",
                responsibilities: [
                    "银行核心业务中台：负责保单管理、单据处理、产品配置等核心模块的接口设计与开发，累计交付 8 个模块、120+ 个后端接口，接口复用率 42%。",
                    "性能优化：Redis 多级缓存与 SQL 执行计划优化，核心查询接口平均耗时从 780ms 降到 190ms，峰值 QPS 提升 3 倍。",
                    "文件存储：基于 MinIO 搭建分布式存储，业务文件与数据库分流，集成分级下载、只读预览等细粒度权限管控，满足金融合规要求。",
                ],
            },
            {
                title: "机械电子工程学士 — 江苏科技大学苏州理工学院",
                date: "2016.09 – 2020.06",
                responsibilities: [],
            },
        ],
    },

    showcase: {
        title: "精选项目",
        sub: "03 / 精选项目",
        fallbackEyebrow: "企业项目",
        viewOnGithub: "GitHub 源码",
        liveDemo: "在线体验",
        // 中文站的项目区与英文站不同构:中文简历的三段项目经历都是企业内部
        // 系统,没有可截图的公开界面,所以这里不放轮播,改由 ProjectDiagram
        // 把每个项目的真实执行链路画出来 —— 招聘方要判断的正是「这条链路
        // 他是不是真搭过」。与 constants/projects.js 按下标对齐;技术标签、
        // id 在数据文件里,文案(含图里的每个节点名)住在这里。整棵子树在
        // check-i18n-parity 里豁免,形状由 projects.js 的 zh 分支消费。
        //
        // 花括号=渲染期高亮。边界落在汉字或全角标点之间不加空格;落在汉字
        // 与拉丁/数字之间,空格写在花括号「外面」—— 写在里面会把高亮块
        // 推出一格。
        projects: [
            {
                title: "法律业务 AI 工单智能助手",
                meta: "Corrs Chambers Westgarth · 2025.07 – 2026.09",
                description:
                    "面向全所 2000 人规模的 IT 技术支持：基于 {LangChain} 搭建 RAG 管道，在律所专属的 {Milvus 技术知识向量库}里语义检索，叠加链路节点、系统模块、异常类型等维度过滤；Agent 经 {10 余个标准化 Tools} 实时调取运行数据，自动排查并辅助定位根因，每条方案都标注来源文档与章节。",
                outcomes: [
                    "技术工单平均故障排查周期缩短 45%，一线技术支持人员日均处理工单量提升 40%",
                    "一线研发重复介入低危常规工单的比例下降 55%，常见技术问题自动排查覆盖率 65%",
                    "无法在线解决的问题自动沉淀排查上下文、生成工单草稿，经人工确认后进入内部工单系统并附完整排查记录",
                ],
                diagram: {
                    label: "排查链路",
                    steps: [
                        { t: "多源知识采集", d: "架构文档、排障 SOP、历史工单，增量同步" },
                        { t: "向量化入库", chips: ["Embedding", "Milvus"] },
                        { t: "RAG 检索 + 维度过滤", d: "链路节点、系统模块、异常类型、合规等级" },
                        { t: "Agent 调用 Tools", chips: ["链路追踪", "系统监控", "接口健康", "SAP 校验"], d: "等 10 余个技术系统工具" },
                        { t: "可溯源方案 / 工单草稿", d: "标注来源文档与章节，未解决自动生成工单", end: true },
                    ],
                },
            },
            {
                title: "法律业务智能问数 Agent",
                meta: "Corrs Chambers Westgarth · NL2SQL",
                description:
                    "让全所 2000 名律师与运营、财务、合规人员用一句话自助取数：{LangGraph} 编排可观测的 NL2SQL 工作流，{Milvus 语义检索}、{Elasticsearch 全文检索}与 {MySQL 结构化查询}并行召回字段、指标与取值；大模型只能基于召回到的真实表字段写 SQL，再经 {EXPLAIN 校验}，失败自动纠错。",
                outcomes: [
                    "常规数据查询从按天排期缩短到分钟级，业务人员自助取数覆盖率 65%",
                    "SQL 生成错误率下降 55%，核心指标计算口径 100% 对齐官方标准",
                    "数据团队人均处理需求吞吐量提升 40%",
                ],
                diagram: {
                    label: "LangGraph 工作流",
                    steps: [
                        { t: "关键词抽取", d: "分词抽取业务关键词" },
                        { t: "多路并行召回", chips: ["Milvus", "Elasticsearch", "MySQL"] },
                        { t: "合并 · 二次过滤", d: "剔除无关表与指标，补充环境上下文" },
                        { t: "生成 SQL", loop: "EXPLAIN 校验 · 失败自动纠错" },
                        { t: "返回结果", d: "分钟级，口径对齐官方标准", end: true },
                    ],
                },
            },
            {
                title: "银行核心业务平台升级",
                meta: "上海新致软件 · 2022.08 – 2023.04",
                description:
                    "面向银行客户的核心业务中台：向下封装通用技术与业务组件，向上支撑保险业务线快速二次开发。我负责保单管理、单据处理、产品配置等核心模块的需求拆解与接口开发，并用 {Redis 多级缓存}与 {SQL 执行计划优化}完成高并发场景的性能适配。",
                outcomes: [
                    "累计交付 8 个核心业务模块、120+ 个后端接口，接口复用率 42%，支撑 3 条保险业务线上线",
                    "模块化框架改造后，新增业务场景的二次开发工作量降低 50%",
                    "核心查询接口平均耗时从 780ms 降到 190ms，峰值 QPS 提升 3 倍",
                ],
                diagram: {
                    label: "平台分层",
                    steps: [
                        { t: "保险业务线", chips: ["保单管理", "单据处理", "产品配置"] },
                        { t: "通用组件 · 扩展点", d: "二次开发工作量降低 50%" },
                        { t: "RESTful 跨系统接口", d: "120+ 个接口，复用率 42%" },
                        { t: "多级缓存", chips: ["Redis", "SQL 执行计划"], d: "780ms → 190ms" },
                        { t: "分流存储", chips: ["Oracle", "MinIO"], end: true },
                    ],
                },
            },
        ],
    },

    skills: {
        title: "技能图谱",
        sub: "04 / 技术栈",
        lead: "我日常在用的 Agent 与后端技术栈，按彼此的连接关系铺开：LangChain、LangGraph 负责编排，Milvus、Elasticsearch、MySQL 负责召回，Java 与 Spring Cloud 打底。悬停或点一下节点，看它连着什么；选中一个，能看到我用它交付过什么。",
        graphAria: "可交互技能关系图",
        // category 是该节点所属分类的中文标签。
        nodeAria: (label, category) => `${label},${category}`,
        linksCount: (n) => `${n} 条连接`,
        shippedIn: "用在哪里",
        linkedSkills: "关联技能",
        interactive: "可交互",
        hint: "点任意节点，看这项技能背后的项目、岗位或平台。",
        // 中文站的图谱是另一张图(节点集按中文简历的「专业技能」重画),
        // 几何与连线在 src/data/skillGraph.js 的 zh 分支,这里只放文案。
        // cats / nodes 两棵子树在 check-i18n-parity 里豁免,由
        // test/i18n/skill-graph.test.mjs 逐个核对:每个节点都有文案、
        // 每条连线两端都存在、标签互不重叠。
        cats: {
            agent: "Agent 与大模型",
            retrieval: "检索与数据",
            java: "Java 与微服务",
            mw: "中间件",
            ops: "部署与运维",
        },
        // 按节点 id 索引。label 是产品名,必须保持英文 —— 它们以固定字号
        // 渲染成 SVG 文本、挤在固定 viewBox 里,换成全角汉字会和邻居撞上。
        // used 是证据行,逐条出自中文简历。
        nodes: {
            langchain: { label: "LangChain", used: ["AI 工单智能助手：完整 RAG 管道", "Agent 核心逻辑与 Tools 调用"] },
            langgraph: { label: "LangGraph", used: ["智能问数 Agent：可观测 NL2SQL 工作流", "每一步执行状态与中间明细可追溯"] },
            rag: { label: "RAG", used: ["语义检索叠加律所 IT 维度过滤", "排查方案标注来源文档与章节"] },
            nl2sql: { label: "NL2SQL", used: ["取数从按天排期缩短到分钟级", "SQL 生成错误率下降 55%"] },
            prompt: { label: "Prompt Eng.", used: ["分层级场景化系统提示词", "事实核查与知识溯源抑制幻觉"] },
            tools: { label: "Agent Tools", used: ["10 余个技术系统工具标准化接入", "链路追踪、系统监控、SAP 节点校验"] },
            embedding: { label: "Embedding", used: ["技术资料向量化", "数仓字段与指标向量化"] },
            milvus: { label: "Milvus", used: ["律所 IT 专属技术知识向量库", "字段与指标语义向量库"] },
            es: { label: "Elasticsearch", used: ["字段取值全文索引", "多引擎混合召回的一路"] },
            mysql: { label: "MySQL", used: ["多引擎混合召回：结构化查询"] },
            mongodb: { label: "MongoDB", used: ["会话历史与排查过程存储", "每个工单会话独立维护上下文"] },
            java: { label: "Java", used: ["银行核心业务中台：8 个模块、120+ 个接口"] },
            springboot: { label: "Spring Boot", used: ["银行核心业务平台", "编程大赛亚军项目的后端"] },
            springcloud: { label: "Spring Cloud", used: ["Nacos、Dubbo、OpenFeign、Sentinel、Gateway、Seata", "编程大赛亚军项目：微服务竞赛平台"] },
            mybatis: { label: "MyBatis", used: ["银行核心业务平台的持久层"] },
            oracle: { label: "Oracle", used: ["银行核心业务平台的数据库"] },
            redis: { label: "Redis", used: ["多级缓存：核心查询 780ms → 190ms", "缓存穿透、雪崩、击穿的预防方案"] },
            rabbitmq: { label: "RabbitMQ", used: ["消息可靠性、幂等与堆积处理", "竞赛平台的事件驱动通知"] },
            minio: { label: "MinIO", used: ["分布式文件存储，业务文件与数据库分流"] },
            docker: { label: "Docker", used: ["银行核心业务平台的容器化部署"] },
            linux: { label: "Linux", used: ["独立完成项目部署"] },
        },
    },

    contact: {
        title: "联系方式",
        sub: "05 / 联系",
        lead: "在找全职机会，也欢迎有意思的合作。沟通尽量说清楚，取舍会摊开讲。下面是最快的联系方式，留个言我也会尽快回复。",
        // mailto 在渲染时拼("mailto:" + email),这里只放地址本身。
        channels: {
            emailLabel: "邮箱",
            email: EMAIL,
            phoneLabel: "电话",
            phoneDisplay: PHONE_DISPLAY,
            phoneHref: PHONE_HREF,
        },
        // 领英中国的消费者服务 2023 年已关停,大陆招聘方点不动这个入口。
        // 键必须留着(否则 aria-label 渲染成 undefined),但组件应当在
        // 中文页停止渲染这个链接 —— 那一步在组件里,不在字典里。
        socialAria: {
            linkedin: "领英",
            github: "GitHub",
        },
        available: "目前可到岗",
        form: {
            name: "姓名",
            email: "邮箱", // 表单字段标签,和 channels.emailLabel 是两个键(假朋友)
            message: "留言",
            honeypotLabel: "网站", // 视觉隐藏,但是一段真实的标签文本
            placeholders: {
                name: "怎么称呼",
                email: "your@email.com",
                message: "想聊些什么？",
            },
            send: "发送",
            sending: "发送中……",
            sentTitle: "已发送",
            sentBody: "谢谢来信，我会尽快回复。",
            close: "关闭",
            error: "发送失败，请重试，或者直接发邮件给我。",
        },
    },

    footer: {
        // 巨大的描边字标,点了跳到联系区。中文页让名字出面:既是品牌落款,
        // 也是一句还原成动作的邀约。控制在 7 个字宽以内 —— 这块用的是
        // .footer-mark 的 clamp 字号,再长在窄屏上会顶出栏宽。
        wordmark: "找张守森聊聊。",
        wordmarkAria: "跳转到联系方式",
        // 渠道值来自 contact.channels,页脚只负责包在外面的读屏措辞。
        emailAria: (email) => `发邮件到 ${email}`,
        phoneAria: (phone) => `拨打电话 ${phone}`,
        socialAria: {
            linkedin: "领英主页",
            github: "GitHub 主页",
        },
        backToTop: "回到顶部",
        // Eddy Zhang 在这里作为副名存活:海外经历与 GitHub 账号都挂在
        // 这个名字下,招聘方核查时需要能对上。
        rights: (year) => `© ${year} 张守森（Eddy Zhang）。保留所有权利。`,
        location: "澳大利亚悉尼",
    },

    ed: {
        // 英文站的冷启动问题里有一条问签证,对大陆招聘方毫无意义。换成
        // 四个真会被问到的:交付过什么、为什么转这条路、什么时候能到岗、
        // 怎么联系。药丸很窄,每条压到 10 个字以内。
        chips: [
            "他真正上线过什么？",
            "NL2SQL 是怎么做的？",
            "什么时候能到岗？",
            "怎么联系他？",
        ],
        panelAria: "E.D. · 张守森的 AI 助手",
        eyebrow: "E.D. · 张守森的数字分身",
        voiceOn: "语音回复已开",
        voiceOff: "语音回复已关",
        close: "关闭 E.D.",
        statusListening: "正在聆听 · 点麦克风发送",
        statusThinking: "处理中……",
        statusSpeaking: "回复中……",
        statusIdle: "关于张守森，尽管问",
        // 面板里唯一那个 polite live region。
        announceListening: "正在聆听。",
        announceThinking: "处理中。",
        // 思考气泡里原样渲染的阶段名。
        thinking: "思考中",
        transcribing: "转写中",
        inputPlaceholder: "问问张守森：经历、项目、到岗时间……",
        inputAria: "向 E.D. 提问",
        micAria: { listen: "语音提问", stop: "停止聆听" },
        sendAria: { send: "发送", stop: "停止录音并发送" },
        errors: {
            fault: (status) => `E.D. 出错了（${status}）。`,
            unreachable: `E.D. 的内核连不上，可以直接联系张守森：${EMAIL}`,
            micBlocked: "麦克风被拦住了，检查一下地址栏的权限，或者直接打字。",
            transcribeFailed: "语音转写失败。",
            noSpeech: "没听清，再说一次，或者直接打字。",
            voiceSnag: "语音输入出了点问题，打字一样好用。",
        },
    },
};
