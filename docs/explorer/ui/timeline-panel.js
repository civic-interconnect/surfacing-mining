// ui/timeline-panel.js
//
// Renders a time-indexed view of project phases, value flows, and exposures.
// Shows when costs and benefits occur relative to each other -
// a key structural transparency dimension for projects with long post-closure tails.
//
// Data source: project.timeline or synthesized from value_flows/exposures time_horizon fields.

import { state } from "../state.js";

const PANEL_ID = "timeline-panel";

// Standard phase definitions used when project has no explicit timeline.
const DEFAULT_PHASES = [
  { id: "permitting",    label: "Permitting",          duration: "1–5 yr" },
  { id: "construction",  label: "Construction",        duration: "3–5 yr" },
  { id: "operations",    label: "Operations",          duration: "20–30 yr" },
  { id: "closure",       label: "Closure / Reclamation", duration: "5–10 yr" },
  { id: "post_closure",  label: "Post-Closure",        duration: "decades–permanent" },
];

// Which value flow and exposure entries belong in each phase (by time_horizon keyword match).
const PHASE_KEYWORDS = {
  permitting:   ["permit", "permitting", "application"],
  construction: ["construction", "build", "ramp"],
  operations:   ["operational", "operation", "mine life", "project life"],
  closure:      ["closure", "reclamation", "close"],
  post_closure: ["post-closure", "post closure", "perpetual", "permanent", "generation", "long-term", "tail"],
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Render the timeline panel for the current project.
 * @param {string} [targetId]
 */
export function renderTimelinePanel(targetId = PANEL_ID) {
  const panel = document.getElementById(targetId);
  if (!panel) return;

  const project = getSelectedProject();

  if (!project) {
    panel.innerHTML = emptyState("No project selected.");
    return;
  }

  const phases   = project.timeline?.phases ?? DEFAULT_PHASES;
  const flows    = project.value_flows  ?? [];
  const exposures = project.exposures   ?? [];

  panel.innerHTML = renderTimeline(project, phases, flows, exposures);
}

// ---------------------------------------------------------------------------
// Timeline renderer
// ---------------------------------------------------------------------------

function renderTimeline(project, phases, flows, exposures) {
  const phaseBlocks = phases.map((phase) => {
    const phaseFlows     = itemsForPhase(phase.id, flows,     "time_horizon");
    const phaseExposures = itemsForPhase(phase.id, exposures, "time_horizon");
    const hasContent     = phaseFlows.length || phaseExposures.length;

    return `
      <div class="timeline-phase ${hasContent ? "" : "timeline-phase--empty"}">
        <div class="timeline-phase-header">
          <span class="timeline-phase-label">${esc(phase.label)}</span>
          <span class="timeline-phase-duration">${esc(phase.duration ?? "")}</span>
        </div>
        <div class="timeline-phase-body">
          ${phaseFlows.length ? `
            <div class="timeline-col timeline-col--value">
              <span class="timeline-col-heading">Value flows</span>
              ${phaseFlows.map((f) => renderTimelineItem(f, "value")).join("")}
            </div>` : ""}
          ${phaseExposures.length ? `
            <div class="timeline-col timeline-col--exposure">
              <span class="timeline-col-heading">Exposures</span>
              ${phaseExposures.map((e) => renderTimelineItem(e, "exposure")).join("")}
            </div>` : ""}
          ${!hasContent ? `<p class="timeline-phase-empty-hint">No flows or exposures mapped to this phase.</p>` : ""}
        </div>
      </div>`;
  }).join("");

  const asymmetryNote = detectAsymmetry(flows, exposures);

  return `
    <div class="timeline-panel">
      <div class="timeline-header">
        <span class="timeline-project-label">${esc(project.title ?? project.id)}</span>
        ${asymmetryNote ? `<div class="timeline-asymmetry-note">${asymmetryNote}</div>` : ""}
      </div>
      <div class="timeline-phases">
        ${phaseBlocks}
      </div>
      <div class="timeline-footer">
        <p class="timeline-disclaimer">Time horizons are structural defaults from the profile.
        Verify against project-specific data before drawing conclusions.</p>
      </div>
    </div>`;
}

function renderTimelineItem(item, type) {
  const label      = item.label ?? item.id ?? "-";
  const weight     = item.weight != null ? `${(item.weight * 100).toFixed(0)}%` : "";
  const horizon    = item.time_horizon ?? "";
  const reversible = type === "exposure" ? (item.reversibility ?? "") : "";

  return `
    <div class="timeline-item timeline-item--${type}">
      <span class="timeline-item-label">${esc(label)}</span>
      ${weight    ? `<span class="timeline-item-weight">${esc(weight)}</span>` : ""}
      ${horizon   ? `<span class="timeline-item-horizon">${esc(horizon)}</span>` : ""}
      ${reversible ? `<span class="reversibility-badge rev--${reversibilityKey(reversible)}">${esc(reversible)}</span>` : ""}
    </div>`;
}

// ---------------------------------------------------------------------------
// Asymmetry detection
// ---------------------------------------------------------------------------

/**
 * Detect and describe a temporal asymmetry: benefits that are bounded
 * vs. exposures that extend into post-closure or are permanent.
 * @param {Array} flows
 * @param {Array} exposures
 * @returns {string | null}  HTML string or null if no asymmetry detected.
 */
function detectAsymmetry(flows, exposures) {
  const postClosureExposures = exposures.filter((e) =>
    isPostClosure(e.time_horizon) || e.reversibility?.toLowerCase().includes("very low")
  );

  const boundedFlows = flows.filter((f) =>
    !isPostClosure(f.time_horizon)
  );

  if (postClosureExposures.length > 0 && boundedFlows.length > 0) {
    const names = postClosureExposures
      .slice(0, 3)
      .map((e) => esc(e.label ?? e.id))
      .join(", ");

    return `⚠ Temporal asymmetry detected: ${boundedFlows.length} value flow(s) are bounded to the operational period, while ${postClosureExposures.length} exposure(s) extend into post-closure or are potentially permanent (${names}${postClosureExposures.length > 3 ? ", …" : ""}).`;
  }

  return null;
}

function isPostClosure(horizon) {
  if (!horizon) return false;
  const h = horizon.toLowerCase();
  return h.includes("post") || h.includes("permanent") || h.includes("perpetual") || h.includes("generation");
}

// ---------------------------------------------------------------------------
// Phase assignment
// ---------------------------------------------------------------------------

/**
 * Find items whose time_horizon text matches a given phase.
 * Falls back to operations phase for items with no horizon text.
 * @param {string} phaseId
 * @param {Array} items
 * @param {string} horizonKey
 * @returns {Array}
 */
function itemsForPhase(phaseId, items, horizonKey) {
  const keywords = PHASE_KEYWORDS[phaseId] ?? [];

  return items.filter((item) => {
    const horizon = (item[horizonKey] ?? "").toLowerCase();

    if (!horizon) {
      // Items with no horizon assigned to operations by default.
      return phaseId === "operations";
    }

    return keywords.some((kw) => horizon.includes(kw));
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getSelectedProject() {
  if (!state.selectedProjectId) return null;
  return state.projects?.[state.selectedProjectId] ?? null;
}

function reversibilityKey(rev) {
  if (!rev) return "unknown";
  const r = rev.toLowerCase();
  if (r.includes("very low")) return "very-low";
  if (r.includes("low"))      return "low";
  if (r.includes("medium"))   return "medium";
  if (r.includes("high"))     return "high";
  return "unknown";
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
