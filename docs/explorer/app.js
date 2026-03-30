// docs/explorer/app.js

import { state } from "./state.js";
import { initTabs, switchTab } from "./ui/tabs.js";
import { loadSampleData } from "./data/sample-data.js";

// View coordinators - each self-registers its window.render* global.
import "./render/projects-view.js";
import "./render/render-comparison-table.js";
import "./render/evidence-view.js";
import "./render/export-view.js";
import "./map/map-view.js";

const primaryProjectSelect = document.getElementById("primary-project-select");
const comparisonProjectSelect = document.getElementById("comparison-project-select");
const compareEnabledCheckbox = document.getElementById("compare-enabled");
const headerStatus = document.getElementById("hdr-status");
const loadExampleButton = document.getElementById("load-example-btn");

function loadDefaults() {
  const data = loadSampleData();

  state.profiles = data.profiles;
  state.projects = data.projects;

  state.profiles = {
    copper_sulfide_hardrock: {
      id: "copper_sulfide_hardrock",
      title: "Copper Sulfide Hardrock Mining",
    },
    helium_gas: {
      id: "helium_gas",
      title: "Helium Gas Extraction",
    },
  };

  state.projects = {
    copper_sulfide_mn: {
      id: "copper_sulfide_mn",
      title: "Copper Sulfide MN",
      profile: "copper_sulfide_hardrock",
    },
    helium_mn: {
      id: "helium_mn",
      title: "Helium Extraction MN",
      profile: "helium_gas",
    },
  };

  const projectIds = Object.keys(state.projects);

  if (!state.selectedProjectId && projectIds.length > 0) {
    state.selectedProjectId = projectIds[0];
  }

  if (!state.comparisonProjectId && projectIds.length > 1) {
    state.comparisonProjectId = projectIds[1];
  }

  populateProjectSelectors();
  renderApp();
}

function populateProjectSelectors() {
  const projectEntries = Object.values(state.projects);

  primaryProjectSelect.innerHTML = "";
  comparisonProjectSelect.innerHTML = "";

  projectEntries.forEach((project) => {
    const primaryOption = document.createElement("option");
    primaryOption.value = project.id;
    primaryOption.textContent = project.title;
    primaryProjectSelect.append(primaryOption);

    const comparisonOption = document.createElement("option");
    comparisonOption.value = project.id;
    comparisonOption.textContent = project.title;
    comparisonProjectSelect.append(comparisonOption);
  });

  primaryProjectSelect.value = state.selectedProjectId ?? "";
  comparisonProjectSelect.value = state.comparisonProjectId ?? "";
  compareEnabledCheckbox.checked = state.compareEnabled;
}

function renderApp() {
  updateHeaderStatus();

  if (typeof window.renderProjectSummary === "function") {
    window.renderProjectSummary();
  }

  if (typeof window.renderComparison === "function") {
    window.renderComparison();
  }

  if (typeof window.renderEvidenceView === "function") {
    window.renderEvidenceView();
  }

  if (typeof window.renderMapView === "function") {
    window.renderMapView();
  }

  if (typeof window.syncEditors === "function") {
    window.syncEditors();
  }
}

function updateHeaderStatus() {
  const selected = state.selectedProjectId
    ? state.projects[state.selectedProjectId]?.title ?? state.selectedProjectId
    : "none";

  const comparison =
    state.compareEnabled && state.comparisonProjectId
      ? state.projects[state.comparisonProjectId]?.title ?? state.comparisonProjectId
      : "off";

  headerStatus.textContent = `primary: ${selected} | compare: ${comparison}`;
}

function onPrimaryProjectChange(event) {
  state.selectedProjectId = event.target.value;
  renderApp();
}

function onComparisonProjectChange(event) {
  state.comparisonProjectId = event.target.value;
  renderApp();
}

function onCompareEnabledChange(event) {
  state.compareEnabled = event.target.checked;
  renderApp();
}

function initProjectSelectors() {
  primaryProjectSelect.addEventListener("change", onPrimaryProjectChange);
  comparisonProjectSelect.addEventListener("change", onComparisonProjectChange);
  compareEnabledCheckbox.addEventListener("change", onCompareEnabledChange);
}

function initLoadExampleButton() {
  loadExampleButton.addEventListener("click", () => {
    loadDefaults();
    switchTab("projects");
  });
}

function initApp() {
  initTabs();
  initProjectSelectors();
  initLoadExampleButton();

  loadDefaults();
  switchTab("projects");
}

initApp();
