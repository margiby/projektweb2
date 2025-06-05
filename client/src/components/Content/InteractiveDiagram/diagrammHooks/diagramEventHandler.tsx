import { MouseEvent } from "react";
import type { Node } from "@xyflow/react";
import type { DiagramNode } from "../data/flow-types";
import { useDiagramStore } from "./useDiagramStore";
import { diagramRegistry } from "../utils/diagramRegistry";

/**
 * Handler-Funktion für Node-Klicks im Diagramm
 * Wird von ReactFlow übergeben → z.B. onNodeClick={handleNodeClick}
 */
export function handleNodeClick(
  event: MouseEvent,
  node: Node<DiagramNode["data"]>
): void {
  event.preventDefault();

const diagramId = node.id;

  // Wenn ein Subdiagramm existiert → wechsel zu diesem
  if (diagramRegistry[diagramId]) {
    useDiagramStore.getState().setDiagramId(diagramId);
  } else {
    console.log("Kein Diagramm für:", diagramId);
  }
}