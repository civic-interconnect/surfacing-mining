// docs/explorer/render/render-evidence-claims.js

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

function renderClaimCard(claim) {
  const text = claim.text || claim.statement || "No claim text.";
  const confidence = claim.confidence || "";
  const category = claim.category || "";
  const sourceIds = claim.source_ids ?? [];

  const sourceRefsHtml = sourceIds.length > 0
    ? sourceIds.map((id) => `<code class="source-ref">${id}</code>`).join(" ")
    : "";

  return `
    <div class="claim-card">
      <p class="claim-text">${text}</p>
      <div class="claim-meta">
        ${confidence ? `<span class="claim-confidence">${confidence}</span>` : ""}
        ${category ? `<span class="claim-category muted">${category}</span>` : ""}
        ${sourceRefsHtml ? `<span class="claim-sources muted">Sources: ${sourceRefsHtml}</span>` : ""}
      </div>
    </div>
  `;
}

function renderClaimsPanel(evidence) {
  const claims = evidence?.claims ?? [];

  if (claims.length === 0) {
    return `<p class="empty-state">No claims loaded. Add a <code>claims</code> array to evidence.toml.</p>`;
  }

  return `
    <div class="claims-list">
      <p class="muted">${claims.length} claim${claims.length !== 1 ? "s" : ""}</p>
      ${claims.map(renderClaimCard).join("")}
    </div>
  `;
}

export function renderEvidenceClaims() {
  const project = getSelectedProject();

  if (!project) {
    setPanelContent("evidence-claims-panel", `<p class="empty-state">No project selected.</p>`);
    return;
  }

  const evidence = project.evidence ?? null;

  setPanelContent("evidence-claims-panel", renderClaimsPanel(evidence));
}
