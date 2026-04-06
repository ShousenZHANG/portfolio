const navLinks = [
  {
    name: "Projects",
    link: "#projects",
  },
  {
    name: "Experience",
    link: "#experience",
  },
  {
    name: "Skills",
    link: "#skills",
  },
];

const words = [
  { text: "Java", imgPath: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" },
  { text: "React", imgPath: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
  { text: "Spring Boot", imgPath: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg" },
  { text: "Docker", imgPath: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" },
  { text: "Claude", imgPath: "https://cdn.simpleicons.org/anthropic/white" },
  { text: "Java", imgPath: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" },
  { text: "React", imgPath: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
  { text: "Spring Boot", imgPath: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg" },
  { text: "Docker", imgPath: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" },
  { text: "Claude", imgPath: "https://cdn.simpleicons.org/anthropic/white" },
];

const counterItems = [
  { value: 5, suffix: "+", label: "Years in Software Development", accent: "from-sky-400 to-sky-500" },
  { value: 3, suffix: "+", label: "Years of Professional Experience", accent: "from-cyan-400 to-cyan-500" },
  { value: 10, suffix: "+", label: "AI Agent Skills Built & Deployed", accent: "from-emerald-400 to-emerald-500" },
  { value: 50, suffix: "K+", label: "Lines of AI-Powered Code Shipped", accent: "from-indigo-400 to-indigo-500" },
];

const techStackIcons = [
  {
    name: "React Developer",
    modelPath: "/models/react_logo-transformed.glb",
    scale: 1,
    rotation: [0, 0, 0],
  },
  {
    name: "Python Developer",
    modelPath: "/models/python-transformed.glb",
    scale: 0.8,
    rotation: [0, 0, 0],
  },
  {
    name: "Backend Developer",
    modelPath: "/models/node-transformed.glb",
    scale: 5,
    rotation: [0, -Math.PI / 2, 0],
  },
  {
    name: "Interactive Developer",
    modelPath: "/models/three.js-transformed.glb",
    scale: 0.05,
    rotation: [0, 0, 0],
  },
  {
    name: "Project Manager",
    modelPath: "/models/git-svg-transformed.glb",
    scale: 0.05,
    rotation: [0, -Math.PI / 4, 0],
  },
];

const expCards = [
  {
    title: "Junior Integration & Automation Analyst — Corrs Chambers Westgarth",
    date: "Mar 2026 – Present",
    responsibilities: [
      "Developed integration workflows on Boomi to automate cross-system data processing and business operations.",
      "Built a RAG-powered AI agent using ServiceNow Knowledge Management to accelerate internal support.",
      "Engineered task-specific AI agents with structured skills and harness design to improve response accuracy.",
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
  words,
  counterItems,
  expCards,
  techStackIcons,
  navLinks,
};
