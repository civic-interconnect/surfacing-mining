// docs/explorer/render/render-timeline.js
//
// Renders a time-indexed phase view of value flows and exposures.
// Maps time_horizon strings to standard project phases.
// Detects and surfaces temporal asymmetry between bounded value flows
// and long-tail or permanent exposures.

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

const DEFAULT_PHASES = [
  { id: "permitting",   label: "Permitting",           duration: "1–5 yr" },
  { id: "construction", label: "Construction",         duration: "3–5 yr" },
  { id: "operations",   label: "Operations",           duration: "20–30 yr" },
  { id: "closure",      label: "Closure / Reclamation", duration: "5–10 yr" },
  { id: "post_closure", label: "Post-Closure",         duration: "decades–permanent" },
];

const PHASE_KEYWORDS = {
  permitting:   ["permit", "permitting", "application"],
  construction: ["construction", "build", "ramp"],
  operations:   ["operational", "operation", "mine life", "project life"],
  closure:      ["closure", "reclamation", "close"],
  post_closure: ["post-closure", "post closure", "perpetual", "permanent", "generation", "long-term", "tail"],
};

function itemsForPhase(phaseId, items) {
  const keywords = PHASE_KEYWORDS[phaseId] ?? [];

  return items.filter((item) => {
    const horizon = (item.time_horizon ?? "").toLowerCase();

    if (!horizon) {
      return phaseId === "operations";
    }

    return keywords.some((kw) => horizon.includes(kw));
  });
}

function isPostClosure(horizon) {
  if (!horizon) {
    return false;
  }

  const h = horizon.toLowerCase();
  return h.includes("post") || h.includes("permanent") || h.includes("perpetual") || h.includes("generation");
}

function detectAsymmetry(flows, exposures) {
  const postClosureExposures = exposures.filter(
    (e) => isPostClosure(e.time_horizon) || (e.reversibility ?? "").toLowerCase().includes("very low")
  );

  const boundedFlows = flows.filter((f) => !isPostClosure(f.time_horizon));

  if (postClosureExposures.length === 0 || boundedFlows.length === 0) {
    return "";
  }

  const names = postClosureExposures
    .slice(0, 3)
    .map((e) => e.label || e.id)
    .join(", ");

  const tail = postClosureExposures.length > 3 ? ", …" : "";

  return `
    <div class="timeline-asymmetry">
      <p>Temporal asymmetry: ${boundedFlows.length} value flow${boundedFlows.length !== 1 ? "s" : ""} bounded to operational period; ${postClosureExposures.length} exposure${postClosureExposures.length !== 1 ? "s" : ""} extend into post-closure or are potentially permanent (${names}${tail}).</p>
    </div>
  `;
}

function renderPhaseBlock(phase, flows, exposures) {
  const phaseFlows     = itemsForPhase(phase.id, flows);
  const phaseExposures = itemsForPhase(phase.id, exposures);
  const isEmpty = phaseFlows.length === 0 && phaseExposures.length === 0;

  const flowItemsHtml = phaseFlows.map((f) => `
    <div class="timeline-item timeline-item--value">
      <span class="timeline-item-label">${f.label || f.id || "-"}</span>
      ${f.weight != null ? `<span class="muted">${(f.weight * 100).toFixed(0)}%</span>` : ""}
    </div>
  `).join("");

  const exposureItemsHtml = phaseExposures.map((e) => `
    <div class="timeline-item timeline-item--exposure">
      <span class="timeline-item-label">${e.label || e.id || "-"}</span>
      ${e.weight != null ? `<span class="muted">${(e.weight * 100).toFixed(0)}%</span>` : ""}
      ${e.reversibility ? `<span class="muted">${e.reversibility}</span>` : ""}
    </div>
  `).join("");

  return `
    <div class="timeline-phase${isEmpty ? " timeline-phase--empty" : ""}">
      <div class="timeline-phase-header">
        <span class="timeline-phase-label">${phase.label}</span>
        <span class="timeline-phase-duration muted">${phase.duration || ""}</span>
      </div>
      <div class="timeline-phase-body">
        ${phaseFlows.length > 0 ? `
          <div class="timeline-col timeline-col--value">
            <span class="timeline-col-heading muted">Value flows</span>
            ${flowItemsHtml}
          </div>` : ""}
        ${phaseExposures.length > 0 ? `
          <div class="timeline-col timeline-col--exposure">
            <span class="timeline-col-heading muted">Exposures</span>
            ${exposureItemsHtml}
          </div>` : ""}
        ${isEmpty ? `<p class="muted">No flows or exposures mapped to this phase.</p>` : ""}
      </div>
    </div>
  `;
}

function renderTimelinePanel(project) {
  const phases    = project.timeline?.phases ?? DEFAULT_PHASES;
  const flows     = project.value_flows  ?? [];
  const exposures = project.exposures    ?? [];

  const asymmetryHtml = detectAsymmetry(flows, exposures);

  const phasesHtml = phases
    .map((phase) => renderPhaseBlock(phase, flows, exposures))
    .join("");

  return `
    <div class="timeline-panel">
      <h3 class="timeline-project-title">${project.title || project.id || "Untitled"}</h3>
      ${asymmetryHtml}
      <div class="timeline-phases">
        ${phasesHtml}
      </div>
      <p class="muted timeline-disclaimer">Time horizons are structural defaults from the profile. Verify against project-specific data before drawing conclusions.</p>
    </div>
  `;
}

export function renderTimeline() {
  const project = getSelectedProject();

  if (!project) {
    setPanelContent("data-editor-panel", `<p class="empty-state">No project selected.</p>`);
    return;
  }

  setPanelContent("data-editor-panel", renderTimelinePanel(project));
}
