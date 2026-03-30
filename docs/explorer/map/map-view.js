// map/map-view.js
//
// Top-level coordinator for the map tab.
// Registers window.renderMapView, which app.js calls on every state change.
//
// Import this file from app.js:
//   import "./map/map-view.js";

import { state } from "../state.js";
import { initMap } from "./leaflet-map.js";
import { loadProjectLayers, hideProjectLayers, getLayerVisibility, LAYER_TYPES } from "./project-layers.js";
import { renderLayerControls } from "./layer-controls.js";
import { syncLegendToVisibility, removeLegend } from "./legends.js";

// Track which project is currently displayed to avoid redundant reloads.
let currentProjectId = null;
let currentComparisonId = null;

/**
 * Main entry point. Called by app.js after any state change.
 * Initializes map on first call, then loads/swaps layers as project selection changes.
 */
async function renderMapView() {
  const map = initMap();

  // Leaflet can't measure a hidden container. Invalidate every time the map
  // tab becomes visible so tiles and size are correct.
  if (map) {
    setTimeout(() => map.invalidateSize(), 0);
  }

  const primaryId = state.selectedProjectId;
  const comparisonId = state.compareEnabled ? state.comparisonProjectId : null;

  const primaryChanged = primaryId !== currentProjectId;
  const comparisonChanged = comparisonId !== currentComparisonId;

  // Hide previous layers that are no longer needed.
  if (primaryChanged && currentProjectId) {
    hideProjectLayers(currentProjectId);
  }
  if (comparisonChanged && currentComparisonId) {
    hideProjectLayers(currentComparisonId);
  }

  // Default visibility: all layers on.
  const defaultVisibility = Object.fromEntries(LAYER_TYPES.map((t) => [t, true]));

  // Load primary project layers.
  if (primaryId) {
    await loadProjectLayers(primaryId, defaultVisibility);
    renderLayerControls(primaryId);
  }

  // Load comparison project layers (if compare is enabled and different project).
  if (comparisonId && comparisonId !== primaryId) {
    await loadProjectLayers(comparisonId, defaultVisibility);
  }

  // Sync legend to current primary project visibility.
  if (primaryId) {
    const visibility = getLayerVisibility(primaryId);
    syncLegendToVisibility(visibility);
  } else {
    removeLegend();
  }

  currentProjectId = primaryId;
  currentComparisonId = comparisonId;
}

// Register as global so app.js can call it without a direct import.
window.renderMapView = renderMapView;
