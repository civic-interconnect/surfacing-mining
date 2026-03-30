// docs/explorer/ui/tabs.js

import { state } from "../state.js";

function getTabButtons() {
  return document.querySelectorAll(".tab[data-tab]");
}

function getPages() {
  return document.querySelectorAll(".page");
}

export function switchTab(tabId) {
  const targetPage = document.getElementById(`page-${tabId}`);
  if (!targetPage) {
    console.warn(`No page found for tab: ${tabId}`);
    return;
  }

  state.activeTab = tabId;

  getTabButtons().forEach((button) => {
    const isActive = button.dataset.tab === tabId;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  getPages().forEach((page) => {
    const isActive = page.id === `page-${tabId}`;
    page.classList.toggle("active", isActive);
  });

  runTabEnterActions(tabId);
}

export function initTabs() {
  getTabButtons().forEach((button) => {
    button.addEventListener("click", () => {
      const tabId = button.dataset.tab;
      switchTab(tabId);
    });
  });

  switchTab(state.activeTab);
}

function runTabEnterActions(tabId) {
  if (tabId === "data" && typeof window.syncEditors === "function") {
    window.syncEditors();
  }

  if (tabId === "compare" && typeof window.renderComparison === "function") {
    window.renderComparison();
  }

  if (tabId === "map" && typeof window.renderMapView === "function") {
    window.renderMapView();
  }

  if (tabId === "evidence" && typeof window.renderEvidenceView === "function") {
    window.renderEvidenceView();
  }

  if (tabId === "projects" && typeof window.renderProjectSummary === "function") {
    window.renderProjectSummary();
  }

  if (tabId === "export" && typeof window.renderExportView === "function") {
    window.renderExportView();
  }
}
