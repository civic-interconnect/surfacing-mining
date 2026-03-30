// map/legends.js
//
// Renders a Leaflet control legend onto the map.
// Legend summarizes the active layer types and their visual styles.

import { getMap } from "./leaflet-map.js";
import { LAYER_TYPES, LAYER_LABELS } from "./project-layers.js";
import { LAYER_STYLES } from "./map-helpers.js";

let legendControl = null;

/**
 * Add or update the legend on the map.
 * Safe to call multiple times - removes and replaces the existing legend.
 * @param {string[]} [visibleLayers]  Layer types to include. Defaults to all.
 */
export function renderLegend(visibleLayers = LAYER_TYPES) {
  const map = getMap();
  if (!map) return;

  if (legendControl) {
    map.removeControl(legendControl);
    legendControl = null;
  }

  if (!visibleLayers.length) return;

  legendControl = L.control({ position: "bottomright" });

  legendControl.onAdd = () => {
    const div = L.DomUtil.create("div", "map-legend");
    div.innerHTML = buildLegendHTML(visibleLayers);
    L.DomEvent.disableClickPropagation(div);
    return div;
  };

  legendControl.addTo(map);
}

/**
 * Remove the legend from the map.
 */
export function removeLegend() {
  const map = getMap();
  if (!map || !legendControl) return;
  map.removeControl(legendControl);
  legendControl = null;
}

/**
 * Build the inner HTML for the legend.
 * @param {string[]} layerTypes
 * @returns {string}
 */
function buildLegendHTML(layerTypes) {
  const rows = layerTypes.map((layerType) => {
    const style = LAYER_STYLES[layerType] ?? {};
    const label = LAYER_LABELS[layerType] ?? layerType;
    const color = style.color ?? "#888";
    const isLine = layerType === "laurentian_divide" || layerType === "downstream_path";
    const isDashed = !!style.dashArray;

    const swatchStyle = isLine
      ? `display:inline-block;width:22px;height:0;border-top:2.5px ${isDashed ? "dashed" : "solid"} ${color};vertical-align:middle;margin-right:6px;`
      : `display:inline-block;width:14px;height:14px;background:${color};opacity:0.6;border:1.5px solid ${color};border-radius:2px;vertical-align:middle;margin-right:6px;`;

    return `<div class="legend-row">
      <span style="${swatchStyle}" aria-hidden="true"></span>
      <span class="legend-label">${label}</span>
    </div>`;
  });

  return `<div class="legend-title">Layers</div>${rows.join("")}`;
}

/**
 * Update legend to show only the currently visible layers.
 * Call this whenever layer visibility changes.
 * @param {Record<string, boolean>} visibilityMap
 */
export function syncLegendToVisibility(visibilityMap) {
  const visible = LAYER_TYPES.filter((t) => visibilityMap[t]);
  renderLegend(visible);
}
