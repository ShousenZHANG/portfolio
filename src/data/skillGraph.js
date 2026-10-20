/**
 * Skill-graph geometry, one graph per locale.
 *
 * The two CVs describe different stacks — the English one leads with the
 * Microsoft 365 agent platform, the Chinese one with LangChain / LangGraph
 * retrieval agents on a Java backend — so /zh is a different graph, not a
 * relabelled one. Copy ({ label, used }) and category names live in the locale
 * dictionary under skills.nodes / skills.cats, keyed by the ids below.
 *
 * Pure data with no imports, so test/i18n/skill-graph.test.mjs can load it in
 * Node and prove, per locale: every node has copy, every edge endpoint exists,
 * and no label collides with another label or node.
 *
 * Coordinates are viewBox units (100 x 76). r is the node's visual radius.
 * Category colours share one saturation band (C≈0.12-0.14) so the five
 * clusters read as siblings — distinct hues, no shouting.
 */

const PINK = "oklch(0.72 0.14 320)";
const GREEN = "oklch(0.76 0.13 155)";
const BLUE = "oklch(0.74 0.12 240)";

const en = {
    // Foregrounds the Microsoft 365 agent stack (Copilot Studio / Power
    // Platform), with AI, integration, engineering, and cloud as support.
    cats: {
        ms: "var(--sig)",
        ai: PINK,
        data: "var(--sig-2)",
        eng: GREEN,
        cloud: BLUE,
    },
    nodes: [
        // Microsoft & Power Platform (top center — the signature cluster)
        { id: "copilot", cat: "ms", x: 47, y: 10, r: 7.5 },
        { id: "pautomate", cat: "ms", x: 32, y: 20, r: 6 },
        { id: "dataverse", cat: "ms", x: 55, y: 24, r: 6.5 },
        { id: "powerapps", cat: "ms", x: 41, y: 33, r: 5 },

        // AI & Agents (left)
        { id: "agents", cat: "ai", x: 19, y: 30, r: 6.5 },
        { id: "rag", cat: "ai", x: 9, y: 43, r: 5.5 },
        { id: "mcp", cat: "ai", x: 23, y: 46, r: 5.5 },
        { id: "llmorch", cat: "ai", x: 11, y: 56, r: 5.5 },
        { id: "prompt", cat: "ai", x: 27, y: 59, r: 5.5 },

        // Integration & Data (lower center-left). playwright and sql sat at
        // y 71 / 70, which put their label baselines on or past the viewBox
        // floor — the outer <svg> clips, so "Playwright" lost its descenders.
        { id: "boomi", cat: "data", x: 41, y: 52, r: 6 },
        { id: "servicenow", cat: "data", x: 45, y: 65, r: 5.5 },
        { id: "playwright", cat: "data", x: 57, y: 68.5, r: 5 },
        { id: "sql", cat: "data", x: 30, y: 69.2, r: 5 },

        // Software Engineering (right)
        { id: "java", cat: "eng", x: 74, y: 13, r: 6.5 },
        { id: "python", cat: "eng", x: 88, y: 23, r: 5.5 },
        { id: "ts", cat: "eng", x: 67, y: 29, r: 5.5 },
        { id: "react", cat: "eng", x: 84, y: 37, r: 6 },

        // Cloud & DevOps (lower right)
        { id: "azure", cat: "cloud", x: 65, y: 49, r: 6 },
        { id: "aws", cat: "cloud", x: 80, y: 51, r: 5 },
        { id: "docker", cat: "cloud", x: 73, y: 63, r: 5.5 },
        { id: "cicd", cat: "cloud", x: 88, y: 61, r: 5.5 },
    ],
    edges: [
        // Microsoft cluster
        ["copilot", "pautomate"], ["copilot", "dataverse"], ["pautomate", "dataverse"],
        ["copilot", "powerapps"], ["dataverse", "powerapps"],
        // the agent story — Copilot Studio wired to AI + integration + cloud
        ["copilot", "agents"], ["copilot", "mcp"], ["copilot", "llmorch"],
        ["dataverse", "rag"], ["pautomate", "boomi"], ["azure", "copilot"],
        // AI cluster
        ["agents", "rag"], ["agents", "mcp"], ["agents", "prompt"], ["rag", "mcp"], ["llmorch", "prompt"],
        // Integration & data
        ["boomi", "servicenow"], ["servicenow", "sql"], ["servicenow", "mcp"], ["sql", "java"],
        ["playwright", "python"], ["playwright", "copilot"],
        // Engineering
        ["java", "ts"], ["ts", "react"], ["python", "java"], ["python", "agents"],
        // Cloud
        ["azure", "aws"], ["azure", "docker"], ["docker", "cicd"], ["aws", "docker"], ["docker", "java"], ["cicd", "react"],
    ],
};

