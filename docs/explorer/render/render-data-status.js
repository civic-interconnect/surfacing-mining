// docs/explorer/render/render-data-status.js

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

function renderDataStatusCard(project, profile) {
  const hasProject = Boolean(project);
  const hasProfile = Boolean(profile);
  const hasLocation = Boolean(project?.location);
  const hasSummary = Boolean(project?.summary);
  const hasValueFlows = Array.isArray(project?.value_flows) && project.value_flows.length > 0;
  const hasExposures = Array.isArray(project?.exposures) && project.exposures.length > 0;
  const hasEvidence = Boolean(project?.evidence);
  const hasGeospatial = Boolean(project?.geospatial_layers);
  const hasOperators = Array.isArray(project?.operators?.examples);
  const hasTimeline = Boolean(project?.timeline);
  const hasOwnership = Boolean(project?.ownership);
  const dirtyCount = Object.keys(state.dirtyFiles ?? {}).length;
  const validationCount = (state.validationMessages ?? []).length;

  const statusRows = [
    ["Project loaded",      hasProject],
    ["Profile loaded",      hasProfile],
    ["Location block",      hasLocation],
    ["Summary block",       hasSummary],
    ["Value flows",         hasValueFlows],
    ["Exposures",           hasExposures],
    ["Evidence",            hasEvidence],
    ["Geospatial layers",   hasGeospatial],
    ["Operators block",     hasOperators],
    ["Timeline",            hasTimeline],
    ["Ownership",           hasOwnership],
  ];

  const metaRows = [
    ["Dirty files",           dirtyCount > 0 ? `${dirtyCount}` : "0"],
    ["Validation messages",   validationCount > 0 ? `${validationCount}` : "0"],
  ];

  const statusHtml = statusRows
    .map(([label, value]) => {
      const displayValue = value ? "Yes" : "No";
      const cls = value ? "" : " class=\"muted\"";
      return `
        <div>
          <dt>${label}</dt>
          <dd${cls}>${displayValue}</dd>
        </div>
      `;
    })
    .join("");

  const metaHtml = metaRows
    .map(([label, value]) => `
      <div>
        <dt>${label}</dt>
        <dd>${value}</dd>
      </div>
    `)
    .join("");

  return `
    <dl class="kv-grid">
      ${statusHtml}
      ${metaHtml}
    </dl>
  `;
}

export function renderDataStatus() {
  const project = getSelectedProject();

  if (!project) {
    setPanelContent("data-status-panel", `<p class="empty-state">No project selected.</p>`);
    return;
  }

  const profile = getSelectedProfile(project);

  setPanelContent("data-status-panel", renderDataStatusCard(project, profile));
}
