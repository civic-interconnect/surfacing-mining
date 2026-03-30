// docs/explorer/state.js

export const state = {
  profiles: {},
  projects: {},

  selectedProjectId: null,
  comparisonProjectId: null,
  compareEnabled: false,

  activeTab: "projects",
  activeDataSubtab: "project",
  activeEvidenceSubtab: "claims",
  editorMode: "form",

  dirtyFiles: {},
  validationMessages: [],
};