const zh = {
    // Agents and retrieval on the left (the signature cluster leads, top-left,
    // where a left-to-right reader lands first); the Java backend that the
    // second half of the CV is about fills the right.
    cats: {
        agent: "var(--sig)",
        retrieval: "var(--sig-2)",
        java: GREEN,
        mw: BLUE,
        ops: PINK,
    },
    nodes: [
        // Agent & LLM (top-left — the signature cluster)
        { id: "langchain", cat: "agent", x: 37, y: 9, r: 7.5 },
        { id: "langgraph", cat: "agent", x: 17, y: 16, r: 6.5 },
        { id: "rag", cat: "agent", x: 53, y: 20, r: 6 },
        { id: "tools", cat: "agent", x: 37, y: 27, r: 5.5 },
        { id: "prompt", cat: "agent", x: 9, y: 32, r: 5.5 },
        { id: "nl2sql", cat: "agent", x: 23, y: 38, r: 6 },

        // Retrieval & data (lower-left)
        { id: "embedding", cat: "retrieval", x: 46, y: 41, r: 5.5 },
        { id: "milvus", cat: "retrieval", x: 34, y: 52, r: 6 },
        { id: "es", cat: "retrieval", x: 13, y: 53, r: 5.5 },
        { id: "mysql", cat: "retrieval", x: 23, y: 66, r: 5.5 },
        { id: "mongodb", cat: "retrieval", x: 47, y: 65, r: 5.5 },

        // Java & microservices (top-right)
        { id: "java", cat: "java", x: 72, y: 9, r: 6.5 },
        { id: "springboot", cat: "java", x: 87, y: 19, r: 6 },
        { id: "springcloud", cat: "java", x: 68, y: 27, r: 6 },
        { id: "mybatis", cat: "java", x: 89, y: 34, r: 5 },
        { id: "oracle", cat: "java", x: 76, y: 43, r: 5 },

        // Middleware (lower-centre-right)
        { id: "redis", cat: "mw", x: 61, y: 52, r: 6 },
        { id: "rabbitmq", cat: "mw", x: 62, y: 67, r: 5.5 },
        { id: "minio", cat: "mw", x: 77, y: 60, r: 5 },

        // Deployment (bottom-right)
        { id: "docker", cat: "ops", x: 90, y: 52, r: 5.5 },
        { id: "linux", cat: "ops", x: 89, y: 68, r: 5 },
    ],
    edges: [
        // Agent cluster — LangChain is the hub of the ticket assistant,
        // LangGraph of the NL2SQL workflow
        ["langchain", "langgraph"], ["langchain", "rag"], ["langchain", "tools"], ["langchain", "prompt"],
        ["langgraph", "nl2sql"], ["langgraph", "tools"], ["nl2sql", "prompt"], ["rag", "tools"],
        // Retrieval — the three-way hybrid recall, plus memory
        ["rag", "embedding"], ["embedding", "milvus"], ["rag", "milvus"],
        ["nl2sql", "milvus"], ["nl2sql", "es"], ["nl2sql", "mysql"], ["milvus", "es"],
        ["langchain", "mongodb"], ["mongodb", "milvus"],
        // Java backend
        ["java", "springboot"], ["springboot", "springcloud"], ["java", "springcloud"],
        ["springboot", "mybatis"], ["mybatis", "oracle"], ["mybatis", "mysql"],
        // Middleware and deployment
        ["springboot", "redis"], ["springcloud", "rabbitmq"], ["redis", "oracle"], ["springboot", "minio"],
        ["docker", "linux"], ["docker", "springcloud"], ["minio", "docker"],
        // Where the two halves meet: agent tools call the backend's interfaces
        ["tools", "springcloud"],
    ],
};

export const SKILL_GRAPHS = { en, zh };

export const VIEWBOX = { w: 100, h: 76 };
