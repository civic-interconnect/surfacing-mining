// ui/summary-panel.js
//
// Renders the Project Summary and Profile Summary cards on the Projects tab.
// Targets: #project-summary-panel, #profile-summary-panel, #data-status-panel

import { state } from "../state.js";

const PROJECT_SUMMARY_ID  = "project-summary-panel";
const PROFILE_SUMMARY_ID  = "profile-summary-panel";
const DATA_STATUS_ID      = "data-status-panel";

// Data file keys used for completeness checks.
const DATA_FILE_KEYS = ["value_flows", "exposures", "evidence", "geospatial"];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Render all three summary panels for the currently selected project.
 */
export function renderSummaryPanels() {
  const project = getSelectedProject();
  const profile = getSelectedProfile(project);

  renderProjectSummary(project);
  renderProfileSummary(profile, project);
  renderDataStatus(project);
}

// ---------------------------------------------------------------------------
// Project Summary
// ---------------------------------------------------------------------------

function renderProjectSummary(project) {
  const panel = document.getElementById(PROJECT_SUMMARY_ID);
  if (!panel) return;

  if (!project) {
    panel.innerHTML = emptyState("No project selected.");
    return;
  }

  const location = project.location ?? {};
  const summary  = project.summary ?? {};

  panel.innerHTML = `
    <dl class="summary-dl">
      <dt>ID</dt>
      <dd><code>${esc(project.id)}</code></dd>

      <dt>Title</dt>
      <dd>${esc(project.title ?? "-")}</dd>

      <dt>Profile</dt>
      <dd><code>${esc(project.profile ?? "-")}</code></dd>

      <dt>Scope</dt>
      <dd>${esc(project.scope ?? "-")}</dd>

      <dt>Unit of analysis</dt>
      <dd>${esc(project.unit_of_analysis ?? "-")}</dd>

      <dt>Location</dt>
      <dd>${esc(formatLocation(location))}</dd>

      <dt>Status</dt>
      <dd>${statusBadge(summary.status)}</dd>

      ${summary.notes ? `<dt>Notes</dt><dd class="summary-notes">${esc(summary.notes)}</dd>` : ""}
    </dl>
  `;
}

// ---------------------------------------------------------------------------
// Profile Summary
// ---------------------------------------------------------------------------

function renderProfileSummary(profile, project) {
  const panel = document.getElementById(PROFILE_SUMMARY_ID);
  if (!panel) return;

  if (!profile) {
    const msg = project?.profile
      ? `Profile <code>${esc(project.profile)}</code> not loaded.`
      : "No profile associated with this project.";
    panel.innerHTML = emptyState(msg);
    return;
  }

  panel.innerHTML = `
    <dl class="summary-dl">
      <dt>ID</dt>
      <dd><code>${esc(profile.id)}</code></dd>

      <dt>Title</dt>
      <dd>${esc(profile.title ?? "-")}</dd>

      ${profile.description ? `<dt>Description</dt><dd class="summary-notes">${esc(profile.description)}</dd>` : ""}

      ${profile.extraction_method ? `<dt>Extraction method</dt><dd>${esc(profile.extraction_method)}</dd>` : ""}

      ${profile.amd_risk ? `<dt>AMD risk</dt><dd>${riskBadge(profile.amd_risk)}</dd>` : ""}

      ${profile.primary_water_risk ? `<dt>Primary water risk</dt><dd>${esc(profile.primary_water_risk)}</dd>` : ""}

      ${profile.post_closure_liability ? `<dt>Post-closure liability</dt><dd>${esc(profile.post_closure_liability)}</dd>` : ""}
    </dl>
  `;
}

// ---------------------------------------------------------------------------
// Data Completeness
// ---------------------------------------------------------------------------

function renderDataStatus(project) {
  const panel = document.getElementById(DATA_STATUS_ID);
  if (!panel) return;

  if (!project) {
    panel.innerHTML = emptyState("No project selected.");
    return;
  }

  const checks = DATA_FILE_KEYS.map((key) => {
    const hasData = hasProjectData(project, key);
    return `
      <li class="status-item ${hasData ? "status-ok" : "status-missing"}">
        <span class="status-icon" aria-hidden="true">${hasData ? "✓" : "○"}</span>
        <span class="status-label">${esc(key.replace(/_/g, " "))}</span>
      </li>`;
  });

  const total   = DATA_FILE_KEYS.length;
  const present = DATA_FILE_KEYS.filter((k) => hasProjectData(project, k)).length;

  panel.innerHTML = `
    <div class="completeness-summary">
      <span class="completeness-fraction">${present} / ${total}</span>
      <span class="completeness-label">data files present</span>
    </div>
    <ul class="status-list">${checks.join("")}</ul>
  `;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getSelectedProject() {
  if (!state.selectedProjectId) return null;
  return state.projects?.[state.selectedProjectId] ?? null;
}

function getSelectedProfile(project) {
  if (!project?.profile) return null;
  return state.profiles?.[project.profile] ?? null;
}

function hasProjectData(project, key) {
  // Check if the project object carries the data key (loaded into state),
  // or fall back to a loose presence check on common shapes.
  if (!project) return false;
  if (project[key] !== undefined) return true;
  // Geospatial: check for a nested layers object.
  if (key === "geospatial" && project.geospatial_layers) return true;
  return false;
}

function formatLocation(loc) {
  const parts = [loc.anchor_city, loc.region, loc.state, loc.country].filter(Boolean);
  return parts.length ? parts.join(", ") : "-";
}

function statusBadge(status) {
  if (!status) return "-";
  const cls = status === "draft" ? "badge-draft"
    : status === "active"       ? "badge-active"
    : status === "archived"     ? "badge-archived"
    : "badge-default";
  return `<span class="badge ${cls}">${esc(status)}</span>`;
}

function riskBadge(risk) {
  if (!risk) return "-";
  const cls = risk === "high"    ? "badge-high"
    : risk === "medium"          ? "badge-medium"
    : risk === "low"             ? "badge-low"
    : risk === "none"            ? "badge-none"
    : "badge-default";
  return `<span class="badge ${cls}">${esc(risk)}</span>`;
}

function emptyState(msg) {
  return `<p class="empty-state">${msg}</p>`;
}

/** Escape HTML special characters. */
function esc(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
