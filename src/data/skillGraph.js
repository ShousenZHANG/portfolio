/**
 * Skill-graph geometry — one graph, shared by both locales. Copy
 * ({ label, used }) and category names live in each locale dictionary under
 * skills.nodes / skills.cats, keyed by the ids below.
 *
 * Pure data with no imports, so test/i18n/skill-graph.test.mjs can load it in
 * Node and prove, for every locale: each node has copy, each edge endpoint
 * exists, and no label collides with another label or node or runs off the
 * viewBox (the outer <svg> clips).
 *
 * Coordinates are viewBox units (100 x 76). r is the node's visual radius.
 * Category colours share one saturation band (C≈0.12-0.14) so the five
 * clusters read as siblings — distinct hues, no shouting.
 */

const PINK = "oklch(0.72 0.14 320)";
const GREEN = "oklch(0.76 0.13 155)";
const BLUE = "oklch(0.74 0.12 240)";

export const SKILL_GRAPH = {
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


export const VIEWBOX = { w: 100, h: 76 };
