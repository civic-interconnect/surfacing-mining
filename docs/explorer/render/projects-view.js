// docs/explorer/render/projects-view.js
//
// Coordinator for the Projects tab.
// Calls all three Projects-tab renderers in order and registers
// window.renderProjectsView for tabs.js runTabEnterActions.
//
// Import this file from app.js:
//   import "./render/projects-view.js";

import { renderProjectSummary } from "./render-project-summary.js";
import { renderProfileSummary } from "./render-profile-summary.js";
import { renderDataStatus } from "./render-data-status.js";

function renderProjectsView() {
  renderProjectSummary();
  renderProfileSummary();
  renderDataStatus();
}

window.renderProjectsView = renderProjectsView;

// Also expose as renderProjectSummary for the tabs.js hook name.
// tabs.js calls window.renderProjectSummary on projects tab entry.
window.renderProjectSummary = renderProjectsView;
