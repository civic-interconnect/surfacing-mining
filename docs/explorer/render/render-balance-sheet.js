// docs/explorer/render/render-balance-sheet.js
//
// Renders a structural balance sheet for a single project:
// value flows (left) and exposures (right) with weight bars.
// Used within the comparison view and as a standalone project panel.

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

function directionLabel(direction) {
  const labels = {
    outflow_from_region:      "outflow",
    inflow_to_region:         "inflow",
    inflow_variable:          "variable",
    inflow_conditional:       "conditional",
    inflow_national:          "national",
    outflow_counterfactual:   "counterfactual",
  };

  return labels[direction] || direction || "-";
}

function barWidth(weight) {
  const pct = Math.min(Math.max((weight ?? 0) * 100, 0), 100);
  return `${pct.toFixed(0)}%`;
}

function renderFlowItem(flow) {
  const label = flow.label || flow.id || "Unlabeled";
  const weight = flow.weight ?? 0;
  const weightPct = `${(weight * 100).toFixed(0)}%`;
  const direction = directionLabel(flow.direction);
  const localCapture = flow.local_capture_fraction || "-";
  const recipient = flow.recipient || "";

  return `
    <div class="bs-item">
      <div class="bs-item-header">
        <span class="bs-item-label">${label}</span>
        <span class="bs-item-weight">${weightPct}</span>
      </div>
      <div class="bs-bar-wrap">
        <div class="bs-bar bs-bar--value" style="width: ${barWidth(weight)}"></div>
      </div>
      <div class="bs-item-meta">
        <span class="bs-direction">${direction}</span>
        <span class="muted">${localCapture}</span>
      </div>
      ${recipient ? `<div class="bs-item-recipient muted">→ ${recipient}</div>` : ""}
    </div>
  `;
}

function renderExposureItem(exposure) {
  const label = exposure.label || exposure.id || "Unlabeled";
  const weight = exposure.weight ?? 0;
  const weightPct = `${(weight * 100).toFixed(0)}%`;
  const reversibility = exposure.reversibility || "-";
  const timeHorizon = exposure.time_horizon || "";
  const localBearer = exposure.local_bearer || "";

  return `
    <div class="bs-item">
      <div class="bs-item-header">
        <span class="bs-item-label">${label}</span>
        <span class="bs-item-weight">${weightPct}</span>
      </div>
      <div class="bs-bar-wrap">
        <div class="bs-bar bs-bar--exposure" style="width: ${barWidth(weight)}"></div>
      </div>
      <div class="bs-item-meta">
        <span class="bs-reversibility">${reversibility}</span>
        <span class="muted">${timeHorizon}</span>
      </div>
      ${localBearer ? `<div class="bs-item-bearer muted">Bearer: ${localBearer}</div>` : ""}
    </div>
  `;
}

function renderWeightFooter(items) {
  const total = items.reduce((sum, item) => sum + (item.weight ?? 0), 0);
  return `<p class="bs-weight-total muted">Total weight: ${(total * 100).toFixed(0)}%</p>`;
}

/**
 * Build and return the HTML for a single-project balance sheet.
 * Exported for use by render-comparison-table.js.
 * @param {object} project
 * @returns {string}
 */
export function buildBalanceSheetHtml(project) {
  const flows = project.value_flows ?? [];
  const exposures = project.exposures ?? [];

  const flowsHtml = flows.length > 0
    ? flows.map(renderFlowItem).join("") + renderWeightFooter(flows)
    : `<p class="empty-state">No value flows loaded.</p>`;

  const exposuresHtml = exposures.length > 0
    ? exposures.map(renderExposureItem).join("") + renderWeightFooter(exposures)
    : `<p class="empty-state">No exposures loaded.</p>`;

  return `
    <div class="bs-panel">
      <h3 class="bs-project-title">${project.title || project.id || "Untitled"}</h3>
      <div class="bs-columns">
        <div class="bs-col bs-col--value">
          <h4 class="bs-col-heading">Value Flows</h4>
          ${flowsHtml}
        </div>
        <div class="bs-col bs-col--exposure">
          <h4 class="bs-col-heading">Exposures</h4>
          ${exposuresHtml}
        </div>
      </div>
    </div>
  `;
}

export function renderBalanceSheet() {
  const project = getSelectedProject();

  if (!project) {
    setPanelContent("comparison-table-panel", `<p class="empty-state">No project selected.</p>`);
    return;
  }

  setPanelContent("comparison-table-panel", buildBalanceSheetHtml(project));
}
