// docs/explorer/render/render-comparison-table.js
//
// Renders the Compare tab: side-by-side balance sheets for primary and comparison projects.
// Falls back to a single-project balance sheet when compare mode is off.
// Registers window.renderComparison for app.js.

import { state } from "../state.js";
import { buildBalanceSheetHtml } from "./render-balance-sheet.js";

function setPanelContent(panelId, html) {
  const panel = document.getElementById(panelId);
  if (!panel) {
    return;
  }

  panel.innerHTML = html;
}

function getPrimaryProject() {
  if (!state.selectedProjectId) {
    return null;
  }

  return state.projects[state.selectedProjectId] ?? null;
}

function getComparisonProject() {
  if (!state.compareEnabled || !state.comparisonProjectId) {
    return null;
  }

  return state.projects[state.comparisonProjectId] ?? null;
}

function renderDiffNote(primary, comparison) {
  if (!primary || !comparison) {
    return "";
  }

  const primaryProfile = primary.profile || "-";
  const comparisonProfile = comparison.profile || "-";
  const sameProfile = primaryProfile === comparisonProfile;

  return `
    <div class="compare-diff-note">
      <dl class="kv-grid">
        <div>
          <dt>Primary profile</dt>
          <dd>${primaryProfile}</dd>
        </div>
        <div>
          <dt>Comparison profile</dt>
          <dd>${comparisonProfile}</dd>
        </div>
        <div>
          <dt>Same profile</dt>
          <dd>${sameProfile ? "Yes" : "No - weights and categories may differ"}</dd>
        </div>
        <div>
          <dt>Primary location</dt>
          <dd>${formatLocation(primary.location)}</dd>
        </div>
        <div>
          <dt>Comparison location</dt>
          <dd>${formatLocation(comparison.location)}</dd>
        </div>
      </dl>
    </div>
  `;
}

function formatLocation(location) {
  if (!location) {
    return "Not set";
  }

  return [location.anchor_city, location.state, location.country]
    .filter(Boolean)
    .join(", ") || "Not set";
}

function renderCompareLayout(primary, comparison) {
  return `
    <div class="compare-layout">
      ${renderDiffNote(primary, comparison)}
      <div class="compare-columns">
        <div class="compare-col">
          ${buildBalanceSheetHtml(primary)}
        </div>
        <div class="compare-col">
          ${buildBalanceSheetHtml(comparison)}
        </div>
      </div>
    </div>
  `;
}

export function renderComparisonTable() {
  const primary = getPrimaryProject();

  if (!primary) {
    setPanelContent("comparison-table-panel", `<p class="empty-state">No project selected.</p>`);
    return;
  }

  const comparison = getComparisonProject();

  if (!comparison || comparison.id === primary.id) {
    setPanelContent("comparison-table-panel", buildBalanceSheetHtml(primary));
    return;
  }

  setPanelContent("comparison-table-panel", renderCompareLayout(primary, comparison));
}

window.renderComparison = renderComparisonTable;
