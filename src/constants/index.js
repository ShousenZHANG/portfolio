// Nav links follow page order (02 Experience → 03 Projects → 04 Skills)
// so the active indicator glides left-to-right as the user scrolls.
const navLinks = [
  {
    name: "Experience",
    link: "#experience",
  },
  {
    name: "Projects",
    link: "#projects",
  },
  {
    name: "Skills",
    link: "#skills",
  },
];

// Every stat quotes a specific CV line verbatim — no round numbers a
// recruiter could arithmetic-check into a lie, and no verb the CV didn't
// use ("published" and "piloted" are not interchangeable):
// - 2 published = "Built and published two Copilot Studio agents" (SSH).
// - 10+ staff = "now used by 10+ staff" (SSH).
// - 5 platforms = ServiceNow, SharePoint, Loop, NetDocs, Intapp (Corrs).
// - 2,100+ tests across five CI gates = Joblit.
const counterItems = [
  { value: 2, suffix: "", label: "Copilot Agents Published" },
  { value: 10, suffix: "+", label: "Staff Using His Agents" },
  { value: 5, suffix: "", label: "Enterprise Systems Unified" },
  { value: 2100, suffix: "+", label: "Automated Tests Behind Joblit" },
];

const expCards = [
  {
    title: "AI Engineer — Stepping Stone House",
    date: "Jul 2026 – Aug 2026",
    responsibilities: [
      "Built and published two Copilot Studio agents now used by 10+ staff, grounding answers in curated Markdown knowledge via MCP tool calls and purpose-built agent Skills.",
      "Built a C#/Python desktop tool converting 15+ document, audio and web formats into agent-ready Markdown via MarkItDown, faster-whisper and Playwright, powering the agents' curated knowledge base.",
      "Automated audit archiving of Teams AI meeting notes: a weekly Power Automate workflow pulls ~10 meetings' notes via the Microsoft Graph meeting AI insights API, converts them to Word and files them in SharePoint.",
    ],
  },
  {
    title: "Junior Integration & Automation Analyst — Corrs Chambers Westgarth",
    date: "Mar 2026 – Jul 2026",
    responsibilities: [
      "Led end-to-end architecture of a trusted knowledge-management agent: chose the Microsoft stack and designed the Dataverse data model and ingestion workflows that make every stored answer verifiable.",
      "Delivered and piloted the agent across five platforms — ServiceNow, SharePoint, Loop, NetDocs and Intapp — letting staff query trusted knowledge and submit articles through an AI-assisted review flow.",
      "Built a daily agent flow calling the Boomi API to pull production logs, AI-analyse failures and route findings to the support team — replacing ~30 minutes of daily manual triage.",
      "Prototyped natural-language creation of Boomi integration flows from a Copilot agent: payroll staff describe a need and the agent builds the flow, database connection and a simple front end via the Boomi Flow API.",
      "Engineered reusable agent Skills that raised answer accuracy while cutting per-query Copilot Credit cost across the firm's Copilot Studio agents.",
    ],
  },
  {
    title: "Master of Information Technology — UNSW Sydney",
    date: "Sep 2023 – Jun 2025",
    responsibilities: [
      "Graduated with Excellence Honours (WAM 82.4/100).",
      "Built the backend of the Coding Fest 2025 runner-up project — a Spring Cloud microservices competition platform.",
      "Explored AI disciplines including machine learning, NLP, and large language models (LLMs).",
    ],
  },
  {
    title: "Software Engineer — Newtouch Software Co., Ltd.",
    date: "Aug 2022 – Apr 2023",
    responsibilities: [
      "Developed Java/Spring Boot microservices and RESTful APIs, and designed the MinIO storage migration.",
      "Containerised services with Docker and ran CI/CD pipelines on Linux for repeatable releases.",
    ],
  },
];

export {
  counterItems,
  expCards,
  navLinks,
};
