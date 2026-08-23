import { dict } from "../i18n/index.js";

// Nav links follow page order (02 Experience → 03 Projects → 04 Skills)
// so the active indicator glides left-to-right as the user scrolls.
// The #anchors are structure (in-page hrefs, identical in every locale);
// only the labels are copy — paired with dict.nav.links by index.
const NAV_ANCHORS = ["#experience", "#projects", "#skills"];
const navLinks = NAV_ANCHORS.map((link, i) => ({
  name: dict.nav.links[i],
  link,
}));

// Every stat quotes a specific CV line verbatim — no round numbers a
// recruiter could arithmetic-check into a lie, and no verb the CV didn't
// use ("published" and "piloted" are not interchangeable):
// - 2 published = "Built and published two Copilot Studio agents" (SSH).
// - 10+ staff = "now used by 10+ staff" (SSH).
// - 5 platforms = ServiceNow, SharePoint, Loop, NetDocs, Intapp (Corrs).
// - 2,100+ tests across five CI gates = Joblit.
// Values + labels live in the dictionary so each locale rewrites the
// labels without touching the numbers' provenance.
const counterItems = dict.counter.items;

// Card copy lives in the dictionary. The " — " title separator and the
// Arabic 4-digit years in the dates are load-bearing — Experience.jsx
// splits role/company on " — " and pulls the rail years with /\d{4}/.
const expCards = dict.experience.cards;

export {
  counterItems,
  expCards,
  navLinks,
};
