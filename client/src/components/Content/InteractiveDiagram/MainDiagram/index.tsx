import { createSubDiagram } from "../diagrammHooks/diagramRegistry";
import { initialNodes } from "../data/nodes";
import { initialEdges } from "../data/edges";

export function registerMain(): void {
  // Hauptdiagramm unter dem Schlüssel "root"
  console.log("REGISTERING: Main Diagram (root)...");
  // Überprüfen, ob initialNodes und initialEdges definiert sind
  if (initialNodes && initialEdges) {
    createSubDiagram("root", initialNodes, initialEdges);
  } else {
    console.error("[MainDiagram] initialNodes oder initialEdges sind nicht verfügbar!");
  }
  console.log("REGISTERED: Main Diagram (root).");
}