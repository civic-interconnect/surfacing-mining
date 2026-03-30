// docs/explorer/render/render-project-summary.js

import { state } from "../state.js";

function getSelectedProject() {
  if (!state.selectedProjectId) {
    return null;
  }

  return state.projects[state.selectedProjectId] ?? null;
}

function getSelectedProfile(project) {
  if (!project || !project.profile) {
    return null;
  }

  return state.profiles[project.profile] ?? null;
}

function setPanelContent(panelId, html) {
  const panel = document.getElementById(panelId);
  if (!panel) {
    return;
  }

  panel.innerHTML = html;
}

function renderEmptyState() {
  const emptyHtml = `
    <p class="empty-state">No project selected.</p>
  `;

  setPanelContent("project-summary-panel", emptyHtml);
  setPanelContent("profile-summary-panel", emptyHtml);
  setPanelContent("data-status-panel", emptyHtml);
}

function renderProjectCard(project) {
  const location = project.location ?? {};
  const summary = project.summary ?? {};
  const operators = project.operators?.examples ?? [];

  const locationText = [location.state, location.country].filter(Boolean).join(", ");
  const scopeText = project.scope || "Not set";
  const unitText = project.unit_of_analysis || "Not set";
  const statusText = summary.status || "Not set";
  const notesText = summary.notes || "No notes available.";

  const operatorsHtml =
    operators.length > 0
      ? `
        <ul class="kv-list">
          ${operators
            .map((operator) => {
              const parts = [operator.name, operator.parent, operator.country].filter(Boolean);
              return `<li>${parts.join(" | ")}</li>`;
            })
            .join("")}
        </ul>
      `
      : `<p class="muted">No example operators listed.</p>`;

  return `
    <dl class="kv-grid">
      <div>
        <dt>Title</dt>
        <dd>${project.title || project.id || "Untitled project"}</dd>
      </div>
      <div>
        <dt>Profile</dt>
        <dd>${project.profile || "Not set"}</dd>
      </div>
      <div>
        <dt>Scope</dt>
        <dd>${scopeText}</dd>
      </div>
      <div>
        <dt>Unit of analysis</dt>
        <dd>${unitText}</dd>
      </div>
      <div>
        <dt>Location</dt>
        <dd>${locationText || "Not set"}</dd>
      </div>
      <div>
        <dt>Status</dt>
        <dd>${statusText}</dd>
      </div>
      <div class="kv-grid-span">
        <dt>Notes</dt>
        <dd>${notesText}</dd>
      </div>
      <div class="kv-grid-span">
        <dt>Example operators</dt>
        <dd>${operatorsHtml}</dd>
      </div>
    </dl>
  `;
}

function renderProfileCard(profile) {
  if (!profile) {
    return `<p class="empty-state">No profile loaded for the selected project.</p>`;
  }

  const description = profile.description?.summary || "No profile summary available.";
  const stages = profile.processing?.stages ?? [];
  const requiredLayers = profile.map_layers?.required ?? [];
  const optionalLayers = profile.map_layers?.optional ?? [];
  const timeEmphasis = profile.time_emphasis?.primary ?? [];

  return `
    <dl class="kv-grid">
      <div>
        <dt>Title</dt>
        <dd>${profile.title || profile.id || "Untitled profile"}</dd>
      </div>
      <div>
        <dt>Profile id</dt>
        <dd>${profile.id || "Not set"}</dd>
      </div>
      <div class="kv-grid-span">
        <dt>Summary</dt>
        <dd>${description}</dd>
      </div>
      <div class="kv-grid-span">
        <dt>Processing stages</dt>
        <dd>${stages.length > 0 ? stages.join(", ") : "None listed"}</dd>
      </div>
      <div class="kv-grid-span">
        <dt>Required map layers</dt>
        <dd>${requiredLayers.length > 0 ? requiredLayers.join(", ") : "None listed"}</dd>
      </div>
      <div class="kv-grid-span">
        <dt>Optional map layers</dt>
        <dd>${optionalLayers.length > 0 ? optionalLayers.join(", ") : "None listed"}</dd>
      </div>
      <div class="kv-grid-span">
        <dt>Time emphasis</dt>
        <dd>${timeEmphasis.length > 0 ? timeEmphasis.join(", ") : "None listed"}</dd>
      </div>
    </dl>
  `;
}

function renderDataStatusCard(project, profile) {
  const hasProject = Boolean(project);
  const hasProfile = Boolean(profile);
  const hasLocation = Boolean(project?.location);
  const hasSummary = Boolean(project?.summary);
  const hasOperators = Array.isArray(project?.operators?.examples);
  const dirtyCount = Object.keys(state.dirtyFiles).length;
  const validationCount = state.validationMessages.length;

  const rows = [
    ["Project loaded", hasProject],
    ["Profile loaded", hasProfile],
    ["Location block", hasLocation],
    ["Summary block", hasSummary],
    ["Operators block", hasOperators],
    ["Dirty files", dirtyCount > 0 ? `${dirtyCount}` : "0"],
    ["Validation messages", validationCount > 0 ? `${validationCount}` : "0"],
  ];

  const itemsHtml = rows
    .map(([label, value]) => {
      const displayValue = typeof value === "boolean" ? (value ? "Yes" : "No") : value;
      return `
        <div>
          <dt>${label}</dt>
          <dd>${displayValue}</dd>
        </div>
      `;
    })
    .join("");

  return `<dl class="kv-grid">${itemsHtml}</dl>`;
}

export function renderProjectSummary() {
  const project = getSelectedProject();

  if (!project) {
    renderEmptyState();
    return;
  }

  const profile = getSelectedProfile(project);

  setPanelContent("project-summary-panel", renderProjectCard(project));
  setPanelContent("profile-summary-panel", renderProfileCard(profile));
  setPanelContent("data-status-panel", renderDataStatusCard(project, profile));
}
