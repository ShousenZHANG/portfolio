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

// Every stat is defensible against the CV, and none contradict each other:
// - "3+ years full-stack" matches the CV summary verbatim.
// - "4 enterprise systems" = SharePoint / ServiceNow / Loop / NetDocuments (Corrs Copilot agent).
// - "10+ Copilot & AI agent Skills" = Dataverse agent Skills + Joblit skill pack.
// - "40K+ lines" = the Contest Platform's stated 40,000+ LOC.
const counterItems = [
  { value: 3, suffix: "+", label: "Years Building Production Software" },
  { value: 4, suffix: "", label: "Systems Unified by AI Agents" },
  { value: 10, suffix: "+", label: "Copilot & AI Agent Skills Shipped" },
  { value: 40, suffix: "K+", label: "Lines of Production Code Shipped" },
];

const expCards = [
  {
    title: "Junior Integration & Automation Analyst — Corrs Chambers Westgarth",
    date: "Mar 2026 – Jun 2026",
    responsibilities: [
      "Shipped a production Copilot Studio agent in the Microsoft 365 ecosystem that lets staff find technical solutions across SharePoint, ServiceNow, Loop, and NetDocuments via MCP and Work IQ.",
      "Designed a Dataverse-backed trusted knowledge base — the data model and pipeline that store document metadata so the agent retrieves only vetted content.",
      "Engineered reusable agent Skills in Dataverse that raise answer accuracy while cutting Credit cost.",
      "Built dynamic Power Automate agent flows that orchestrate multi-step business logic across enterprise systems.",
      "Automated daily Boomi production-log triage with a scheduled Copilot Studio flow that calls the Boomi API, analyses errors against a knowledge base, and emails fix recommendations.",
    ],
  },
  {
    title: "Master of Information Technology — UNSW Sydney",
    date: "Sep 2023 – Jun 2025",
    responsibilities: [
      "Graduated with Excellence Honours (WAM 82.4/100), completing the program one term early.",
      "Led the Coding Fest 2025 runner-up project — a scalable Spring Cloud microservices competition platform.",
      "Explored AI disciplines including machine learning, NLP, and large language models (LLMs).",
    ],
  },
  {
    title: "Software Engineer — Newtouch Software Co., Ltd.",
    date: "Aug 2022 – Apr 2023",
    responsibilities: [
      "Developed and maintained high-scale microservices and RESTful APIs using Java and Spring Boot.",
      "Implemented unit testing using JUnit to improve code reliability and reduce production regressions.",
      "Delivered repeatable releases by containerising services with Docker and running CI/CD pipelines on Linux.",
    ],
  },
];

export {
  counterItems,
  expCards,
  navLinks,
};
