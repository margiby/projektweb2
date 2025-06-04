import type { ElkLayoutOptions } from "../ElkLayout/layout-utils";

/**
 * Basiskonfiguration für den ELK-Layout-Algorithmus.
 * Diese Optionen definieren das grundlegende Aussehen und die Anordnung des Diagramms.
 */

export const BASE_ELK_OPTIONS: ElkLayoutOptions = {
  "elk.algorithm": "mrtree", 
  "elk.direction": "DOWN",
  "elk.spacing.nodeNode": "60",
  "elk.spacing.edgeNode": "60",
};