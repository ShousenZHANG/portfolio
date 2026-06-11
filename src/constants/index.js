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

const counterItems = [
  { value: 5, suffix: "+", label: "Years in Software Development" },
  { value: 3, suffix: "+", label: "Years of Professional Experience" },
  { value: 10, suffix: "+", label: "AI Agent Skills Built & Deployed" },
  { value: 50, suffix: "K+", label: "Lines of AI-Powered Code Shipped" },
];

const expCards = [
  {
    title: "Junior Integration & Automation Analyst — Corrs Chambers Westgarth",
    date: "Mar 2026 – Present",
    responsibilities: [
      "Developed integration workflows on Boomi to automate cross-system data processing and business operations.",
      "Automated previously manual processes by orchestrating enterprise workflows through AI agents — lifting team efficiency with built-in security and accuracy controls.",
      "Built RAG-powered AI agents on Microsoft Copilot Studio with ServiceNow Knowledge Management, the M365 ecosystem, and MCP servers to accelerate internal support and cross-team automation.",
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
