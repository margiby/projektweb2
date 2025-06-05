import { createDiagram, tryRegisterDiagram } from "../utils/diagramRegistry";
import { initialNodes } from "./nodesMain";
import { initialEdges } from "./edgesMain";

export function registerMain(): void {
  // Hauptdiagramm unter dem Schlüssel "root"
  tryRegisterDiagram("root", () => {
    console.log("AKTION: Registriere Main Diagram (root)...");

// Wir rufen keine elKOptions auf, weil es wird schon die Standartwerte benutzen.
    if (initialNodes && initialEdges) {
      createDiagram("root", initialNodes, initialEdges);
      // Die Erfolgsmeldung kommt dann von createDiagram.
    } else {
      console.error("[MainDiagram/index.tsx] initialNodes oder initialEdges sind nicht verfügbar!");
    }
  });
}