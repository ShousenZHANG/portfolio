/**
 * English dictionary. Its single source of truth is the English CV
 * (public/files/Eddy_Zhang_CV.pdf, text in public/cv/main.txt): every date,
 * title and figure on this page must be one that CV states. The Chinese page
 * follows the Chinese CV the same way, and the two CVs differ on purpose
 * (the Corrs role is dated and titled differently in each), so do not copy a
 * date or figure across from zh.js. Structure stays isomorphic with zh.js;
 * check-i18n-parity enforces it, and test/i18n/cv-grounding.test.mjs checks
 * every date and figure here against main.txt.
 *
 * Punctuation is load-bearing: em dashes (—), en dashes (–) in date ranges,
 * middle dots (·), ellipses (…) and curly apostrophes (’) are the exact
 * glyphs the components render — do not "fix" them to ASCII.
 *
 * What deliberately does NOT live here: element ids, in-page anchor hrefs,
 * asset paths (except the per-locale CV pair in `hero`), event names,
 * sessionStorage keys, glyph pools, keyboard key names (⌘/Ctrl/Enter), the
 * " — " title-separator convention itself, tech-brand names (LogoSection
 * list, projects.tech tags), and the JD panel's wire enums — fitLabel
 * prefixes and eligibility "OK"/"Issue"/"Unknown" are compared with
 * startsWith/=== in JDQuickCheck.jsx and must stay ASCII on the wire; only
 * the static labels AROUND them are dictionary entries.
 *
 * Where a component interpolates, the entry is a small pure function taking
 * the raw value(s), so zh can reorder words freely.
 */

// Contact data surfaces in three places (Contact rows, Footer links, E.D.'s
// failure message) — one source here so the zh wave swaps it exactly once.
const EMAIL = "eddy.zhang24@gmail.com";
const PHONE_DISPLAY = "(+86) 173 6813 9916";
const PHONE_HREF = "tel:+8617368139916";

