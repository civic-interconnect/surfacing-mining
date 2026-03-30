// docs/explorer/render/render-flows.js
//
// Renders value flows and exposures into the data editor panel
// when the "Value Flows" or "Exposures" subtab is active.
// Called by the data editor subtab switcher.

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

function renderFlowRow(flow) {
  const label = flow.label || flow.id || "Unlabeled flow";
  const direction = flow.direction || "Not set";
  const weight = flow.weight != null ? `${(flow.weight * 100).toFixed(0)}%` : "Not set";
  const recipient = flow.recipient || "Not set";
  const localCapture = flow.local_capture_fraction || "Not set";
  const timeHorizon = flow.time_horizon || "Not set";
  const description = flow.description?.trim() || "No description.";
  const notes = flow.notes || "";

  return `
    <div class="flow-row">
      <dl class="kv-grid">
        <div>
          <dt>Label</dt>
          <dd>${label}</dd>
        </div>
        <div>
          <dt>Direction</dt>
          <dd>${direction}</dd>
        </div>
        <div>
          <dt>Weight</dt>
          <dd>${weight}</dd>
        </div>
        <div>
          <dt>Recipient</dt>
          <dd>${recipient}</dd>
        </div>
        <div>
          <dt>Local capture</dt>
          <dd>${localCapture}</dd>
        </div>
        <div>
          <dt>Time horizon</dt>
          <dd>${timeHorizon}</dd>
        </div>
        <div class="kv-grid-span">
          <dt>Description</dt>
          <dd>${description}</dd>
        </div>
        ${notes ? `
        <div class="kv-grid-span">
          <dt>Notes</dt>
          <dd>${notes}</dd>
        </div>` : ""}
      </dl>
    </div>
  `;
}

function renderExposureRow(exposure) {
  const label = exposure.label || exposure.id || "Unlabeled exposure";
  const category = exposure.category || "Not set";
  const weight = exposure.weight != null ? `${(exposure.weight * 100).toFixed(0)}%` : "Not set";
  const localBearer = exposure.local_bearer || "Not set";
  const timeHorizon = exposure.time_horizon || "Not set";
  const reversibility = exposure.reversibility || "Not set";
  const description = exposure.description?.trim() || "No description.";

  return `
    <div class="flow-row">
      <dl class="kv-grid">
        <div>
          <dt>Label</dt>
          <dd>${label}</dd>
        </div>
        <div>
          <dt>Category</dt>
          <dd>${category}</dd>
        </div>
        <div>
          <dt>Weight</dt>
          <dd>${weight}</dd>
        </div>
        <div>
          <dt>Local bearer</dt>
          <dd>${localBearer}</dd>
        </div>
        <div>
          <dt>Time horizon</dt>
          <dd>${timeHorizon}</dd>
        </div>
        <div>
          <dt>Reversibility</dt>
          <dd>${reversibility}</dd>
        </div>
        <div class="kv-grid-span">
          <dt>Description</dt>
          <dd>${description}</dd>
        </div>
      </dl>
    </div>
  `;
}

function renderValueFlowsPanel(project) {
  const flows = project.value_flows ?? [];

  if (flows.length === 0) {
    return `<p class="empty-state">No value flows loaded for this project.</p>`;
  }

  const totalWeight = flows.reduce((sum, f) => sum + (f.weight ?? 0), 0);
  const weightDisplay = (totalWeight * 100).toFixed(0);

  return `
    <div class="flows-panel">
      <p class="flows-meta muted">${flows.length} flow${flows.length !== 1 ? "s" : ""} - total weight: ${weightDisplay}%</p>
      ${flows.map(renderFlowRow).join("")}
    </div>
  `;
}

function renderExposuresPanel(project) {
  const exposures = project.exposures ?? [];

  if (exposures.length === 0) {
    return `<p class="empty-state">No exposures loaded for this project.</p>`;
  }

  const totalWeight = exposures.reduce((sum, e) => sum + (e.weight ?? 0), 0);
  const weightDisplay = (totalWeight * 100).toFixed(0);

  return `
    <div class="flows-panel">
      <p class="flows-meta muted">${exposures.length} exposure${exposures.length !== 1 ? "s" : ""} - total weight: ${weightDisplay}%</p>
      ${exposures.map(renderExposureRow).join("")}
    </div>
  `;
}

export function renderFlows(mode = "value-flows") {
  const project = getSelectedProject();

  if (!project) {
    setPanelContent("data-editor-panel", `<p class="empty-state">No project selected.</p>`);
    return;
  }

  const html = mode === "exposures"
    ? renderExposuresPanel(project)
    : renderValueFlowsPanel(project);

  setPanelContent("data-editor-panel", html);
}
