import ELK, {
  ElkNode,
  ElkExtendedEdge,
  LayoutOptions as ELKLayoutOptionsType,
} from "elkjs/lib/elk.bundled.js";
import { DiagramNode, DiagramEdge, NodeDimensions } from "../data/flow-types";
import {
  DEFAULT_NODE_WIDTH as width,
  DEFAULT_NODE_HEIGHT as height,
  nodeDimensionMap,
} from "../data/diagram-constants";

/* Die Kernlogik für die Layout-Berechnung mit elkjs.*/
// Initialisiere ELK-Layoutengine
const elk = new ELK();
export type ElkLayoutOptions = ELKLayoutOptionsType;

// Ermittelt die Größe eines Knotens basierend auf seiner CSS-Klasse
const getNodeDimensions = (className?: string): NodeDimensions => {
  if (!className) return { width, height };
  // Findet den ersten Eintrag in nodeDimensionMap, dessen Schlüssel im className-String enthalten ist.
  const matchedEntry = Object.entries(nodeDimensionMap).find(([key]) =>
    className.includes(key)
  );
  // Wenn ein passender Eintrag gefunden wurde, gib dessen Dimensionen zurück, ansonsten die Standarddimensionen.
  return matchedEntry?.[1] ?? { width, height };
};

// Berechnet das Layout für gegebene Knoten und Kanten unter Verwendung der ELKjs-Bibliothek.
export const getLayoutedElements = async (
  nodesToLayout: DiagramNode[],
  edgesToLayout: DiagramEdge[],
  options: ElkLayoutOptions // Zusätzliche ELK-Layoutoptionen
): Promise<{ nodes: DiagramNode[]; edges: DiagramEdge[] }> => {
  
  // 1. Konvertiert React-Flow-Knoten in ELK-Knotenformat mit Dimensionen
  const elkNodes: ElkNode[] = nodesToLayout.map((flowNode) => {
    const { width, height } = getNodeDimensions(flowNode.className);
    return {
      id: flowNode.id,
      width,
      height,
      labels: [{ text: flowNode.data.label }], // labels können für komplexere Szenarien (z.B. Ports) genutzt werden, hier für das Hauptlabel.
    };
  });
  // 2. Konvertiert React-Flow-Kanten in ELK-Kantenformat
  const elkEdges: ElkExtendedEdge[] = edgesToLayout.map((flowEdge) => ({
    id: flowEdge.id,
    sources: [flowEdge.source],
    targets: [flowEdge.target],
  }));

  // 3. Erstellt den Graphen, der an ELKjs übergeben wird.
  //    Dieser Graph enthält die konvertierten Knoten, Kanten und die Layout-Optionen.
  const graphToLayout: ElkNode = {
    id: "root", // ID für den Wurzelknoten des Graphen
    layoutOptions: options,
    children: elkNodes,
    edges: elkEdges,
  };

  // Try-Catch-Block für asynchrone Layout-Berechnung
  try {
    // Führt die Layout-Berechnung mit ELKjs asynchron durch.
    const layoutedGraph = await elk.layout(graphToLayout);

    //Transformiert die von ELK berechneten Positionen und Größen zurück auf die React Flow Knoten.
    const newNodes = nodesToLayout.map((flowNode) => {
      const elkNode = layoutedGraph.children?.find((n) => n.id === flowNode.id);
      const initialDims = getNodeDimensions(flowNode.className); //Ursprüngliche Abmessungen für Fallback

      // Verwendet die von ELK berechneten Dimensionen oder die initialen Dimensionen, falls ELK keine liefert.
      const finalWidth = elkNode?.width ?? initialDims.width;
      const finalHeight = elkNode?.height ?? initialDims.height;

      return {
        ...flowNode, // Behalte alle ursprünglichen Eigenschaften des React Flow Knotens
        position: {
          x: elkNode?.x ?? 0,
          y: elkNode?.y ?? 0,
        },
        // Aktualisiert die Knotengröße mit den von ELK berechneten Werten
         // Dies stellt sicher, dass React Flow die Knoten mit den von ELK bestimmten Größen rendert.
        style: {
          ...(flowNode.style || {}), // Behalte existierende Styles bei
          width: finalWidth,
          height: finalHeight,
        },
      };
    });
    // Die Kanten bleiben strukturell unverändert, ihre Darstellung passt sich den neuen Knotenpositionen an.
    return { nodes: newNodes, edges: edgesToLayout };

  } catch (e) {
    console.error("ELK Layout Error:", e);
    // Im Fehlerfall die Originalknoten zurückgeben, damit die Anwendung nicht abstürzt
    return {
      nodes: nodesToLayout.map((n) => {
        const dims = getNodeDimensions(n.className);
        return {
          ...n,
          position: n.position, // Behalte die ursprüngliche Position bei
          style: {
            ...(n.style || {}),
            width: dims.width,
            height: dims.height,
          },
        };
      }),
      edges: edgesToLayout,
    };
  }
};
