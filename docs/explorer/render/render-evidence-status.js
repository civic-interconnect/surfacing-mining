// docs/explorer/render/render-evidence-status.js

import { state } from "../state.js";

function getSelectedProject() {
  if (!state.selectedProjectId) {
    return null;
  }

  return state.projects[state.selectedProjectId] ?? null;
}

function setPanelContent(panelId, html) {
  const panel = document.getElementById(panelId);
  if (!panel) {
    return;
  }

  panel.innerHTML = html;
}

function countSources(sourcesObj) {
  if (!sourcesObj) {
    return 0;
  }

  return Object.values(sourcesObj).reduce((sum, arr) => sum + (arr?.length ?? 0), 0);
}

function renderGapsBlock(gaps) {
  const notes = gaps?.notes || "";

  if (!notes) {
    return "";
  }

  return `
    <div class="evidence-gaps">
      <h4 class="gaps-heading">Known Gaps</h4>
      <p class="gaps-text">${notes}</p>
    </div>
  `;
}

function renderEvidenceStatusPanel(project, evidence) {
  const summary = project.summary ?? {};
  const sourceCount = countSources(evidence?.sources);
  const claimCount = (evidence?.claims ?? []).length;
  const hasGaps = Boolean(evidence?.gaps?.notes);
  const gaps = evidence?.gaps ?? null;

  const rows = [
    ["Project status",    summary.status || "Not set"],
    ["Evidence loaded",   evidence ? "Yes" : "No"],
    ["Source entries",    `${sourceCount}`],
    ["Claim entries",     `${claimCount}`],
    ["Gaps documented",   hasGaps ? "Yes" : "No"],
  ];

  const rowsHtml = rows
    .map(([label, value]) => `
      <div>
        <dt>${label}</dt>
        <dd>${value}</dd>
      </div>
    `)
    .join("");

  return `
    <dl class="kv-grid">
      ${rowsHtml}
    </dl>
    ${renderGapsBlock(gaps)}
    ${!evidence ? `
      <div class="evidence-notice">
        <p class="muted">No evidence file loaded for this project. Add an <code>evidence.toml</code> to the project data directory to populate this panel.</p>
      </div>` : ""}
  `;
}

export function renderEvidenceStatus() {
  const project = getSelectedProject();

  if (!project) {
    setPanelContent("evidence-status-panel", `<p class="empty-state">No project selected.</p>`);
    return;
  }

  const evidence = project.evidence ?? null;

  setPanelContent("evidence-status-panel", renderEvidenceStatusPanel(project, evidence));
}
