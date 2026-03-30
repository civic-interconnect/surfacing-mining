// ui/evidence-panel.js
//
// Renders the Evidence tab: Claims, Sources, and Status subtabs.
// Targets: #evidence-claims-panel, #evidence-sources-panel, #evidence-status-panel

import { state } from "../state.js";

const CLAIMS_PANEL_ID  = "evidence-claims-panel";
const SOURCES_PANEL_ID = "evidence-sources-panel";
const STATUS_PANEL_ID  = "evidence-status-panel";

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Render all three evidence subtab panels for the current project.
 */
export function renderEvidencePanels() {
  const project  = getSelectedProject();
  const evidence = project?.evidence ?? null;

  renderClaimsPanel(evidence);
  renderSourcesPanel(evidence);
  renderStatusPanel(evidence, project);
}

// ---------------------------------------------------------------------------
// Claims panel
// ---------------------------------------------------------------------------

function renderClaimsPanel(evidence) {
  const panel = document.getElementById(CLAIMS_PANEL_ID);
  if (!panel) return;

  const claims = evidence?.claims ?? [];

  if (!claims.length) {
    panel.innerHTML = emptyState("No claims loaded. Add claims to evidence.toml to populate this panel.");
    return;
  }

  const rows = claims.map((claim) => {
    const supportingIds = (claim.source_ids ?? []).map((id) =>
      `<code class="source-ref">${esc(id)}</code>`
    ).join(" ");

    return `
      <div class="claim-card">
        <p class="claim-text">${esc(claim.text ?? claim.statement ?? "-")}</p>
        <div class="claim-meta">
          ${claim.confidence ? `<span class="confidence-badge conf-${esc(claim.confidence)}">${esc(claim.confidence)}</span>` : ""}
          ${claim.category   ? `<span class="claim-category">${esc(claim.category)}</span>` : ""}
          ${supportingIds    ? `<span class="claim-sources">Sources: ${supportingIds}</span>` : ""}
        </div>
      </div>`;
  });

  panel.innerHTML = `<div class="claims-list">${rows.join("")}</div>`;
}

// ---------------------------------------------------------------------------
// Sources panel
// ---------------------------------------------------------------------------

function renderSourcesPanel(evidence) {
  const panel = document.getElementById(SOURCES_PANEL_ID);
  if (!panel) return;

  // evidence.toml has sources as an object of arrays (sources.regulatory, sources.water_quality, etc.)
  const sourcesObj = evidence?.sources ?? {};
  const categories = Object.keys(sourcesObj);

  if (!categories.length) {
    panel.innerHTML = emptyState("No sources loaded. Add sources to evidence.toml.");
    return;
  }

  const sections = categories.map((category) => {
    const sources = sourcesObj[category] ?? [];
    const rows = sources.map((src) => renderSourceRow(src)).join("");
    return `
      <section class="source-section">
        <h4 class="source-category-heading">${esc(category.replace(/_/g, " "))}</h4>
        <div class="source-list">${rows}</div>
      </section>`;
  });

  panel.innerHTML = sections.join("");
}

function renderSourceRow(src) {
  const title  = src.title ?? src.id ?? "Untitled source";
  const agency = src.agency ? `<span class="source-agency">${esc(src.agency)}</span>` : "";
  const year   = src.year   ? `<span class="source-year">${esc(src.year)}</span>` : "";
  const link   = src.url
    ? `<a class="source-url" href="${esc(src.url)}" target="_blank" rel="noopener">↗ link</a>`
    : "";
  const notes  = src.notes  ? `<p class="source-notes">${esc(src.notes)}</p>` : "";

  return `
    <div class="source-row">
      <div class="source-row-header">
        <span class="source-title">${esc(title)}</span>
        ${agency}${year}${link}
      </div>
      ${notes}
    </div>`;
}

// ---------------------------------------------------------------------------
// Status panel
// ---------------------------------------------------------------------------

function renderStatusPanel(evidence, project) {
  const panel = document.getElementById(STATUS_PANEL_ID);
  if (!panel) return;

  const gaps    = evidence?.gaps?.notes ?? null;
  const summary = project?.summary ?? {};

  const sourceCount = countSources(evidence?.sources);
  const claimCount  = (evidence?.claims ?? []).length;

  panel.innerHTML = `
    <dl class="summary-dl">
      <dt>Project status</dt>
      <dd>${statusBadge(summary.status)}</dd>

      <dt>Source entries</dt>
      <dd>${sourceCount}</dd>

      <dt>Claim entries</dt>
      <dd>${claimCount}</dd>
    </dl>

    ${gaps ? `
      <div class="evidence-gaps">
        <h4 class="gaps-heading">Known Gaps</h4>
        <p class="gaps-text">${esc(gaps)}</p>
      </div>` : ""}

    ${!evidence ? `<div class="evidence-notice">
      Evidence file not loaded. Add an <code>evidence.toml</code> to the project data directory.
    </div>` : ""}
  `;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getSelectedProject() {
  if (!state.selectedProjectId) return null;
  return state.projects?.[state.selectedProjectId] ?? null;
}

function countSources(sourcesObj) {
  if (!sourcesObj) return 0;
  return Object.values(sourcesObj).reduce((sum, arr) => sum + (arr?.length ?? 0), 0);
}

function statusBadge(status) {
  if (!status) return "-";
  const cls = status === "draft" ? "badge-draft" : status === "active" ? "badge-active" : "badge-default";
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
