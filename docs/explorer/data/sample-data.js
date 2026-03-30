export function loadSampleData() {
  return {
    profiles: {
      copper_sulfide_hardrock: {
        id: "copper_sulfide_hardrock",
        title: "Copper Sulfide Hardrock Mining",
        processing: { stages: ["exploration", "extraction"] },
        map_layers: { required: ["site", "watershed"] },
      },
      helium_gas: {
        id: "helium_gas",
        title: "Helium Gas Extraction",
      },
    },
    projects: {
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
    },
  };
}
