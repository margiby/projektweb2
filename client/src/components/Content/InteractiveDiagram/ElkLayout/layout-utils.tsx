import ELK, {
  ElkNode,
  ElkExtendedEdge,
  LayoutOptions as ELKLayoutOptionsType,
} from "elkjs/lib/elk.bundled.js";
import { DiagramNode, DiagramEdge } from "../data/flow-types";

/* Die Kernlogik für die Layout-Berechnung mit elkjs.*/
// Initialisiere ELK-Layoutengine
const elk = new ELK();

export type ElkLayoutOptions = ELKLayoutOptionsType;

// Standardabmessungen für Knoten,
// falls keine spezifische CSS-Klasse oder Dimension gefunden wird.
const DEFAULT_WIDTH = 150;
const DEFAULT_HEIGHT = 50;

// Typdefinition für Knotenabmessungen
type Dimensions = {
  width: number;
  height: number;
};
/** 
  Map zur Zuordnung von CSS-Klassen zu festen Größen:
  * ELK benötigt diese expliziten Abmessungen,
  * um das Layout korrekt berechnen zu können
  */
const nodeDimensionMap: Record<string, Dimensions> = {
  "circle-node": { width: 120, height: 120 },
  "produkte-node": { width: 200, height: 80 },
  "komponenten-node": { width: 470, height: 100 },
  "mix-node": { width: 150, height: 60 },
  "prozessketten-node": { width: 280, height: 70 },
  "versorgungsaufgaben-node": { width: 470, height: 110 },
  "versorgungskonzepte-node": { width: 400, height: 80 },
};

// Ermittelt die Größe eines Knotens basierend auf seiner CSS-Klasse
const getNodeDimensions = (className?: string): Dimensions => {
  if (!className) return { width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT };
  // Findet den ersten Eintrag in nodeDimensionMap, dessen Schlüssel im className-String enthalten ist.
  const matchedEntry = Object.entries(nodeDimensionMap).find(([key]) =>
    className.includes(key)
  );
  // Wenn ein passender Eintrag gefunden wurde, gib dessen Dimensionen zurück, ansonsten die Standarddimensionen.
  return matchedEntry?.[1] ?? { width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT };
};

// Berechnet das Layout für gegebene Knoten und Kanten unter Verwendung der ELKjs-Bibliothek.
export const getLayoutedElements = async (
  nodesToLayout: DiagramNode[],
  edgesToLayout: DiagramEdge[],
  options: ElkLayoutOptions = {} // Zusätzliche ELK-Layoutoptionen
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
    layoutOptions: {
      "elk.algorithm": "mrtree", // Algorithmus für hierarchische Layouts
      "elk.direction": "DOWN", // Hauptflussrichtung des Layouts
      "elk.spacing.nodeNode": "60", // Abstand zwischen Knoten derselben Schicht
      "elk.spacing.edgeNode": "60", // Abstand zwischen Kanten und Knoten
      // Hier könnten weitere globale ELK-Optionen stehen oder durch `options` ergänzt werden.
      ...options,
    },
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
