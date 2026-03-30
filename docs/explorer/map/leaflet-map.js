// map/leaflet-map.js
//
// Initializes the Leaflet map instance and exposes it for use by other map modules.
//
// DEPENDENCY: Leaflet must be loaded before this module is used.
// Add to index.html <head>:
//   <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
//   <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

const MAP_DIV_ID = "map";

// Default center: northeast Minnesota (midpoint between Babbitt and Ely)
const DEFAULT_CENTER = [47.75, -91.95];
const DEFAULT_ZOOM = 9;

let mapInstance = null;

/**
 * Initialize the Leaflet map. Idempotent - safe to call multiple times.
 * @returns {L.Map}
 */
export function initMap() {
  if (mapInstance) return mapInstance;

  const container = document.getElementById(MAP_DIV_ID);
  if (!container) {
    console.warn("leaflet-map: #map container not found");
    return null;
  }

  mapInstance = L.map(MAP_DIV_ID, {
    center: DEFAULT_CENTER,
    zoom: DEFAULT_ZOOM,
    zoomControl: true,
    attributionControl: true,
  });

  // Base layer: OpenStreetMap
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18,
  }).addTo(mapInstance);

  return mapInstance;
}

/**
 * Returns the current map instance, or null if not yet initialized.
 * @returns {L.Map | null}
 */
export function getMap() {
  return mapInstance;
}

/**
 * Fit the map to a given bounds array [[south, west], [north, east]].
 * @param {L.LatLngBoundsExpression} bounds
 * @param {object} [options]
 */
export function fitMapBounds(bounds, options = { padding: [32, 32] }) {
  if (!mapInstance) return;
  mapInstance.fitBounds(bounds, options);
}

/**
 * Reset map view to default center and zoom.
 */
export function resetMapView() {
  if (!mapInstance) return;
  mapInstance.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
}