export const en = {
    // App chrome + shared atoms (App skip link/loader, ErrorBoundary,
    // TitleHeader's copy-link affordance, LogoMark's accessible name).
    misc: {
        skipLink: "Skip to main content",
        sectionLoader: "Loading section",
        sectionFailed: "This section failed to load.",
        retry: "Retry",
        linkCopied: "Link copied", // aria-label (copied state) + visible toast
        // `title` is the already-localised section heading TitleHeader holds.
        copyLink: (title) => `Copy link to ${title} section`,
        logoMarkAria: "Eddy Zhang",
    },

    nav: {
        // Page-order labels; the #anchors stay in constants/index.js (in-page
        // hrefs are structure, not copy) and pair with these by index.
        links: ["Experience", "Projects", "Skills"],
        contactCta: "Contact me", // desktop pill + mobile dropdown share it
        menuOpen: "Open menu",
        menuClose: "Close menu",
        mainNavLabel: "Main navigation",
        mobileNavLabel: "Mobile navigation",
        logoText: "Eddy Zhang",
        orbAria: "Open E.D., Eddy's AI assistant (or press /)",
        orbTitle: "Ask E.D. — press /",
        orbLabel: "E.D.",
        tip: "First time here? Click and ask my AI anything",
    },

    hero: {
        eyebrow: "AI Agent Engineer · RAG & NL2SQL · Sydney",
        // Word array for the masked stagger — `sig` marks the decode word,
        // `br` breaks the line after it. headlineAria must always read as the
        // assembled sentence (it is the h1's accessible name). "verifiable"
        // is the same hook the zh headline carries (「可验证」): sourced
        // answers, SQL that is checked before it runs.
        headline: [
            { t: "I", sig: false },
            { t: "build", sig: false, br: true },
            { t: "verifiable", sig: true },
            { t: "agents.", sig: false },
        ],
        headlineAria: "I build verifiable agents.",
        // Recruiters scan, and ATS filters run keywords first — so every term a
        // JD would carry is spelled out in plain text here: agent, LangChain,
        // LangGraph, RAG, Milvus, Elasticsearch, NL2SQL.
        lead: "At Corrs Chambers Westgarth, a law firm of ~2,000 staff, I built an IT support ticket agent and an NL2SQL analytics agent — LangChain and LangGraph, with hybrid recall across Milvus, Elasticsearch and MySQL. Every answer cites its source; every SQL query is checked before it runs.",
        ctaPrimary: "Try the live AI matcher",
        ctaCv: "Download CV",
        // The CV pair is locale DATA, not an asset constant — the zh entry
        // ships a different file under a different download name.
        cvHref: "/files/Eddy_Zhang_CV.pdf",
        cvDownloadName: "Eddy_Zhang_AI_Agent_Engineer_CV.pdf",
        available: "Available for work",
        askEd: "Ask E.D. about him ↗",
        videoAria: "Personal introduction video by Eddy Zhang",
        playAria: "Play 30-second intro",
        playLabel: "Play intro · 30s",
        figcaption: "30s intro · who I am",
    },

    counter: {
        // Numbers stay data — CountUp animates `value`, `suffix` renders raw.
        // Scope, not results — the CV states no outcome percentages. ~2,000 is
        // the firm the agents serve; 2 the agents built there; 10+ the
        // troubleshooting tools wired in; 100+ merged PRs (the CV's own total).
        items: [
            { value: 2000, suffix: "", label: "Staff Served by His Agents" },
            { value: 2, suffix: "", label: "Enterprise Agents Built" },
            { value: 10, suffix: "+", label: "Systems Wired to Agents" },
            { value: 100, suffix: "+", label: "Open-source PRs Merged" },
        ],
    },

    // Certification strip — sits right under the counter tiles, above the JD
    // matcher. The verify hrefs are locale data like the CV pair: same URLs on
    // both pages today, but the slot exists so either side can diverge.
    certs: {
        eyebrow: "Certifications",
        listAria: "Professional certifications",
        verify: "Verify",
        items: [
            {
                name: "Claude Certified Architect — Foundations",
                issuer: "Anthropic",
                badge: "/certs/claude-architect-foundations.png",
                href: "https://www.credly.com/badges/65cd527d-e468-4455-a587-359bec7eb248",
            },
            {
                name: "Microsoft Certified: AI Agent Builder Associate",
                issuer: "Microsoft",
                badge: "/certs/microsoft-certified-associate.svg",
                href: "https://learn.microsoft.com/api/credentials/share/en-au/EddyZhang-6413/5756621B66C96460?sharingId=D0B50DD46044F2FC",
            },
        ],
    },

    // Open-source strip — sits under the certifications. Star counts are the
    // scale proof and the card links straight to GitHub's own filtered list of
    // HIS merged PRs, so the claim verifies itself the way the certs do.
    // Stars and PR counts are the CV's (Dify 91, Haystack 14). GitHub's own
    // count only grows (Dify was 120 when this was written), so the link
    // always shows at least what the card claims.
    oss: {
        eyebrow: "Open Source",
        listAria: "Open-source contributions",
        // The identity claim, stated on the page rather than left buried in
        // the ?author= of a link. A reader should know whose contributions
        // these are BEFORE deciding whether to click through — and it is the
        // same handle the footer and contact rows already point at.
        handle: "@ShousenZHANG",
        handleHref: "https://github.com/ShousenZHANG",
        merged: (n) => `${n} PRs merged`,
        stars: "stars",
        items: [
            {
                repo: "langgenius/dify",
                name: "Dify",
                blurb: "Agentic LLM platform",
                stars: "150k+",
                prs: 91,
                work: "API request validation migrated to Pydantic models; strict mypy across test suites",
                href: "https://github.com/langgenius/dify/pulls?q=is%3Apr+author%3AShousenZHANG+is%3Amerged",
            },
            {
                repo: "deepset-ai/haystack",
                name: "Haystack",
                blurb: "RAG orchestration framework",
                stars: "26k+",
                prs: 14,
                work: "Embedding-based splitter fix for an unmerged trailing chunk; strict mypy checks",
                href: "https://github.com/deepset-ai/haystack/pulls?q=is%3Apr+author%3AShousenZHANG+is%3Amerged",
            },
        ],
    },

    jd: {
        title: "Match a JD against my CV",
        sub: "01 / Live AI Demo",
        lead: "Paste any job description — my own AI engine scores how well I fit, in real time. Same RAG + LLM stack I ship in production.",
        tryLabel: "Try:",
        // Three real-reading Australian JDs, one per path through the scorer:
        // a strong match (with one bonus he does not have — Kubernetes — so it
        // does not read as written from the CV), an adjacent field (model
        // training, which he has not done), and a hard fail on two eligibility
        // axes at once (years and citizenship).
        samples: [
            {
                label: "AI Agent Engineer",
                body: "AI Agent Engineer — Sydney (hybrid). Build internal agents with LangChain / LangGraph: own the RAG pipeline (parsing, embeddings, hybrid retrieval), ship an NL2SQL analytics assistant, and design tool integrations and prompts that keep model output grounded. 1–3 years in AI application or backend engineering; Python or Java; hands-on with Milvus, Elasticsearch or a similar retrieval stack. Bonus: open-source contributions to LLM frameworks, Spring Cloud microservices, Kubernetes. Full working rights in Australia required.",
            },
            {
                label: "LLM Research Engineer",
                body: "LLM Research Engineer — Melbourne. Own continued pre-training, SFT and RLHF for our domain models; build data-cleaning and evaluation pipelines; optimise inference latency and GPU memory. 3+ years in NLP or LLM research; expert PyTorch; DeepSpeed or Megatron for distributed training; hands-on LoRA / QLoRA fine-tuning. Publications at top venues preferred; PhD or Master's in a related field.",
            },
            {
                label: "Backend Lead (8 yrs, citizen)",
                body: "Senior Backend Engineering Lead — Canberra, on-site only. Architect and scale a high-throughput trading platform and lead a team of 5+ backend engineers. 8+ years of Java backend experience including 3+ years in people leadership; deep JVM tuning, distributed transactions and high-concurrency middleware. Must be an Australian citizen eligible for NV1 security clearance.",
            },
        ],
        loadingSteps: ["Parsing the JD", "Matching against my CV", "Scoring the fit"],
        placeholder: "Paste the JD here — stack, responsibilities, experience band, visa, location…",
        inputAria: "Job description input",
        analyse: "Check Fit",
        analysing: "Analysing…",
        // SR-only verdict sentence; headline may be absent (LLM omission).
        srResult: (fitLabel, score, headline) =>
            `${fitLabel}. Score ${score} out of 100.${headline ? " " + headline : ""}`,
        moreCount: (n) => `+${n} more`,
        // Segments, not sentences: "Check Fit" carries its own styled <span>
        // mid-sentence, so the component assembles before/cta/after in JSX —
        // never innerHTML. Leading/trailing spaces are part of the strings.
        emptyLoaded: {
            before: "JD loaded — hit ",
            cta: "Check Fit",
            after: " to score it. Results render here in a few seconds.",
        },
        emptyIdle: {
            before: "Pick a sample above or paste a real JD, then hit ",
            cta: "Check Fit",
            after: ". Results render here in a few seconds.",
        },
        outOf100: "/ 100",
        subScores: {
            exact: "Exact",
            related: "Related",
            gap: "Gap",
            confidence: "Confidence",
        },
        // Keyed by the response's dimensionScores field names.
        dims: {
            techStack: "Tech Stack",
            responsibilities: "Responsibilities",
            domainContext: "Domain",
            seniority: "Seniority",
        },
        // Row captions only. The status VALUES ("OK"/"Issue"/"Unknown") are
        // wire enums colour-matched with ===; statusUnknown is only the
        // render-time fallback when the API omits a status entirely.
        eligibilityNames: {
            visa: "Visa",
            experience: "Experience",
            location: "Location",
        },
        // The eligibility status VALUES stay ASCII on the wire (STATUS_COLOR
        // matches them with ===). This maps them to display text at the last
        // render step, which is the only place a locale may touch them.
        statuses: { OK: "OK", Issue: "Issue", Unknown: "Unknown" },
        statusUnknown: "Unknown",
        matched: "Matched",
        gaps: "Gaps",
        suggestions: "Suggested actions",
        riskFlags: "Risk flags",
        // Client-side validation/transport errors (useJDAnalysis). Server and
        // LLM error strings pass through untranslated — they live in api/.
        errors: {
            empty: "Please paste the job description first.",
            // Caller passes the raw cap; the dictionary owns the formatting
            // (matches the pre-i18n `MAX_JD_LENGTH.toLocaleString()`).
            tooLong: (max) => `JD text is too long (max ${max.toLocaleString()} characters).`,
            cvMissing: "CV text is empty. Please check /public/cv/main.txt.",
            requestFailed: (status) => `Request failed: ${status}`,
            failed: "Analysis failed. Please try again later.",
        },
    },

    logos: {
        // The logo names stay in LogoSection.jsx — brand names, identical in
        // every locale, rendered as alt + title straight from the list.
        eyebrow: "Tools I work with daily",
    },

    experience: {
        // The rail carries two degrees as well as the roles, so the title
        // says so — a reader should not take the degree cards for jobs.
        title: "Experience & Education",
        sub: "02 / Experience",
        currentAria: "current role",
        nowBadge: "NOW",
        currentBadge: "Current",
        // Prefix for the "see the project" links under a role.
        seeProject: "Project",
        // Card titles keep the " — " (space, U+2014, space) separator —
        // Experience.jsx splits role/company on exactly that. Dates keep
        // Arabic 4-digit years — the rail's yearmark regex (\d{4}) needs them.
        // `projects` holds indexes into showcase.projects: the card links down
        // to them instead of restating their mechanics and figures.
        cards: [
            {
                title: "Junior Integration & Automation Analyst (Fixed-term) — Corrs Chambers Westgarth",
                date: "Mar 2026 – Jul 2026",
                // Scope only — the mechanics live once, in Selected Work,
                // which these cards link to.
                responsibilities: [
                    "Built two LLM agents for a law firm of ~2,000 staff: an IT support ticket agent and an NL2SQL analytics agent.",
                    "Hallucination control across both: scenario-specific system prompts, fact checking and source attribution, and SQL constrained to the recalled schema and checked with EXPLAIN.",
                ],
                projects: [0, 1],
            },
            {
                title: "Master of Information Technology — UNSW Sydney",
                date: "Sep 2023 – Jun 2025",
                responsibilities: [
                    "WAM 82.4/100 (Excellence), top 10% of the cohort, at a QS #19 university.",
                    "Runner-up, Coding Fest 2025.",
                ],
                projects: [],
            },
            {
                title: "Software Engineer (Java Backend) — Newtouch Software Co., Ltd.",
                date: "Aug 2022 – Apr 2023",
                responsibilities: [
                    "Integration-tested Java CRUD APIs (Spring Boot, MyBatis, Oracle) for a bank’s core business platform, in a 20-person agile team.",
                ],
                projects: [2],
            },
            {
                title: "Bachelor of Engineering (Mechatronic) — Suzhou Institute of Technology, Jiangsu University of Science and Technology",
                date: "Sep 2016 – Jun 2020",
                responsibilities: [],
                projects: [],
            },
        ],
    },

    showcase: {
        title: "Selected Work",
        sub: "03 / Selected Work",
        // Captions on each project's before → after shift.
        before: "Before",
        after: "After",
        // Index-aligned with constants/projects.js (ids and tech tags live
        // there). All three are internal enterprise systems with no public UI
        // to screenshot, so each is drawn as its real execution path by
        // ProjectDiagram — which is the thing a technical reader wants to
        // judge anyway: did he actually build this pipeline? {curly} spans are
        // render-time highlight markers.
        projects: [
            {
                title: "IT Support Ticket Agent",
                meta: "Corrs Chambers Westgarth · Mar 2026 – Jul 2026",
                description:
                    "IT support for a law firm of ~2,000 staff: a {LangChain} RAG pipeline over SOPs, architecture docs, incident reviews and past tickets, embedded into {Milvus} with versioned incremental sync. Metadata filters keep look-alike matches from the wrong system out, and the agent calls {10+ standardised tools} — link tracing, monitoring, API health, SAP node and permission checks — to diagnose from live operational data.",
                // The shift the project made, in the CV's own terms: it states
                // no percentages, so the focal element is before → after.
                lead: { from: "Manual triage, system by system", to: "Agent diagnoses, staff verify" },
                outcomes: [
                    "Every answer cites its document, section and related tickets; per-ticket MongoDB memory reloads checked nodes and conclusions across turns",
                    "Unresolved issues become compliant ticket drafts, filed after human confirmation with the full trace attached",
                ],
                diagram: {
                    label: "Triage pipeline",
                    steps: [
                        { t: "Multi-source ingestion", d: "SOPs, architecture docs, incident reviews, past tickets — versioned, synced incrementally" },
                        { t: "Vector indexing", chips: ["Embedding", "Milvus"] },
                        { t: "RAG + metadata filters", d: "System module, error type, compliance level" },
                        { t: "Agent calls tools", chips: ["Tracing", "Monitoring", "API health", "SAP checks"], d: "10+ standardised tools" },
                        { t: "Sourced fix / drafted ticket", d: "Cites document and section; unresolved cases become drafts", end: true },
                    ],
                },
            },
            {
                title: "NL2SQL Analytics Agent",
                meta: "Corrs Chambers Westgarth · Mar 2026 – Jul 2026",
                description:
                    "A config-driven metadata layer — tables, fields, metric definitions, enum values — indexed in {Milvus} for meaning and {Elasticsearch} for exact field values, recalled in parallel alongside {MySQL} inside a traceable {LangGraph} workflow. SQL is constrained to the recalled schema, checked with {EXPLAIN} and repaired by feeding the error back to the model.",
                lead: { from: "Day-long data-team queues", to: "Minute-level self-service" },
                outcomes: [
                    "Staff ask in plain language instead of filing a request and waiting for the data team",
                    "Generate–validate–repair loop: SQL may only use recalled fields, and an EXPLAIN failure goes back to the model to fix",
                ],
                diagram: {
                    label: "LangGraph workflow",
                    steps: [
                        { t: "Keyword extraction", d: "Tokenise the question into business terms" },
                        { t: "Parallel recall", chips: ["Milvus", "Elasticsearch", "MySQL"] },
                        { t: "Merge · second-pass filter", d: "Drop irrelevant tables and metrics; add context" },
                        { t: "Generate SQL", loop: "EXPLAIN check · repair" },
                        { t: "Return result", d: "Minute-level, self-served", end: true },
                    ],
                },
            },
            {
                title: "Banking Core Platform",
                meta: "Newtouch Software · Aug 2022 – Apr 2023",
                description:
                    "A bank’s core business platform for its insurance lines. In a 20-person agile team I delivered integration-tested Java CRUD APIs for policy, document and product-configuration modules, extended the framework with {reusable components and extension points}, and tuned high-concurrency queries with {multi-level Redis caching} and {execution-plan optimisation}.",
                lead: { from: "Changing platform code", to: "Implementing an extension point" },
                outcomes: [
                    "New insurance scenarios ship by implementing extension points rather than changing platform code",
                    "RESTful cross-system interfaces, and a MinIO file tool with tiered download and read-only preview permissions",
                ],
                diagram: {
                    label: "Platform layers",
                    steps: [
                        { t: "Insurance product lines", chips: ["Policies", "Documents", "Product config"] },
                        { t: "Shared components · extension points", d: "New scenarios plug in; platform code stays untouched" },
                        { t: "RESTful cross-system APIs", d: "Data exchange across the bank’s platforms" },
                        { t: "Multi-level caching", chips: ["Redis", "SQL plans"], d: "High-concurrency query paths" },
                        { t: "Split storage", chips: ["Oracle", "MinIO"], end: true },
                    ],
                },
            },
        ],
    },

    skills: {
        title: "Skill Constellation",
        sub: "04 / Stack",
        lead: "The agent and backend stack I work with, mapped by how it connects — LangChain and LangGraph orchestrate, Milvus, Elasticsearch and MySQL retrieve, Python and Java carry it. Hover or tap a node to trace its links; select one to see where I used it.",
        graphAria: "Interactive skills graph",
        // `category` is the localised cats label for the node's cluster.
        nodeAria: (label, category) => `${label}, ${category}`,
        linksCount: (n) => `${n} links`,
        shippedIn: "Used in",
        linkedSkills: "Linked skills",
        // The resting panel's shortcut list: the best-connected nodes.
        mostLinked: "Most connected",
        interactive: "Interactive",
        hint: "Click any node to see the projects, roles and platforms behind each skill.",
        // Keys mirror the cats in data/skillGraph.js (structure, not copy).
        cats: {
            agent: "Agents & LLMs",
            retrieval: "Retrieval & Data",
            eng: "Python & Java",
            mw: "Middleware",
            ops: "Deployment",
        },
        // Keyed by node id. Labels are product names; the `used` evidence
        // lines are prose and get written per locale. Geometry, categories and
        // edges live in data/skillGraph.js.
        nodes: {
            langchain: { label: "LangChain", used: ["Ticket agent — RAG pipeline and agent core", "Tool calling across 10+ troubleshooting tools"] },
            langgraph: { label: "LangGraph", used: ["NL2SQL agent — traceable workflow", "Generate–validate–repair loop"] },
            rag: { label: "RAG", used: ["Semantic search + metadata filters", "Answers cite document, section and tickets"] },
            nl2sql: { label: "NL2SQL", used: ["Day-long queues → minute-level self-service", "SQL constrained to the recalled schema"] },
            prompt: { label: "Prompt Eng.", used: ["Scenario-specific system prompts", "Fact checking and source attribution"] },
            tools: { label: "Agent Tools", used: ["Function calling and MCP", "Link tracing, monitoring, API health, SAP checks"] },
            embedding: { label: "Embedding", used: ["SOPs, docs and past tickets vectorised", "Warehouse metadata vectorised"] },
            milvus: { label: "Milvus", used: ["Ticket knowledge base, versioned sync", "Field and metric semantic index"] },
            es: { label: "Elasticsearch", used: ["Exact field-value index", "One leg of the hybrid recall"] },
            mysql: { label: "MySQL", used: ["Hybrid recall — structured queries"] },
            mongodb: { label: "MongoDB", used: ["Per-ticket conversation memory", "Checked nodes and conclusions reloaded"] },
            java: { label: "Java", used: ["Banking platform — insurance policy, document and product APIs"] },
            springboot: { label: "Spring Boot", used: ["Banking platform — integration-tested CRUD APIs"] },
            python: { label: "Python", used: ["Agent pipelines in LangChain and LangGraph", "Pydantic, pytest and mypy in Dify and Haystack PRs"] },
            mybatis: { label: "MyBatis", used: ["Banking platform persistence layer"] },
            oracle: { label: "Oracle", used: ["Banking platform database"] },
            redis: { label: "Redis", used: ["Multi-level caching for high-concurrency queries"] },
            rabbitmq: { label: "RabbitMQ", used: ["Reliable, idempotent messaging"] },
            minio: { label: "MinIO", used: ["File tool with tiered download and read-only preview"] },
            docker: { label: "Docker", used: ["Containerised deployment"] },
            linux: { label: "Linux", used: ["Deploys his own services end to end"] },
        },
    },

    contact: {
        title: "Get in Touch",
        sub: "05 / Contact",
        lead: "Hiring for agents, RAG or NL2SQL? Paste the JD into the matcher above for an instant read — or reach me directly below. Open to full-time roles in Sydney or remote.",
        // The mailto href is derived at render (`mailto:` + email) — only the
        // address itself is locale data.
        channels: {
            emailLabel: "Email",
            email: EMAIL,
            phoneLabel: "Phone",
            phoneDisplay: PHONE_DISPLAY,
            phoneHref: PHONE_HREF,
        },
        socialAria: {
            linkedin: "LinkedIn",
            github: "GitHub",
        },
        available: "Available for work",
        form: {
            name: "Name",
            email: "Email", // form-field label — distinct key from channels.emailLabel (false friend)
            message: "Message",
            honeypotLabel: "Website", // visually hidden but real label text
            placeholders: {
                name: "Your name",
                email: "your@email.com",
                message: "What would you like to discuss?",
            },
            send: "Send Message",
            sending: "Sending…",
            sentTitle: "Message Sent",
            sentBody: "Thanks for reaching out. I'll get back to you soon.",
            close: "Close",
            error: "Failed to send message. Please try again or email me directly.",
        },
    },

    footer: {
        wordmark: "Let’s build.",
        wordmarkAria: "Go to the contact section",
        socialAria: {
            linkedin: "LinkedIn profile",
            github: "GitHub profile",
        },
        backToTop: "Back to top",
        rights: (year) => `© ${year} Eddy Zhang. All rights reserved.`,
        location: "Sydney, Australia",
    },

    ed: {
        chips: [
            "What has he actually shipped?",
            "How does his NL2SQL agent work?",
            "What's Eddy's visa status?",
            "How do I get in touch with him?",
        ],
        panelAria: "E.D. — Eddy's AI assistant",
        eyebrow: "E.D. · Eddy’s Digital Deputy",
        voiceOn: "Voice replies on",
        voiceOff: "Voice replies off",
        close: "Close E.D.",
        statusListening: "LISTENING — TAP MIC TO SEND",
        statusThinking: "PROCESSING…",
        statusSpeaking: "RESPONDING…",
        statusIdle: "ASK ME ABOUT EDDY", // idle with messages renders a literal " " — structural, stays in the component
        // The deck's single polite live region.
        announceListening: "Listening.",
        announceThinking: "Processing.",
        // Phase labels rendered raw inside the thinking bubble.
        thinking: "thinking",
        transcribing: "transcribing",
        inputPlaceholder: "Ask about Eddy — experience, visa, projects…",
        inputAria: "Ask E.D. a question",
        micAria: { listen: "Ask by voice", stop: "Stop listening" },
        sendAria: { send: "Send", stop: "Stop recording and send" },
        errors: {
            fault: (status) => `E.D. hit a fault (${status}).`,
            unreachable: `E.D.'s core is unreachable. Reach Eddy directly: ${EMAIL}`,
            micBlocked: "Microphone access is blocked — check the address-bar permission, or just type.",
            transcribeFailed: "Transcription failed.",
            noSpeech: "Didn't catch that — try again, or type it.",
            voiceSnag: "Voice input hit a snag — typing works just as well.",
        },
    },
};
