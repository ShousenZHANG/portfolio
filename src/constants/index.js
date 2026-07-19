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
// - "3+ years" matches the CV summary verbatim.
// - "2 production Copilot agents" = Stepping Stone House + Corrs, both shipped.
// - "10+ Skills & flows" = reusable agent Skills + Power Automate agent flows + pipelines.
// - "40K+ lines" = the Contest Platform's stated 40,000+ LOC.
const counterItems = [
  { value: 3, suffix: "+", label: "Years Building Production Software" },
  { value: 2, suffix: "", label: "Production Copilot Agents Shipped" },
  { value: 10, suffix: "+", label: "AI Agent Skills & Flows Shipped" },
  { value: 40, suffix: "K+", label: "Lines of Production Code Shipped" },
];

const expCards = [
  {
    title: "AI Engineer — Stepping Stone House",
    date: "Jul 2026 – Present",
    responsibilities: [
      "Shipped a production Copilot Studio agent grounded in SharePoint via MCP, fed by a Power Automate flow that captures meeting notes, converts them to Word, and archives them automatically.",
      "Built an automated Python pipeline using open-source MarkItDown and Playwright that converts documents and web pages into Markdown, so the agent retrieves answers more accurately.",
    ],
  },
  {
    title: "Junior Integration & Automation Analyst — Corrs Chambers Westgarth",
    date: "Mar 2026 – Jul 2026",
    responsibilities: [
      "Shipped a production Copilot Studio agent in Teams that helps staff find trusted answers across enterprise systems.",
      "Built a scheduled workflow that calls the Boomi REST API to triage and diagnose production log errors.",
      "Engineered reusable agent Skills that raise answer accuracy while cutting Credit cost, alongside dynamic Power Automate agent flows orchestrating multi-step business logic.",
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
