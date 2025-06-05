import type { DiagramNode, DiagramEdge } from "../data/flow-types";
import type { ElkLayoutOptions } from "./ElkLayout-utils"; 

export const diagramRegistry: Record<
  string,
  { nodes: DiagramNode[]; 
    edges: DiagramEdge[];
    elkOptions?: ElkLayoutOptions;
   }
> = {};

// Die Kernfunktion zum Erstellen/Hinzufügen eines Diagramms zur Registry
export function createDiagram(
  id: string,
  nodes: DiagramNode[],
  edges: DiagramEdge[],
  elkOptions?: ElkLayoutOptions
): void {
  if (!id || typeof id !== "string") {
    console.error("[createDiagram]: Ungültige Diagramm-ID:", id);
    return;
  }

  if (!Array.isArray(nodes) || !Array.isArray(edges)) {
    console.error(
      "[createDiagram]: Ungültige Knoten- oder Kantendaten für:",
      id
    );
    return;
  }

 // Diese Prüfung ist letzte Sicherheitsinstanz, falls tryRegisterDiagram umgangen wird.
  if (diagramRegistry[id]) {
    console.warn(`[createDiagram]: Interner Aufruf zum Überschreiben von "${id}" abgefangen. Dies sollte normalerweise nicht passieren, wenn tryRegisterDiagram verwendet wird.`);
    return; 
  }

  diagramRegistry[id] = { nodes, edges, elkOptions };
  console.info(`[createDiagram]: Diagramm "${id}" erfolgreich registriert.`);
}


/**
 * Wrapper-Funktion, um ein Diagramm nur zu registrieren, wenn es noch nicht existiert.
 * @param diagramId Die ID des zu registrierenden Diagramms.
 * @param registrationFunction Eine Funktion, die die eigentliche Registrierungslogik (Aufruf von createDiagram oder createTreeDiagram) ausführt.
 */
export function tryRegisterDiagram(diagramId: string, registrationFunction: () => void): void {
  console.log(`VERSUCHE REGISTRIERUNG für: ${diagramId}...`);
  if (!diagramRegistry[diagramId]) {
    registrationFunction(); // Führt die spezifische Erstellungslogik aus
    // Die Erfolgsmeldung kommt jetzt aus createDiagram oder createTreeDiagram
  } else {
    console.log(`SKIPPED: Diagramm "${diagramId}" ist bereits registriert.`);
  }
}
