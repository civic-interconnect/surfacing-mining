// docs/explorer/render/render-profile-summary.js

import { state } from "../state.js";

function getSelectedProject() {
  if (!state.selectedProjectId) {
    return null;
  }

  return state.projects[state.selectedProjectId] ?? null;
}

function getSelectedProfile(project) {
  if (!project || !project.profile) {
    return null;
  }

  return state.profiles[project.profile] ?? null;
}

function setPanelContent(panelId, html) {
  const panel = document.getElementById(panelId);
  if (!panel) {
    return;
  }

  panel.innerHTML = html;
}

function renderProfileCard(profile, project) {
  if (!profile) {
    const profileId = project?.profile || "unknown";
    return `<p class="empty-state">Profile <code>${profileId}</code> not loaded.</p>`;
  }

  const description = profile.description?.summary || "No profile summary available.";
  const extractionMethod = profile.extraction_method || "Not specified";
  const amdRisk = profile.amd_risk || "Not specified";
  const primaryWaterRisk = profile.primary_water_risk || "Not specified";
  const postClosureLiability = profile.post_closure_liability || "Not specified";
  const stages = profile.processing?.stages ?? [];
  const requiredLayers = profile.map_layers?.required ?? [];
  const optionalLayers = profile.map_layers?.optional ?? [];
  const timeEmphasis = profile.time_emphasis?.primary ?? [];

  return `
    <dl class="kv-grid">
      <div>
        <dt>Profile id</dt>
        <dd>${profile.id || "Not set"}</dd>
      </div>
      <div>
        <dt>Title</dt>
        <dd>${profile.title || profile.id || "Untitled profile"}</dd>
      </div>
      <div>
        <dt>Extraction method</dt>
        <dd>${extractionMethod}</dd>
      </div>
      <div>
        <dt>AMD risk</dt>
        <dd>${amdRisk}</dd>
      </div>
      <div>
        <dt>Primary water risk</dt>
        <dd>${primaryWaterRisk}</dd>
      </div>
      <div>
        <dt>Post-closure liability</dt>
        <dd>${postClosureLiability}</dd>
      </div>
      <div class="kv-grid-span">
        <dt>Summary</dt>
        <dd>${description}</dd>
      </div>
      <div class="kv-grid-span">
        <dt>Processing stages</dt>
        <dd>${stages.length > 0 ? stages.join(", ") : "None listed"}</dd>
      </div>
      <div class="kv-grid-span">
        <dt>Required map layers</dt>
        <dd>${requiredLayers.length > 0 ? requiredLayers.join(", ") : "None listed"}</dd>
      </div>
      <div class="kv-grid-span">
        <dt>Optional map layers</dt>
        <dd>${optionalLayers.length > 0 ? optionalLayers.join(", ") : "None listed"}</dd>
      </div>
      <div class="kv-grid-span">
        <dt>Time emphasis</dt>
        <dd>${timeEmphasis.length > 0 ? timeEmphasis.join(", ") : "None listed"}</dd>
      </div>
    </dl>
  `;
}

export function renderProfileSummary() {
  const project = getSelectedProject();
  const profile = getSelectedProfile(project);

  if (!project) {
    setPanelContent("profile-summary-panel", `<p class="empty-state">No project selected.</p>`);
    return;
  }

  setPanelContent("profile-summary-panel", renderProfileCard(profile, project));
}
