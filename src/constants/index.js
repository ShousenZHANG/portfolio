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
    title: "Master of Information Technology — UNSW Sydney",
    date: "Sep 2023 – Jun 2025",
    responsibilities: [
      "Graduated with Excellence Honour (WAM 82.4, Distinction), completing the two-year program one term early.",
      "Built strong foundations in software architecture, algorithms, databases, and computer networks.",
      "Explored AI disciplines including machine learning, neural networks, NLP, and large language models (LLMs).",
      "Led the Coding Fest 2025 award-winning project — a scalable Spring Cloud microservices competition platform.",
    ],
  },
  {
    title: "Backend Developer — Shanghai Newtouch Software Co., Ltd.",
    date: "Aug 2022 – Aug 2023",
    responsibilities: [
      "Developed and optimized Java Spring Boot microservices for large-scale banking systems under Agile delivery cycles.",
      "Improved query performance by 40% via Oracle table sharding and SQL optimization for datasets exceeding 10 million rows.",
      "Containerized and automated deployments with Docker Compose and MinIO, reducing release time by over 30%.",
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
