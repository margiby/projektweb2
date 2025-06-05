import { tryRegisterDiagram } from "../utils/diagramRegistry";
import { createTreeDiagram } from "../utils/diagramFactory";
import type {
  TreeFactoryNodeConfig,
  TreeFactoryOptions,
} from "../data/flow-types";
import type { ElkLayoutOptions } from "../utils/ElkLayout-utils";

export function registerVSKSubdiagram() {
  const diagramId = "versorgungskonzepte";
  tryRegisterDiagram(diagramId, () => {
    console.log(`AKTION: Registriere VSK Diagram (${diagramId})...`);

    const tech4BiowasteTree: TreeFactoryNodeConfig = {
      id: "tech4biowaste-main",
      data: { label: "TECH4\nBIOWASTE" },
      children: [
        {
          id: "feedstocks",
          data: { label: "Feedstocks" },
          children: [
            { id: "food-waste", data: { label: "Food waste" } },
            {
              id: "garden-park-waste",
              data: { label: "Garden and park waste" },
            },
          ],
        },
        {
          id: "technologies",
          data: { label: "Technologies" },
          children: [
            { id: "pre-processing", data: { label: "Pre-processing" } },
            { id: "conversion", data: { label: "Conversion" } },
            { id: "post-processing", data: { label: "Post-processing" } },
            { id: "pilot-demo", data: { label: "Pilot and demo facilities" } },
          ],
        },
        {
          id: "products",
          data: { label: "Products" },
          children: [
            { id: "chemicals", data: { label: "Chemicals" } },
            { id: "energy-fuels", data: { label: "Energy and fuels" } },
            { id: "food-ingredients", data: { label: "Food ingredients" } },
            { id: "materials", data: { label: "Materials" } },
          ],
        },
      ],
    };

    // Definiere die spezifischen ELK-Optionen
    const vskElkOptions: ElkLayoutOptions = {
      "elk.algorithm": "layered",
      "elk.direction": "RIGHT",
      "org.eclipse.elk.edgeRouting": "ORTHOGONAL", // Wichtig für saubere Kantenführung
      "org.eclipse.elk.layered.spacing.nodeNodeBetweenLayers": "80", // Abstand zwischen den "Ebenen"
      "org.eclipse.elk.spacing.nodeNode": "30", // Abstand zwischen Knoten auf derselben Ebene
      "org.eclipse.elk.layered.considerModelOrder.strategy": "PORTS_EAST_WEST",
      "org.eclipse.elk.portConstraints": "FIXED_SIDE",
    };

    const options: TreeFactoryOptions = {
      nodeIdPrefix: "vsk-tree",
      defaultClassName: "versorgungskonzepte-node",
      elkOptions: vskElkOptions,
    };

    createTreeDiagram(diagramId, tech4BiowasteTree, options);
    // Die Erfolgsmeldung kommt von createTreeDiagram bzw. createDiagram
  });
}
