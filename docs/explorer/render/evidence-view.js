// docs/explorer/render/evidence-view.js
//
// Coordinator for the Evidence tab.
// Renders all three subtab panels on every state change so any active
// subtab is always current. Registers window.renderEvidenceView for
// tabs.js runTabEnterActions.
//
// Import this file from app.js:
//   import "./render/evidence-view.js";

import { renderEvidenceClaims } from "./render-evidence-claims.js";
import { renderEvidenceSources } from "./render-evidence-sources.js";
import { renderEvidenceStatus } from "./render-evidence-status.js";

function renderEvidenceView() {
  renderEvidenceClaims();
  renderEvidenceSources();
  renderEvidenceStatus();
}

window.renderEvidenceView = renderEvidenceView;
