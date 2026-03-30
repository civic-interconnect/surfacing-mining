// ui/ownership-panel.js
//
// Renders the ownership and jurisdiction panel.
// Surfaces mineral rights holders, surface ownership, regulatory jurisdictions,
// and treaty/sovereign interests for the selected project.
//
// This data is expected in project.ownership or project.geospatial_layers.ownership.
// If not present, renders a structured empty state explaining what belongs here.

import { state } from "../state.js";

const PANEL_ID = "ownership-panel";

// Ownership layer categories in display order.
const OWNERSHIP_CATEGORIES = [
  { key: "mineral_rights",  label: "Mineral Rights" },
  { key: "surface_rights",  label: "Surface Rights / Land Ownership" },
  { key: "regulatory",      label: "Regulatory Jurisdiction" },
  { key: "treaty",          label: "Treaty / Sovereign Interests" },
  { key: "easements",       label: "Easements and Right-of-Way" },
];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Render the ownership panel for the current project.
 * @param {string} [targetId]  Override panel ID (defaults to PANEL_ID).
 */
export function renderOwnershipPanel(targetId = PANEL_ID) {
  const panel = document.getElementById(targetId);
  if (!panel) return;

  const project = getSelectedProject();

  if (!project) {
    panel.innerHTML = emptyState("No project selected.");
    return;
  }

  const ownershipData = project.ownership ?? null;

  if (!ownershipData) {
    panel.innerHTML = renderNoDataState(project);
    return;
  }

  panel.innerHTML = renderOwnershipContent(ownershipData, project);
}

// ---------------------------------------------------------------------------
// Content renderer
// ---------------------------------------------------------------------------

function renderOwnershipContent(ownership, project) {
  const sections = OWNERSHIP_CATEGORIES.map((cat) => {
    const entries = ownership[cat.key];
    if (!entries?.length) return "";

    const rows = entries.map((entry) => renderOwnershipEntry(entry)).join("");
    return `
      <section class="ownership-section">
        <h4 class="ownership-category-heading">${esc(cat.label)}</h4>
        <div class="ownership-entry-list">${rows}</div>
      </section>`;
  });

  const renderedSections = sections.filter(Boolean).join("");

  const notes = ownership.notes
    ? `<div class="ownership-notes"><p>${esc(ownership.notes)}</p></div>`
    : "";

  const gaps = ownership.gaps
    ? `<div class="evidence-gaps"><h4 class="gaps-heading">Known Gaps</h4><p class="gaps-text">${esc(ownership.gaps)}</p></div>`
    : "";

  return `
    <div class="ownership-panel">
      ${renderedSections || emptyState("Ownership data present but no category entries found.")}
      ${notes}${gaps}
    </div>`;
}

function renderOwnershipEntry(entry) {
  const holder     = entry.holder ?? entry.entity ?? "Unknown";
  const interest   = entry.interest_type ?? entry.type ?? "";
  const area       = entry.area_description ?? entry.parcel ?? "";
  const acreage    = entry.acres != null ? `${entry.acres.toLocaleString()} ac` : "";
  const status     = entry.status ?? "";
  const notes      = entry.notes ?? "";
  const source     = entry.source ?? "";

  return `
    <div class="ownership-entry">
      <div class="ownership-entry-header">
        <span class="ownership-holder">${esc(holder)}</span>
        ${interest ? `<span class="ownership-interest-type">${esc(interest)}</span>` : ""}
        ${acreage  ? `<span class="ownership-acreage">${esc(acreage)}</span>` : ""}
      </div>
      ${area   ? `<div class="ownership-area">${esc(area)}</div>` : ""}
      ${status ? `<div class="ownership-status">${statusBadge(status)}</div>` : ""}
      ${notes  ? `<p class="ownership-entry-notes">${esc(notes)}</p>` : ""}
      ${source ? `<p class="ownership-source">Source: <span class="source-ref">${esc(source)}</span></p>` : ""}
    </div>`;
}

// ---------------------------------------------------------------------------
// No-data state
// ---------------------------------------------------------------------------

function renderNoDataState(project) {
  // Explain what ownership data looks like and how to add it.
  const profileNote = project.profile === "copper_sulfide_hardrock"
    ? "For copper sulfide projects, key ownership dimensions include state mineral leases (DNR), private mineral rights holders, Superior National Forest / USFS surface jurisdiction, and Ojibwe treaty ceded territory interests."
    : project.profile === "helium_gas"
    ? "For helium projects, key dimensions include state industrial mineral leases, private surface rights, DNR land classifications, and treaty interests. Note: helium mineral rights classification under MN statutes is unresolved."
    : "Add ownership data to document mineral rights holders, surface land ownership, regulatory jurisdictions, and treaty interests.";

  return `
    <div class="ownership-no-data">
      <p class="empty-state">No ownership data loaded for <strong>${esc(project.title ?? project.id)}</strong>.</p>
      <p class="empty-state-hint">${profileNote}</p>
      <div class="ownership-scaffold">
        <p class="scaffold-heading">Expected ownership categories:</p>
        <ul class="scaffold-list">
          ${OWNERSHIP_CATEGORIES.map((c) =>
            `<li><code>${esc(c.key)}</code> - ${esc(c.label)}</li>`
          ).join("")}
        </ul>
      </div>
    </div>`;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getSelectedProject() {
  if (!state.selectedProjectId) return null;
  return state.projects?.[state.selectedProjectId] ?? null;
}

function statusBadge(status) {
  if (!status) return "";
  const cls = status === "active"   ? "badge-active"
    : status === "disputed"         ? "badge-high"
    : status === "pending"          ? "badge-draft"
    : status === "expired"          ? "badge-archived"
    : "badge-default";
  return `<span class="badge ${cls}">${esc(status)}</span>`;
}

function emptyState(msg) {
  return `<p class="empty-state">${msg}</p>`;
}

function esc(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
