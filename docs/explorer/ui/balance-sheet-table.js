// ui/balance-sheet-table.js
//
// Renders value flows and exposures as a side-by-side "structural balance sheet".
// Used in the Compare tab (#comparison-table-panel) and optionally in Projects tab.
//
// Not a financial balance sheet - a structural transparency tool showing
// who receives value and who bears cost, with configurable weights.

import { state } from "../state.js";

const COMPARISON_PANEL_ID = "comparison-table-panel";

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Render the comparison / balance sheet table.
 * If compare mode is off, renders a single-project view.
 */
export function renderBalanceSheet() {
  const panel = document.getElementById(COMPARISON_PANEL_ID);
  if (!panel) return;

  const primary    = state.projects?.[state.selectedProjectId];
  const comparison = state.compareEnabled && state.comparisonProjectId
    ? state.projects?.[state.comparisonProjectId]
    : null;

  if (!primary) {
    panel.innerHTML = emptyState("No project selected.");
    return;
  }

  if (comparison && comparison.id !== primary.id) {
    panel.innerHTML = renderTwoColumnTable(primary, comparison);
  } else {
    panel.innerHTML = renderSingleTable(primary);
  }
}

// ---------------------------------------------------------------------------
// Single-project layout
// ---------------------------------------------------------------------------

function renderSingleTable(project) {
  return `
    <div class="balance-sheet">
      <h3 class="balance-sheet-title">${esc(project.title ?? project.id)}</h3>
      <div class="balance-sheet-grid">
        <div class="balance-col">
          <h4 class="balance-col-head balance-col-head--value">Value Flows</h4>
          ${renderFlowRows(project.value_flows)}
        </div>
        <div class="balance-col">
          <h4 class="balance-col-head balance-col-head--exposure">Exposures</h4>
          ${renderExposureRows(project.exposures)}
        </div>
      </div>
      ${renderWeightSummary(project)}
    </div>
  `;
}

// ---------------------------------------------------------------------------
// Two-project comparison layout
// ---------------------------------------------------------------------------

function renderTwoColumnTable(primary, comparison) {
  return `
    <div class="balance-sheet balance-sheet--compare">
      <div class="compare-col">
        <h3 class="balance-sheet-title">${esc(primary.title ?? primary.id)}</h3>
        <div class="balance-sheet-grid">
          <div class="balance-col">
            <h4 class="balance-col-head balance-col-head--value">Value Flows</h4>
            ${renderFlowRows(primary.value_flows)}
          </div>
          <div class="balance-col">
            <h4 class="balance-col-head balance-col-head--exposure">Exposures</h4>
            ${renderExposureRows(primary.exposures)}
          </div>
        </div>
        ${renderWeightSummary(primary)}
      </div>

      <div class="compare-divider" aria-hidden="true"></div>

      <div class="compare-col">
        <h3 class="balance-sheet-title">${esc(comparison.title ?? comparison.id)}</h3>
        <div class="balance-sheet-grid">
          <div class="balance-col">
            <h4 class="balance-col-head balance-col-head--value">Value Flows</h4>
            ${renderFlowRows(comparison.value_flows)}
          </div>
          <div class="balance-col">
            <h4 class="balance-col-head balance-col-head--exposure">Exposures</h4>
            ${renderExposureRows(comparison.exposures)}
          </div>
        </div>
        ${renderWeightSummary(comparison)}
      </div>
    </div>
  `;
}

// ---------------------------------------------------------------------------
// Row renderers
// ---------------------------------------------------------------------------

/**
 * Render value flow rows from a project's value_flows array.
 * @param {Array | undefined} flows
 */
