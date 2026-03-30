// docs/explorer/render/export-view.js
//
// Handles the Export tab: wires button click handlers and registers
// window.renderExportView for tabs.js runTabEnterActions.
//
// Import this file from app.js:
//   import "./render/export-view.js";

import { state } from "../state.js";

// ---------------------------------------------------------------------------
// Export helpers
// ---------------------------------------------------------------------------

function getSelectedProject() {
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

function downloadFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Export functions
// ---------------------------------------------------------------------------

function exportProjectJson() {
  const project = getSelectedProject();

  if (!project) {
    console.warn("export-view: no project selected");
    return;
  }

  const filename = `${project.id}.json`;
  downloadFile(filename, JSON.stringify(project, null, 2), "application/json");
}

function exportComparisonJson() {
  const primary = getSelectedProject();
  const comparison = getComparisonProject();

  if (!primary) {
    console.warn("export-view: no project selected");
    return;
  }

  const payload = {
    primary: primary,
    comparison: comparison ?? null,
    compare_enabled: state.compareEnabled,
    exported_at: new Date().toISOString(),
  };

  const filename = comparison
    ? `comparison-${primary.id}-vs-${comparison.id}.json`
    : `${primary.id}-single.json`;

  downloadFile(filename, JSON.stringify(payload, null, 2), "application/json");
}

function exportMarkdownSummary() {
  const project = getSelectedProject();

  if (!project) {
    console.warn("export-view: no project selected");
    return;
  }

  const location = project.location ?? {};
  const summary = project.summary ?? {};
  const flows = project.value_flows ?? [];
  const exposures = project.exposures ?? [];

  const locationText = [location.anchor_city, location.state, location.country]
    .filter(Boolean)
    .join(", ") || "Not set";

  const flowRows = flows.length > 0
    ? flows.map((f) => `- **${f.label || f.id}** (${Math.round((f.weight ?? 0) * 100)}%) - ${f.direction || "-"}, local capture: ${f.local_capture_fraction || "-"}`).join("\n")
    : "_No value flows loaded._";

  const exposureRows = exposures.length > 0
    ? exposures.map((e) => `- **${e.label || e.id}** (${Math.round((e.weight ?? 0) * 100)}%) - reversibility: ${e.reversibility || "-"}, horizon: ${e.time_horizon || "-"}`).join("\n")
    : "_No exposures loaded._";

  const md = `# ${project.title || project.id}

**Profile:** ${project.profile || "Not set"}
**Location:** ${locationText}
**Status:** ${summary.status || "Not set"}

${summary.notes ? `> ${summary.notes}\n` : ""}
## Value Flows

${flowRows}

## Exposures

${exposureRows}

---
_Exported ${new Date().toISOString()} from Surfacing Mining Explorer._
_Assumptions are explicit and configurable. Results are comparative and assumption-dependent._
`;

  downloadFile(`${project.id}-summary.md`, md, "text/markdown");
}

function exportCitations() {
  const project = getSelectedProject();

  if (!project) {
    console.warn("export-view: no project selected");
    return;
  }

  const evidence = project.evidence ?? null;
  const sourcesObj = evidence?.sources ?? {};
  const categories = Object.keys(sourcesObj);

  if (categories.length === 0) {
    console.warn("export-view: no sources to export");
    return;
  }

  const lines = [`# Citations - ${project.title || project.id}`, ""];

  categories.forEach((category) => {
    const sources = sourcesObj[category] ?? [];
    if (sources.length === 0) return;

    lines.push(`## ${category.replace(/_/g, " ")}`);
    lines.push("");

    sources.forEach((src) => {
      const parts = [
        src.title || src.id,
        src.agency,
        src.year ? `${src.year}` : null,
        src.url ? `<${src.url}>` : null,
      ].filter(Boolean);

      lines.push(`- ${parts.join(". ")}`);
      if (src.notes) {
        lines.push(`  _${src.notes}_`);
      }
    });

    lines.push("");
  });

  lines.push(`---`);
  lines.push(`_Exported ${new Date().toISOString()} from Surfacing Mining Explorer._`);

  downloadFile(`${project.id}-citations.md`, lines.join("\n"), "text/markdown");
}

// ---------------------------------------------------------------------------
// Button wiring
// ---------------------------------------------------------------------------

function initExportButtons() {
  const buttons = {
    "export-project-json-btn":    exportProjectJson,
    "export-comparison-json-btn": exportComparisonJson,
    "export-markdown-btn":        exportMarkdownSummary,
    "export-citations-btn":       exportCitations,
  };

  Object.entries(buttons).forEach(([id, handler]) => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener("click", handler);
    } else {
      console.warn(`export-view: button #${id} not found`);
    }
  });
}

// ---------------------------------------------------------------------------
// Tab entry
// ---------------------------------------------------------------------------

function renderExportView() {
  // Export tab is stateless - nothing to re-render on entry.
  // Buttons are wired once at init and always reflect current state at click time.
}

window.renderExportView = renderExportView;

// Wire buttons once on module load.
initExportButtons();
