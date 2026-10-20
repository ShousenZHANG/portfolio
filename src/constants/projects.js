/**
 * Project showcase data — structure only: ids, row direction, tech-brand
 * tags. All copy (title, meta line, description, outcomes, and every node in
 * the diagram) lives in the dictionary, index-aligned with this array.
 * Descriptions use plain text — {highlighted} phrases are wrapped at render.
 *
 * All three are internal enterprise systems with nothing public to capture,
 * so each one is drawn as its real execution path (ProjectDiagram) rather
 * than shown as a screenshot carousel.
 */
import { dict } from "../i18n/index.js";

// Alternating sides give three diagram-led rows an editorial rhythm.
const STRUCTURE = [
  { id: "ticket-agent", desktopReverse: false, tech: ["LangChain", "RAG", "Milvus", "MongoDB", "Prompt Eng."] },
  { id: "nl2sql-agent", desktopReverse: true, tech: ["LangGraph", "NL2SQL", "Milvus", "Elasticsearch", "MySQL"] },
  { id: "bank-platform", desktopReverse: false, tech: ["Java", "Spring Boot", "MyBatis", "Oracle", "Redis", "MinIO", "Docker"] },
];

export const projects = STRUCTURE.map((p, i) => {
  const copy = dict.showcase.projects[i];
  return {
    ...p,
    title: copy.title,
    meta: copy.meta,
    lead: copy.lead,
    diagram: copy.diagram,
    description: copy.description,
    outcomes: copy.outcomes,
  };
});