function renderFlowRows(flows) {
  if (!flows?.length) {
    return `<p class="empty-state">No value flow data loaded.</p>`;
  }

  const rows = flows.map((flow) => {
    const weight      = flow.weight ?? 0;
    const direction   = flow.direction ?? "";
    const localFrac   = flow.local_capture_fraction ?? "-";
    const dirClass    = directionClass(direction);

    return `
      <div class="balance-row">
        <div class="balance-row-header">
          <span class="balance-row-label">${esc(flow.label ?? flow.id)}</span>
          <span class="balance-row-weight">${formatWeight(weight)}</span>
        </div>
        <div class="balance-row-meta">
          <span class="direction-badge ${dirClass}">${esc(directionLabel(direction))}</span>
          <span class="local-capture" title="Local capture fraction">${esc(localFrac)}</span>
        </div>
        <div class="balance-bar-wrap">
          <div class="balance-bar balance-bar--value" style="width: ${barWidth(weight)}"></div>
        </div>
        ${flow.recipient ? `<div class="balance-row-recipient">→ ${esc(flow.recipient)}</div>` : ""}
      </div>`;
  });

  return rows.join("");
}

/**
 * Render exposure rows from a project's exposures array.
 * @param {Array | undefined} exposures
 */
function renderExposureRows(exposures) {
  if (!exposures?.length) {
    return `<p class="empty-state">No exposure data loaded.</p>`;
  }

  const rows = exposures.map((exposure) => {
    const weight       = exposure.weight ?? 0;
    const reversibility = exposure.reversibility ?? "-";
    const revClass     = reversibilityClass(reversibility);

    return `
      <div class="balance-row">
        <div class="balance-row-header">
          <span class="balance-row-label">${esc(exposure.label ?? exposure.id)}</span>
          <span class="balance-row-weight">${formatWeight(weight)}</span>
        </div>
        <div class="balance-row-meta">
          <span class="reversibility-badge ${revClass}" title="Reversibility">${esc(reversibility)}</span>
          <span class="time-horizon" title="Time horizon">${esc(exposure.time_horizon ?? "-")}</span>
        </div>
        <div class="balance-bar-wrap">
          <div class="balance-bar balance-bar--exposure" style="width: ${barWidth(weight)}"></div>
        </div>
        ${exposure.local_bearer ? `<div class="balance-row-bearer">Bearer: ${esc(exposure.local_bearer)}</div>` : ""}
      </div>`;
  });

  return rows.join("");
}

// ---------------------------------------------------------------------------
// Weight summary footer
// ---------------------------------------------------------------------------

function renderWeightSummary(project) {
  const flowTotal     = sumWeights(project.value_flows);
  const exposureTotal = sumWeights(project.exposures);

  return `
    <div class="weight-summary">
      <span class="weight-summary-item">
        Value flows: <strong>${(flowTotal * 100).toFixed(0)}%</strong>
      </span>
      <span class="weight-summary-sep">|</span>
      <span class="weight-summary-item">
        Exposures: <strong>${(exposureTotal * 100).toFixed(0)}%</strong>
      </span>
    </div>
  `;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sumWeights(items) {
  if (!items?.length) return 0;
  return items.reduce((sum, item) => sum + (item.weight ?? 0), 0);
}

function formatWeight(w) {
  return `${(w * 100).toFixed(0)}%`;
}

function barWidth(w) {
  const pct = Math.min(Math.max(w * 100, 0), 100);
  return `${pct}%`;
}

function directionLabel(direction) {
  const map = {
    outflow_from_region:  "outflow",
    inflow_to_region:     "inflow",
    inflow_variable:      "variable",
    inflow_conditional:   "conditional",
    inflow_national:      "national",
    outflow_counterfactual: "counterfactual",
  };
  return map[direction] ?? direction ?? "-";
}

function directionClass(direction) {
  if (direction?.startsWith("outflow")) return "direction--out";
  if (direction?.startsWith("inflow"))  return "direction--in";
  return "direction--neutral";
}

function reversibilityClass(rev) {
  if (!rev) return "";
  const r = rev.toLowerCase();
  if (r.includes("very low")) return "rev--very-low";
  if (r.includes("low"))      return "rev--low";
  if (r.includes("medium"))   return "rev--medium";
  if (r.includes("high"))     return "rev--high";
  return "";
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
