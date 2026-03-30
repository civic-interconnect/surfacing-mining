// ui/project-selector.js
//
// Manages the primary and comparison project selectors in the header.
// app.js owns state; this module owns the DOM elements and their events.

import { state } from "../state.js";

const PRIMARY_SELECT_ID = "primary-project-select";
const COMPARISON_SELECT_ID = "comparison-project-select";
const COMPARE_CHECKBOX_ID = "compare-enabled";

/**
 * Populate both selectors from state.projects and wire change events.
 * Safe to call multiple times - replaces options and re-wires listeners.
 * @param {Function} onPrimaryChange   Called with the new project id string.
 * @param {Function} onComparisonChange
 * @param {Function} onCompareToggle   Called with boolean.
 */
export function initProjectSelectors(onPrimaryChange, onComparisonChange, onCompareToggle) {
  const primarySelect    = document.getElementById(PRIMARY_SELECT_ID);
  const comparisonSelect = document.getElementById(COMPARISON_SELECT_ID);
  const compareCheckbox  = document.getElementById(COMPARE_CHECKBOX_ID);

  if (!primarySelect || !comparisonSelect || !compareCheckbox) {
    console.warn("project-selector: one or more selector elements not found");
    return;
  }

  // Populate options.
  populateSelect(primarySelect,    state.projects, state.selectedProjectId);
  populateSelect(comparisonSelect, state.projects, state.comparisonProjectId);
  compareCheckbox.checked = state.compareEnabled ?? false;

  // Sync comparison selector visibility.
  syncComparisonSelectorVisibility(comparisonSelect, state.compareEnabled);

  // Wire events (replace by cloning to avoid duplicate listeners).
  const newPrimary    = replaceWithClone(primarySelect);
  const newComparison = replaceWithClone(comparisonSelect);
  const newCheckbox   = replaceWithClone(compareCheckbox);

  newPrimary.addEventListener("change", (e) => {
    state.selectedProjectId = e.target.value;
    onPrimaryChange(e.target.value);
  });

  newComparison.addEventListener("change", (e) => {
    state.comparisonProjectId = e.target.value;
    onComparisonChange(e.target.value);
  });

  newCheckbox.addEventListener("change", (e) => {
    state.compareEnabled = e.target.checked;
    syncComparisonSelectorVisibility(newComparison, e.target.checked);
    onCompareToggle(e.target.checked);
  });
}

/**
 * Re-sync selector values from state without re-wiring events.
 * Call this after state changes that don't originate from the selectors themselves.
 */
export function syncProjectSelectors() {
  const primarySelect    = document.getElementById(PRIMARY_SELECT_ID);
  const comparisonSelect = document.getElementById(COMPARISON_SELECT_ID);
  const compareCheckbox  = document.getElementById(COMPARE_CHECKBOX_ID);

  if (primarySelect)    primarySelect.value    = state.selectedProjectId ?? "";
  if (comparisonSelect) comparisonSelect.value = state.comparisonProjectId ?? "";
  if (compareCheckbox)  compareCheckbox.checked = state.compareEnabled ?? false;

  if (comparisonSelect) {
    syncComparisonSelectorVisibility(comparisonSelect, state.compareEnabled);
  }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Populate a <select> element from state.projects.
 * @param {HTMLSelectElement} selectEl
 * @param {Record<string, {id: string, title: string}>} projects
 * @param {string | null} selectedId
 */
function populateSelect(selectEl, projects, selectedId) {
  selectEl.innerHTML = "";
  const entries = Object.values(projects ?? {});

  if (!entries.length) {
    const opt = document.createElement("option");
    opt.textContent = "No projects loaded";
    opt.disabled = true;
    selectEl.appendChild(opt);
    return;
  }

  entries.forEach((project) => {
    const opt = document.createElement("option");
    opt.value = project.id;
    opt.textContent = project.title ?? project.id;
    selectEl.appendChild(opt);
  });

  if (selectedId) selectEl.value = selectedId;
}

/**
 * Show/hide the comparison selector based on compare-enabled state.
 * @param {HTMLSelectElement} comparisonSelect
 * @param {boolean} enabled
 */
function syncComparisonSelectorVisibility(comparisonSelect, enabled) {
  comparisonSelect.style.display = enabled ? "" : "none";
}

/**
 * Replace a DOM element with a clone of itself (removes all event listeners).
 * Returns the new element.
 * @param {HTMLElement} el
 * @returns {HTMLElement}
 */
function replaceWithClone(el) {
  const clone = el.cloneNode(true);
  el.parentNode.replaceChild(clone, el);
  return clone;
}
