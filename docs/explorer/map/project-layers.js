// map/project-layers.js
//
// Loads GeoJSON layers for a project and manages their lifecycle on the map.
// Each project can have up to one Leaflet layer group per layer type.
// Layer visibility is toggled without re-fetching.

import { getMap, fitMapBounds, resetMapView } from "./leaflet-map.js";
import { fetchLayerGeoJSON, styleForLayer, boundsFromGeoJSON, featurePopupHTML } from "./map-helpers.js";

// All known layer types, in render order (bottom → top).
export const LAYER_TYPES = [
  "protected_areas",
  "watershed",
  "laurentian_divide",
  "downstream_path",
  "site",
];

// Human-readable labels for layer controls and legends.
export const LAYER_LABELS = {
  protected_areas: "Protected Areas",
  watershed: "Watersheds",
  laurentian_divide: "Laurentian Divide",
  downstream_path: "Downstream Paths",
  site: "Project Site",
};

// ---------------------------------------------------------------------------
// Layer store
// ---------------------------------------------------------------------------
// Structure: { [projectId]: { [layerType]: { group: L.LayerGroup, visible: boolean } } }
const layerStore = {};

/**
 * Ensure a project's entry exists in the store.
 * @param {string} projectId
 */
function ensureProject(projectId) {
  if (!layerStore[projectId]) {
    layerStore[projectId] = {};
  }
}

// ---------------------------------------------------------------------------
// Load layers
// ---------------------------------------------------------------------------

/**
 * Load all layers for a project. Fetches each geojson file and adds layers to
 * the map. Skips layers already loaded. Respects current visibility state.
 * @param {string} projectId
 * @param {Record<string, boolean>} visibilityMap  e.g. { site: true, watershed: true, ... }
 * @returns {Promise<void>}
 */
export async function loadProjectLayers(projectId, visibilityMap) {
  const map = getMap();
  if (!map) return;

  ensureProject(projectId);

  const loadPromises = LAYER_TYPES.map((layerType) =>
    loadSingleLayer(projectId, layerType, visibilityMap[layerType] ?? true)
  );

  await Promise.all(loadPromises);
}

/**
 * Load a single layer for a project. Idempotent — won't re-fetch if already loaded.
 * @param {string} projectId
 * @param {string} layerType
 * @param {boolean} visible
 */
async function loadSingleLayer(projectId, layerType, visible) {
  const map = getMap();
  if (!map) return;

  ensureProject(projectId);

  // Already loaded — just sync visibility.
  if (layerStore[projectId][layerType]) {
    setLayerVisible(projectId, layerType, visible);
    return;
  }

  const geojson = await fetchLayerGeoJSON(projectId, layerType);
  if (!geojson) return;

  const style = styleForLayer(layerType);

  const group = L.geoJSON(geojson, {
    style: () => style,
    pointToLayer: (feature, latlng) =>
      L.circleMarker(latlng, {
        radius: 7,
        ...style,
        fillOpacity: 0.85,
      }),
    onEachFeature: (feature, layer) => {
      layer.bindPopup(featurePopupHTML(feature));
    },
  });

  layerStore[projectId][layerType] = { group, visible };

  if (visible) {
    group.addTo(map);
  }
}

// ---------------------------------------------------------------------------
// Visibility
// ---------------------------------------------------------------------------

/**
 * Show or hide a layer type for a project.
 * @param {string} projectId
 * @param {string} layerType
 * @param {boolean} visible
 */
export function setLayerVisible(projectId, layerType, visible) {
  const map = getMap();
  if (!map) return;

  const entry = layerStore[projectId]?.[layerType];
  if (!entry) return;

  entry.visible = visible;

  if (visible && !map.hasLayer(entry.group)) {
    entry.group.addTo(map);
  } else if (!visible && map.hasLayer(entry.group)) {
    map.removeLayer(entry.group);
  }
}

/**
 * Get the current visibility state for all layers of a project.
 * Returns defaults (true) for layers not yet loaded.
 * @param {string} projectId
 * @returns {Record<string, boolean>}
 */
export function getLayerVisibility(projectId) {
  const result = {};
  for (const layerType of LAYER_TYPES) {
    result[layerType] = layerStore[projectId]?.[layerType]?.visible ?? true;
  }
  return result;
}

// ---------------------------------------------------------------------------
// Remove layers
// ---------------------------------------------------------------------------

/**
 * Remove all layers for a project from the map (but keep them in the store).
 * @param {string} projectId
 */
export function hideProjectLayers(projectId) {
  const map = getMap();
  if (!map || !layerStore[projectId]) return;

  for (const entry of Object.values(layerStore[projectId])) {
    if (map.hasLayer(entry.group)) {
      map.removeLayer(entry.group);
    }
  }
}

/**
 * Remove all layers for a project from the map and clear the store entry.
 * Forces a fresh fetch on next load.
 * @param {string} projectId
 */
export function clearProjectLayers(projectId) {
  hideProjectLayers(projectId);
  delete layerStore[projectId];
}

// ---------------------------------------------------------------------------
// Fit bounds
// ---------------------------------------------------------------------------

/**
 * Fit the map to the combined bounds of all visible layers for a project.
 * @param {string} projectId
 */
export function fitToProject(projectId) {
  const map = getMap();
  if (!map) return;

  const allBounds = [];

  if (layerStore[projectId]) {
    for (const entry of Object.values(layerStore[projectId])) {
      if (entry.visible && map.hasLayer(entry.group)) {
        try {
          const b = entry.group.getBounds();
          if (b.isValid()) allBounds.push(b);
        } catch {
          // empty group — skip
        }
      }
    }
  }

  if (!allBounds.length) {
    // No valid layer bounds yet — reset to NE Minnesota default.
    resetMapView();
    return;
  }

  try {
    const combined = allBounds.reduce((acc, b) => acc.extend(b));
    if (combined.isValid()) {
      fitMapBounds(combined);
    } else {
      resetMapView();
    }
  } catch {
    resetMapView();
  }
}
