// map/map-helpers.js
//
// Style factories, bounding box utilities, and GeoJSON fetch helpers.

// Base path for project geospatial data, relative to the explorer's serving root.
// If serving from repo root: "/data/projects/"
// If serving from docs/explorer/: "../../data/projects/"
const DATA_BASE_PATH = "../../data/projects/";

// ---------------------------------------------------------------------------
// Layer style definitions
// ---------------------------------------------------------------------------

/** @type {Record<string, L.PathOptions>} */
export const LAYER_STYLES = {
  site: {
    color: "#e05c00",
    weight: 2,
    fillColor: "#e05c00",
    fillOpacity: 0.18,
  },
  watershed: {
    color: "#2563a8",
    weight: 1.5,
    fillColor: "#2563a8",
    fillOpacity: 0.08,
    dashArray: "4 3",
  },
  protected_areas: {
    color: "#1a7a3c",
    weight: 1.5,
    fillColor: "#1a7a3c",
    fillOpacity: 0.10,
    dashArray: "6 3",
  },
  laurentian_divide: {
    color: "#8b5cf6",
    weight: 2.5,
    dashArray: "8 4",
    fillOpacity: 0,
  },
  downstream_path: {
    color: "#0891b2",
    weight: 2,
    dashArray: "4 2",
    fillOpacity: 0,
  },
};

/**
 * Returns Leaflet path options for a named layer type.
 * Falls back to a neutral default if the type is unknown.
 * @param {string} layerType
 * @returns {L.PathOptions}
 */
export function styleForLayer(layerType) {
  return LAYER_STYLES[layerType] ?? {
    color: "#666",
    weight: 1.5,
    fillOpacity: 0.1,
  };
}

// ---------------------------------------------------------------------------
// GeoJSON fetch
// ---------------------------------------------------------------------------

/**
 * Fetch a GeoJSON file for a project layer.
 * Returns parsed GeoJSON or null on failure.
 * @param {string} projectId
 * @param {string} layerName  e.g. "site", "watershed"
 * @returns {Promise<object | null>}
 */
export async function fetchLayerGeoJSON(projectId, layerName) {
  const url = `${DATA_BASE_PATH}${projectId}/geospatial/${layerName}.geojson`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`map-helpers: failed to fetch ${url} (${response.status})`);
      return null;
    }
    return await response.json();
  } catch (err) {
    console.warn(`map-helpers: error fetching ${url}`, err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Bounding box utilities
// ---------------------------------------------------------------------------

/**
 * Compute a Leaflet LatLngBounds from a GeoJSON FeatureCollection.
 * Returns null if no coordinates are found.
 * @param {object} geojson
 * @returns {L.LatLngBounds | null}
 */
export function boundsFromGeoJSON(geojson) {
  if (!geojson?.features?.length) return null;

  const coords = [];
  collectCoords(geojson, coords);

  if (!coords.length) return null;

  const lats = coords.map((c) => c[1]);
  const lngs = coords.map((c) => c[0]);

  return L.latLngBounds(
    [Math.min(...lats), Math.min(...lngs)],
    [Math.max(...lats), Math.max(...lngs)]
  );
}

/**
 * Recursively collect all coordinate pairs from a GeoJSON object.
 * @param {object} node
 * @param {number[][]} out
 */
function collectCoords(node, out) {
  if (!node || typeof node !== "object") return;

  if (Array.isArray(node)) {
    // Coordinate pair: [lng, lat]
    if (node.length >= 2 && typeof node[0] === "number" && typeof node[1] === "number") {
      out.push(node);
      return;
    }
    node.forEach((child) => collectCoords(child, out));
    return;
  }

  if (node.coordinates) {
    collectCoords(node.coordinates, out);
    return;
  }

  if (node.geometry) {
    collectCoords(node.geometry, out);
    return;
  }

  if (node.features) {
    node.features.forEach((f) => collectCoords(f, out));
  }
}

// ---------------------------------------------------------------------------
// Popup content
// ---------------------------------------------------------------------------

/**
 * Build an HTML string for a GeoJSON feature popup.
 * @param {object} feature
 * @returns {string}
 */
export function featurePopupHTML(feature) {
  const p = feature?.properties ?? {};
  const label = p.label ?? p.id ?? "Feature";
  const status = p.status ? `<span class="popup-status">${p.status}</span>` : "";
  const notes = p.notes ? `<p class="popup-notes">${p.notes}</p>` : "";
  const significance = p.significance ? `<p class="popup-significance">${p.significance}</p>` : "";

  return `<div class="map-popup">
    <strong>${label}</strong>${status}
    ${notes}${significance}
  </div>`;
}
