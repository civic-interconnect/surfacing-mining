// docs/explorer/render/render-evidence-sources.js

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

function renderSourceRow(source) {
  const title = source.title || source.id || "Untitled source";
  const agency = source.agency || "";
  const year = source.year ? `${source.year}` : "";
  const url = source.url || "";
  const notes = source.notes || "";

  const linkHtml = url
    ? `<a class="source-url" href="${url}" target="_blank" rel="noopener">↗ link</a>`
    : "";

  const metaParts = [agency, year].filter(Boolean);

  return `
    <div class="source-row">
      <div class="source-row-header">
        <span class="source-title">${title}</span>
        ${metaParts.length > 0 ? `<span class="muted">${metaParts.join(" · ")}</span>` : ""}
        ${linkHtml}
      </div>
      ${notes ? `<p class="source-notes muted">${notes}</p>` : ""}
    </div>
  `;
}

function renderSourcesPanel(evidence) {
  const sourcesObj = evidence?.sources ?? {};
  const categories = Object.keys(sourcesObj);

  if (categories.length === 0) {
    return `<p class="empty-state">No sources loaded. Add a <code>[sources]</code> block to evidence.toml.</p>`;
  }

  const totalCount = categories.reduce((sum, cat) => sum + (sourcesObj[cat]?.length ?? 0), 0);

  const sectionsHtml = categories.map((category) => {
    const sources = sourcesObj[category] ?? [];
    const label = category.replace(/_/g, " ");

    return `
      <div class="source-section">
        <h4 class="source-category-heading">${label}</h4>
        ${sources.length > 0
          ? sources.map(renderSourceRow).join("")
          : `<p class="muted">No entries in this category.</p>`}
      </div>
    `;
  }).join("");

  return `
    <div class="sources-panel">
      <p class="muted">${totalCount} source${totalCount !== 1 ? "s" : ""} across ${categories.length} categor${categories.length !== 1 ? "ies" : "y"}</p>
      ${sectionsHtml}
    </div>
  `;
}

export function renderEvidenceSources() {
  const project = getSelectedProject();

  if (!project) {
    setPanelContent("evidence-sources-panel", `<p class="empty-state">No project selected.</p>`);
    return;
  }

  const evidence = project.evidence ?? null;

  setPanelContent("evidence-sources-panel", renderSourcesPanel(evidence));
}
