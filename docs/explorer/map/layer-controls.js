// map/layer-controls.js
//
// Renders the layer visibility toggle panel into #map-layer-controls.
// Keeps UI in sync with project-layers state.

import { LAYER_TYPES, LAYER_LABELS, setLayerVisible, getLayerVisibility, fitToProject } from "./project-layers.js";
import { LAYER_STYLES } from "./map-helpers.js";

const PANEL_ID = "map-layer-controls";

/**
 * Render the layer control panel for a given project.
 * @param {string} projectId
 */
export function renderLayerControls(projectId) {
  const panel = document.getElementById(PANEL_ID);
  if (!panel) return;

  const visibility = getLayerVisibility(projectId);

  panel.innerHTML = "";

  // Section heading
  const heading = document.createElement("p");
  heading.className = "layer-controls-heading";
  heading.textContent = projectId.replace(/_/g, " ");
  panel.appendChild(heading);

  // Layer toggles
  const list = document.createElement("ul");
  list.className = "layer-toggle-list";

  for (const layerType of LAYER_TYPES) {
    const item = document.createElement("li");
    item.className = "layer-toggle-item";

    const label = document.createElement("label");
    label.className = "layer-toggle-label";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = visibility[layerType];
    checkbox.dataset.layerType = layerType;

    checkbox.addEventListener("change", (e) => {
      setLayerVisible(projectId, layerType, e.target.checked);
    });

    const swatch = document.createElement("span");
    swatch.className = "layer-swatch";
    swatch.setAttribute("aria-hidden", "true");
    applySwatchStyle(swatch, layerType);

    const labelText = document.createElement("span");
    labelText.textContent = LAYER_LABELS[layerType] ?? layerType;

    label.appendChild(checkbox);
    label.appendChild(swatch);
    label.appendChild(labelText);
    item.appendChild(label);
    list.appendChild(item);
  }

  panel.appendChild(list);

  // Fit-to-project button
  const fitBtn = document.createElement("button");
  fitBtn.className = "btn btn-sm layer-fit-btn";
  fitBtn.type = "button";
  fitBtn.textContent = "Fit to project";
  fitBtn.addEventListener("click", () => fitToProject(projectId));
  panel.appendChild(fitBtn);
}

/**
 * Apply an inline style swatch color matching the layer's Leaflet style.
 * Line layers get a horizontal line swatch; polygon layers get a filled square.
 * @param {HTMLElement} swatch
 * @param {string} layerType
 */
function applySwatchStyle(swatch, layerType) {
  const style = LAYER_STYLES[layerType] ?? {};
  const color = style.color ?? "#888";
  const isLine = layerType === "laurentian_divide" || layerType === "downstream_path";

  swatch.style.display = "inline-block";
  swatch.style.width = "18px";
  swatch.style.height = isLine ? "3px" : "12px";
  swatch.style.marginRight = "6px";
  swatch.style.verticalAlign = "middle";
  swatch.style.borderRadius = isLine ? "0" : "2px";
  swatch.style.background = isLine ? "none" : color;
  swatch.style.border = isLine ? "none" : `1.5px solid ${color}`;

  if (isLine) {
    swatch.style.borderTop = `2.5px ${style.dashArray ? "dashed" : "solid"} ${color}`;
  }
}
