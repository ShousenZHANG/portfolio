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
        eyebrow: "AI 应用工程师 · 企业级 Agent 落地 · 现居悉尼",
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
        // 必须把 JD 上真会出现的词都用明文摆出来:Agent、Copilot Studio、
        // MCP、Power Automate、Dataverse、RAG、大模型 —— 一个都不藏在图里。
        lead: "我在 Microsoft 生态里做企业级 Agent 落地：Copilot Studio、MCP、Power Automate、Dataverse，答案经 RAG 锚定权威文档、可回溯到原文；大模型产品也能一个人从零做到上线。下面这块 JD 匹配器就是其中之一——粘一份岗位描述进去，我的 AI 当场算出匹配度。",
        ctaPrimary: "试试实时 AI 匹配",
        ctaCv: "下载简历",
        // 简历文件是「本地化数据」而不是资源常量:中文页发的是另一份 PDF,
        // 落到下载文件夹里也该是一个中文招聘方一眼认得出的名字。
        cvHref: "/files/Eddy_Zhang_CV_zh.pdf",
        cvDownloadName: "张守森-AI应用工程师-简历.pdf",
        available: "目前可到岗",
        stackLine: "Copilot Studio · Power Automate · Dataverse · MCP",
        askEd: "让 E.D. 替他回答 ↗",
        videoAria: "张守森的个人介绍视频",
        playAria: "播放 30 秒自我介绍",
        playLabel: "播放介绍 · 30 秒",
        figcaption: "30 秒自我介绍 · 我是谁",
    },

    counter: {
        // 数字是数据(CountUp 负责动画),标签接在数字后面读成一句完整中文:
        //「2 个 Copilot Agent 已上线」。每个数字都能在中文简历里找到出处。
        items: [
            { value: 2, suffix: "", label: "Copilot Agent 已上线" },
            { value: 10, suffix: "+", label: "员工日常使用" },
            { value: 5, suffix: "", label: "企业平台已打通" },
            { value: 2100, suffix: "+", label: "自动化测试支撑 Joblit" },
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
        samples: [
            {
                label: "AI 应用工程师",
                body: "AI 应用工程师｜20-35K·14薪｜远程优先。企业服务方向，三十人团队。岗位职责：搭建面向内部员工的知识问答助手，负责 RAG 检索链路、知识入库与更新流程；打通 OA、工单、文档库等系统的数据接入；做提示词与上下文工程，把模型输出约束在可核查的范围内。任职要求：1-3 年后端或 AI 应用开发经验；熟练 Python 或 C#；有 LangChain、Dify、扣子等框架，或 MCP、向量检索的实际落地项目；本科及以上。加分项：Microsoft 365、Power Platform 相关经验；做过让模型输出可溯源、可审计的机制。",
            },
            {
                label: "Java 后端工程师",
                body: "Java 后端工程师｜18-30K·13薪｜上海张江，可弹性远程。产品是一套面向制造业客户的 SaaS。岗位职责：负责 Spring Boot 微服务的接口设计与开发，参与数据库设计与查询优化；对接对象存储与消息队列；配合测试完成容器化发布。任职要求：2 年以上 Java 服务端经验；熟悉 Spring Boot、MySQL 或 PostgreSQL、Docker；了解 RabbitMQ 或 Kafka；本科及以上。加分项：有 CI/CD 流水线搭建经验。",
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
        // 中文简历没有在职岗位(Stepping Stone House 合同 2026 年 8 月结束),
        // 下面的日期一条都不会命中 /present/i,这两个徽标是休眠文案。
        nowBadge: "现在",
        currentBadge: "在职",
        cards: [
            {
                title: "AI 工程师 — Stepping Stone House",
                date: "2026.07 – 2026.08",
                responsibilities: [
                    "上线两个 Copilot Studio Agent,10+ 名员工日常在用；答案经 MCP 锚定 SharePoint 权威文档，可回溯到原文，而不是靠模型记忆。",
                    "自研 C#/Python 客户端（MarkItDown、faster-whisper、Playwright），把 15+ 种文档、音频与网页格式统一转成 Markdown，存进 SharePoint 权威文档库供 Agent 检索。",
                    "会议纪要合规归档：Power Automate 每周定时流程经 Microsoft Graph 抓取约 10 场会议的 AI 纪要，转 Word 后归档到指定 SharePoint 站点，用于留痕与合规审计。",
                ],
            },
            {
                title: "集成与自动化分析师 — Corrs Chambers Westgarth",
                date: "2026.03 – 2026.07",
                responsibilities: [
                    "任技术负责人，0 到 1 主导可信知识管理 Agent：独立完成技术选型，设计 Dataverse 数据模型与知识入库工作流，让每条记录都带来源标识、每条答案都能回溯至原始文档。",
                    "已交付并完成试点，打通 ServiceNow、SharePoint、Loop、NetDocs、Intapp 五个平台；员工以对话方式拿到可溯源答案，新知识经 AI 辅助审核后发布。",
                    "选用 Microsoft 生态而不是自建检索栈，直接继承企业既有的权限模型，不必另建一套权限体系。",
                    "交付生产日志值守 Agent Flow：每日定时经 Boomi API 拉取日志，由大模型归类报错并分发到对应团队，错误与解法沉淀进 Dataverse 知识库，替代约 30 分钟/天的人工排查。",
                    "设计可复用的 Agent Skills，提升回答准确率、同时压低单次查询的 Copilot Credit 消耗；另完成自然语言生成集成流的原型验证，业务同事描述需求即可产出集成流与简易前端。",
                ],
            },
            {
                title: "信息技术硕士 — 新南威尔士大学（UNSW)",
                date: "2023.09 – 2025.06",
                responsibilities: [
                    "专业前 10% 毕业，获优秀毕业生；超额修读学分提前毕业。",
                    "负责澳洲高校编程大赛（Coding Fest 2025）亚军项目的后端：基于 Spring Cloud 的微服务竞赛平台。",
                ],
            },
            {
                title: "软件工程师 — 上海新致软件股份有限公司",
                date: "2022.08 – 2023.04",
                responsibilities: [
                    "Java / Spring Boot 微服务与 RESTful API 开发，并设计 MinIO 对象存储集成与数据迁移方案。",
                    "Docker 容器化与 Linux CI/CD 部署，让每次发布都可复现。",
                ],
            },
        ],
    },

    showcase: {
        title: "精选项目",
        sub: "03 / 精选项目",
        fallbackEyebrow: "企业项目",
        viewOnGithub: "GitHub 源码",
        liveDemo: "在线体验",
        // 与 constants/projects.js 按下标对齐。只有文案住在这里;图片路径、
        // 尺寸、链接、id、技术标签留在数据文件里。
        projects: [
            {
                title: "Joblit",
                alts: [
                    "Joblit 首页与实时演示",
                    "Joblit 岗位工作台，AI 高亮关键词",
                    "Joblit Chrome 扩展自动填写 ATS 申请表",
                    "Joblit 简历生成器与 PDF 预览",
                    "Joblit AutoFill Chrome 扩展安装页",
                ],
                // 花括号=渲染期高亮。这里三处边界都落在汉字或全角标点上,
                // 所以一个空格都不能加 —— 加了就在高亮块和正文之间开一道缝。
                // (对照下面那条:"以 {OAuth2 / JWT} 鉴权" 的边界是中西文,
                // 空格必须写在花括号外面,否则会被算进高亮块里。)
                description:
                    "{一个人架构、开发并上线的 AI 求职工作流平台}。模型只按索引从候选人自有的技能库里挑技能，生成内容再过一道{确定性校验闸}：数字与技能必须在原始档案里查得到，从机制上堵住编造；{2,100+ 条自动化测试}通过后才自动部署。",
                // 与上面的 description 分工:description 讲机制,outcomes 讲
                // 产品闭环与上线证据,三条各说一件事,不重复同一个数字。
                outcomes: [
                    "自动抓取岗位、解析 JD 需求并过滤掉不匹配的，再按岗位定制简历摘要与技能排序",
                    "一键渲染 LaTeX 导出可投递 PDF，单个岗位的定制投递从半小时压到几分钟",
                    "自建 GitHub Actions 流水线，测试全绿才自动部署；项目已开源上线，有真实用户在用",
                ],
            },
            {
                title: "项目竞赛管理平台",
                alts: [
                    "Coding Fest 2025 亚军证书",
                    "Coding Fest 2025 颁奖现场团队合影",
                    "系统架构图",
                    "CI/CD 流水线",
                ],
                description:
                    "云原生竞赛系统：{Spring Cloud 微服务}以 {OAuth2 / JWT} 鉴权，{RabbitMQ 事件驱动消息}支撑跨服务的实时通知。",
                highlight: {
                    title: "亚军：AI for Education 最佳项目",
                    description: "Coding Fest 2025（悉尼大学）评出，表彰项目的创新性与实际影响。",
                    sponsor: "由 Atlassian 与 Flow Traders 赞助。",
                    ctaLabel: "查看获奖证书",
                },
            },
        ],
    },

    skills: {
        title: "技能图谱",
        sub: "04 / 技术栈",
        lead: "我日常在用的 Microsoft 365 Agent 技术栈：Copilot Studio、Power Platform，以及围绕它们的 AI 能力，按彼此的连接关系铺开。悬停或点一下节点，看它连着什么；选中一个，能看到我用它交付过什么。",
        graphAria: "可交互技能关系图",
        // category 是该节点所属分类的中文标签。
        nodeAria: (label, category) => `${label},${category}`,
        linksCount: (n) => `${n} 条连接`,
        shippedIn: "用在哪里",
        linkedSkills: "关联技能",
        interactive: "可交互",
        hint: "点任意节点，看这项技能在哪些项目和岗位上真正跑过生产。",
        cats: {
            ms: "Microsoft 与 Power Platform",
            ai: "AI 与 Agent",
            data: "集成与数据",
            eng: "软件工程",
            cloud: "云与 DevOps",
        },
        // 按节点 id 索引。label 是产品名,必须保持英文 —— 它们以固定字号
        // 渲染成 SVG 文本、挤在固定 viewBox 里,换成全角汉字会和邻居撞上。
        // used 是证据行,逐条按中文简历重写。坐标、半径、分类、连线留在组件里。
        nodes: {
            copilot: { label: "Copilot Studio", used: ["Stepping Stone House:2 个 Agent 已上线", "Corrs：可信知识管理 Agent"] },
            pautomate: { label: "Power Automate", used: ["会议纪要合规归档流程", "Corrs：每日日志值守 Flow"] },
            dataverse: { label: "Dataverse", used: ["Corrs：可溯源知识数据模型", "可复用 Agent Skills"] },
            powerapps: { label: "Power Apps", used: ["Microsoft Power Platform"] },
            agents: { label: "AI Agents", used: ["2 个 Agent 上线，10+ 名员工在用", "Corrs 知识 Agent：打通 5 个平台并试点"] },
            rag: { label: "RAG", used: ["Stepping Stone House：自建 Markdown 知识库", "Corrs：每条答案可溯源"] },
            mcp: { label: "MCP", used: ["Agent 经 MCP 锚定 SharePoint 权威文档"] },
            llmorch: { label: "LLM Orchestration", used: ["Joblit：任意大模型，输出过 Zod 校验"] },
            prompt: { label: "Prompt Eng.", used: ["Joblit 提示词契约", "本页这个 JD 匹配器"] },
            boomi: { label: "Boomi", used: ["Corrs 日志值守（约 30 分钟/天）", "自然语言生成集成流原型"] },
            servicenow: { label: "ServiceNow", used: ["Corrs Agent 打通的五个平台之一"] },
            playwright: { label: "Playwright", used: ["Markdown 转换客户端的网页抓取"] },
            sql: { label: "SQL / REST", used: ["新致软件的接口开发", "项目竞赛管理平台"] },
            java: { label: "Java + Spring", used: ["新致软件（含 MinIO 迁移）", "项目竞赛管理平台"] },
            python: { label: "Python", used: ["自研客户端：15+ 种格式转 Markdown"] },
            ts: { label: "TypeScript", used: ["Joblit", "这个作品集站点"] },
            react: { label: "React / Next", used: ["这个作品集站点", "Joblit"] },
            azure: { label: "Azure", used: ["Microsoft 365 技术栈"] },
            aws: { label: "AWS", used: ["项目竞赛管理平台"] },
            docker: { label: "Docker", used: ["项目竞赛管理平台", "新致软件"] },
            cicd: { label: "CI/CD", used: ["项目竞赛管理平台", "Joblit"] },
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
            "为什么转做企业 Agent?",
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
