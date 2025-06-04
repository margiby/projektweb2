import type { DiagramNode, DiagramEdge } from "../data/flow-types";

export const diagramRegistry: Record<
  string,
  { nodes: DiagramNode[]; edges: DiagramEdge[] }
> = {};

export function createSubDiagram(
  id: string,
  nodes: DiagramNode[],
  edges: DiagramEdge[]
): void {
  if (!id || typeof id !== "string") {
    console.error("[createSubDiagram]: Ungültige Diagramm-ID:", id);
    return;
  }

  if (!Array.isArray(nodes) || !Array.isArray(edges)) {
    console.error(
      "[createSubDiagram]: Ungültige Knoten- oder Kantendaten für:",
      id
    );
    return;
  }

  if (diagramRegistry[id]) {
    console.warn(
      `[createSubDiagram]: Subdiagramm "${id}" existiert bereits. Es wird überschrieben.`
    );
  }

  diagramRegistry[id] = { nodes, edges };
  console.info(`[createSubDiagram]: Subdiagramm "${id}" registriert.`);
}
