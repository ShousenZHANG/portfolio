/**
 * English dictionary — the source language. Every string is lifted VERBATIM
 * from the components; the English page must render byte-identically to the
 * pre-i18n site. Punctuation is load-bearing: em dashes (—), en dashes (–) in
 * date ranges, middle dots (·), ellipses (…) and the curly apostrophes (’)
 * that came from &rsquo; are the exact glyphs the components rendered — do
 * not "fix" them to ASCII.
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
const PHONE_DISPLAY = "+61 0468 761 056";
const PHONE_HREF = "tel:+610468761056";

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
        eyebrow: "AI Engineer · Copilot Studio · Sydney",
        // Word array for the masked stagger — `sig` marks the decode word,
        // `br` breaks the line after it. headlineAria must always read as the
        // assembled sentence (it is the h1's accessible name).
        headline: [
            { t: "I", sig: false },
            { t: "build", sig: false, br: true },
            { t: "intelligent", sig: true },
            { t: "agents.", sig: false },
        ],
        headlineAria: "I build intelligent agents.",
        lead: "I build production agents across the Microsoft ecosystem — Copilot Studio, MCP, Power Automate, Dataverse — and ship end-to-end LLM products solo. Below is a live one: paste any job description and watch my AI score the fit in real time.",
        ctaPrimary: "Try the live AI matcher",
        ctaCv: "Download CV",
        // The CV pair is locale DATA, not an asset constant — the zh entry
        // ships a different file under a different download name.
        cvHref: "/files/Eddy_Zhang_CV.pdf",
        cvDownloadName: "Eddy_Zhang_CV.pdf",
        available: "Available for work",
        stackLine: "Copilot Studio · Power Automate · Dataverse · MCP",
        askEd: "Ask E.D. about him ↗",
        videoAria: "Personal introduction video by Eddy Zhang",
        playAria: "Play 30-second intro",
        playLabel: "Play intro · 30s",
        figcaption: "30s intro · who I am",
    },

    counter: {
        // Numbers stay data — CountUp animates `value`, `suffix` renders raw.
        items: [
            { value: 2, suffix: "", label: "Copilot Agents Published" },
            { value: 10, suffix: "+", label: "Staff Using His Agents" },
            { value: 5, suffix: "", label: "Enterprise Systems Unified" },
            { value: 2100, suffix: "+", label: "Automated Tests Behind Joblit" },
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
    // Counts are the CV's conservative rounding (Dify was 154k and Haystack
    // 26k when written) — a figure that only grows stays true.
    oss: {
        eyebrow: "Open Source",
        listAria: "Open-source contributions",
        merged: (n) => `${n} PRs merged`,
        stars: "stars",
        items: [
            {
                repo: "langgenius/dify",
                name: "Dify",
                blurb: "Agentic LLM platform",
                stars: "150k+",
                prs: 5,
                work: "Pydantic dependency-injection refactors across the API layer",
                href: "https://github.com/langgenius/dify/pulls?q=is%3Apr+author%3AShousenZHANG+is%3Amerged",
            },
            {
                repo: "deepset-ai/haystack",
                name: "Haystack",
                blurb: "RAG orchestration framework",
                stars: "25k+",
                prs: 4,
                work: "mypy typing gates and a document-splitter bug fix",
                href: "https://github.com/deepset-ai/haystack/pulls?q=is%3Apr+author%3AShousenZHANG+is%3Amerged",
            },
        ],
    },

    jd: {
        title: "Match a JD against my CV",
        sub: "01 / Live AI Demo",
        lead: "Paste any job description — my own AI engine scores how well I fit, in real time. Same RAG + LLM stack I ship in production.",
        tryLabel: "Try:",
        samples: [
            {
                label: "Senior React Engineer",
                body: "Senior React Engineer — Sydney (hybrid). 5+ years with React and TypeScript, building component libraries and design systems. Strong with Node.js REST APIs and AWS. You will mentor junior engineers and own frontend architecture. Full working rights in Australia required.",
            },
            {
                label: "ML / AI Engineer",
                body: "Machine Learning Engineer. Ship production AI features: LLM agents, RAG pipelines, prompt engineering, vector databases. Python and cloud-native services. Experience with OpenAI / Anthropic APIs. Remote within Australia.",
            },
            {
                label: "Full-Stack (PR required)",
                body: "Full-Stack Developer — Next.js, PostgreSQL, Docker, CI/CD on Vercel. Own features end to end. Must be an Australian citizen or hold permanent residency.",
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
        // The 13 logo names stay in LogoSection.jsx — brand names, identical
        // in every locale, rendered as alt + title straight from the list.
        eyebrow: "Tools I work with daily",
    },

    experience: {
        title: "Professional Experience",
        sub: "02 / Experience",
        currentAria: "current role",
        nowBadge: "NOW",
        currentBadge: "Current",
        // Card titles keep the " — " (space, U+2014, space) separator —
        // Experience.jsx splits role/company on exactly that. Dates keep
        // Arabic 4-digit years — the rail's yearmark regex (\d{4}) needs them.
        cards: [
            {
                title: "AI Engineer (Volunteer) — Stepping Stone House",
                date: "Jul 2026 – Aug 2026",
                responsibilities: [
                    "Built and published two Copilot Studio agents now used by 10+ staff, grounding answers in curated Markdown knowledge via MCP tool calls and purpose-built agent Skills.",
                    "Built a C#/Python desktop tool converting 15+ document, audio and web formats into agent-ready Markdown via MarkItDown, faster-whisper and Playwright, powering the agents' curated knowledge base.",
                    "Automated audit archiving of Teams AI meeting notes: a weekly Power Automate workflow pulls ~10 meetings' notes via the Microsoft Graph meeting AI insights API, converts them to Word and files them in SharePoint.",
                ],
            },
            {
                title: "Junior Integration & Automation Analyst (Fixed-term) — Corrs Chambers Westgarth",
                date: "Mar 2026 – Jul 2026",
                responsibilities: [
                    "Led end-to-end architecture of a trusted knowledge-management agent: chose the Microsoft stack and designed the Dataverse data model and ingestion workflows that make every stored answer verifiable.",
                    "Engineered reusable agent Skills shared across the firm’s Copilot Studio agents, consolidating retrieval logic so each query loads only the context it needs rather than the full knowledge set.",
                    "Delivered and piloted the agent across five platforms — ServiceNow, SharePoint, Loop, NetDocs and Intapp — letting staff query trusted knowledge and submit articles through an AI-assisted review flow.",
                    "Built a daily agent flow calling the Boomi API to pull production logs, AI-analyse failures and route findings to the support team — replacing ~30 minutes of daily manual triage.",
                    "Prototyped natural-language creation of Boomi integration flows from a Copilot agent: payroll staff describe a need and the agent builds the flow, database connection and a simple front end via the Boomi Flow API.",
                ],
            },
            {
                title: "Master of Information Technology — UNSW Sydney",
                date: "Sep 2023 – Jun 2025",
                responsibilities: [
                    "Graduated with WAM 82.4/100 — Award Level: Excellence.",
                    "Built the backend of the Coding Fest 2025 runner-up project — a Spring Cloud microservices competition platform.",
                            ],
            },
            {
                title: "Software Engineer — Newtouch Software Co., Ltd.",
                date: "Aug 2022 – Apr 2023",
                responsibilities: [
                    "Developed Java/Spring Boot microservices and RESTful APIs, and designed the MinIO storage migration.",
                ],
            },
        ],
    },

    showcase: {
        title: "Selected Work",
        sub: "03 / Selected Work",
        fallbackEyebrow: "Enterprise Project", // no-slides fallback — latent, kept translatable
        viewOnGithub: "View on GitHub",
        liveDemo: "Live Demo",
        // Index-aligned with constants/projects.js. Only copy lives here;
        // srcs, dimensions, hrefs, ids and tech-brand tags stay in the data
        // file. {curly} spans are render-time highlight markers — verbatim.
        projects: [
            {
                title: "Joblit",
                alts: [
                    "Joblit AI-powered landing page with live demo",
                    "Joblit jobs workspace with AI keyword highlighting",
                    "Joblit Chrome Extension auto-filling ATS application form",
                    "Joblit resume builder with PDF preview",
                    "Joblit AutoFill Chrome Extension installation page",
                ],
                description:
                    "A {production AI job platform, architected solo} — a {LangGraph state machine} drives generate-validate-repair through a local {Hermes Agent sidecar}, with deterministic index-based guardrails and {2,100+ tests} across five CI gates.",
                outcomes: [
                    "Generate → validate → repair, as an explicit LangGraph state machine rather than a prompt-and-hope call",
                    "Deterministic index-based guardrails: the model returns integer positions into the candidate’s own profile and cannot name a skill it does not carry",
                    "A local Hermes Agent sidecar runs generation on the candidate’s own model — no server-side model keys",
                ],
            },
            {
                title: "Scalable Competition Platform",
                alts: [
                    "Coding Fest 2025 Runner-up Certificate",
                    "Coding Fest 2025 Award Ceremony Team Photo",
                    "System Architecture",
                    "CI/CD Pipeline",
                ],
                description:
                    "Cloud-native competition system — {Spring Cloud microservices} secured with {OAuth2/JWT}, with {event-driven RabbitMQ messaging} powering real-time notifications across services.",
                highlight: {
                    title: "Runner-up — Best Project in AI for Education",
                    description: "Recognized at Coding Fest 2025 (University of Sydney) for innovation and impact.",
                    sponsor: "Sponsored by Atlassian and Flow Traders.",
                    ctaLabel: "View Award Certificate",
                },
            },
        ],
    },

    skills: {
        title: "Skill Constellation",
        sub: "04 / Stack",
        lead: "The Microsoft 365 agent stack I build with — Copilot Studio, Power Platform, and the AI around them — mapped by how it connects. Tap or hover a node to trace its links; select one to see what I shipped with it.",
        graphAria: "Interactive skills graph",
        // `category` is the localised CATS label for the node's cluster.
        nodeAria: (label, category) => `${label}, ${category}`,
        linksCount: (n) => `${n} links`,
        shippedIn: "Shipped in",
        linkedSkills: "Linked skills",
        interactive: "Interactive",
        hint: "Click any node to see the projects, roles and platforms behind each skill.",
        // Keys mirror the component's CATS keys (structure, not copy).
        cats: {
            ms: "Microsoft & Power Platform",
            ai: "AI & Agents",
            data: "Integration & Data",
            eng: "Software Engineering",
            cloud: "Cloud & DevOps",
        },
        // Keyed by NODE id. Labels are product names (identical in zh, kept
        // here as data so the shape contract stays exhaustive); the `used`
        // evidence lines are prose and DO get rewritten per locale.
        // Coordinates, radii, categories and edges stay in the component.
        nodes: {
            copilot: { label: "Copilot Studio", used: ["Stepping Stone House — 2 published agents", "Corrs — trusted KM agent"] },
            pautomate: { label: "Power Automate", used: ["Teams meeting-notes archiving", "Corrs daily log-triage flow"] },
            dataverse: { label: "Dataverse", used: ["Corrs — verifiable KM data model", "reusable agent Skills"] },
            powerapps: { label: "Power Apps", used: ["Microsoft Power Platform"] },
            agents: { label: "AI Agents", used: ["2 published agents — 10+ staff (SSH)", "Corrs KM agent — piloted across 5 platforms"] },
            rag: { label: "RAG", used: ["Curated Markdown knowledge (SSH)", "Corrs trusted answers"] },
            mcp: { label: "MCP", used: ["SSH agents — grounded via MCP tool calls"] },
            llmorch: { label: "LLM Orchestration", used: ["Joblit — any-LLM, Zod-validated"] },
            prompt: { label: "Prompt Eng.", used: ["Joblit prompt contracts", "JD matcher"] },
            boomi: { label: "Boomi", used: ["Corrs log triage (~30 min/day saved)", "NL flow-building prototype"] },
            servicenow: { label: "ServiceNow", used: ["1 of 5 platforms the Corrs agent spans"] },
            playwright: { label: "Playwright", used: ["SSH Markdown conversion tool"] },
            sql: { label: "SQL / REST", used: ["Newtouch APIs", "Contest Platform"] },
            java: { label: "Java + Spring", used: ["Newtouch (+ MinIO migration)", "Contest Platform"] },
            python: { label: "Python", used: ["SSH desktop tool — 15+ formats"] },
            ts: { label: "TypeScript", used: ["Joblit", "this portfolio"] },
            react: { label: "React / Next", used: ["This portfolio", "Joblit"] },
            azure: { label: "Azure", used: ["The platform Copilot Studio and Dataverse run on"] },
            aws: { label: "AWS", used: ["Contest Platform"] },
            docker: { label: "Docker", used: ["Contest Platform", "Newtouch"] },
            cicd: { label: "CI/CD", used: ["Contest Platform", "Joblit"] },
        },
    },

    contact: {
        title: "Get in Touch",
        sub: "05 / Contact",
        lead: "Open to full-time roles and interesting collaborations. Quick to learn, clear in communication, honest about trade-offs — the fastest way to reach me is below, or send a note and I'll reply soon.",
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
        wordmark: "Let’s build.", // &rsquo; in source — keep the curly apostrophe
        wordmarkAria: "Go to the contact section",
        // Channel values come from contact.channels — the footer only owns
        // the aria phrasings wrapped around them.
        emailAria: (email) => `Email ${email}`,
        phoneAria: (phone) => `Phone ${phone}`,
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
            "What's Eddy's visa status?",
            "Why did he pivot to Copilot Studio?",
            "What has he actually shipped?",
            "How do I get in touch with him?",
        ],
        panelAria: "E.D. — Eddy's AI assistant",
        eyebrow: "E.D. · Eddy’s Digital Deputy", // &rsquo; in source
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
