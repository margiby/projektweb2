import { tryRegisterDiagram, createDiagram } from "../utils/diagramRegistry";

export function registerKomponentenSubdiagram() {
  const diagramId = "komponenten";
  tryRegisterDiagram(diagramId, () => {
    console.log(`AKTION: Registriere Komponenten Diagram (${diagramId})...`);
    createDiagram(diagramId, [
      { id: "k-hws", data: { label: "Heißwasserspeicher" }, position: { x: 0, y: 0 }, type: "default", className: "komponenten-node" },
      { id: "k-biomassekessel", data: { label: "Biomassekessel" }, position: { x: 0, y: 0 }, type: "default", className: "komponenten-node" },
      { id: "k-bhkw", data: { label: "Gas-BHKW" }, position: { x: 0, y: 0 }, type: "default", className: "komponenten-node" },
      { id: "k-waermetauscher", data: { label: "Wärmetauscher" }, position: { x: 0, y: 0 }, type: "default", className: "komponenten-node" },
    ], [
      { id: "k-e1", source: "k-biomassekessel", target: "k-hws" },
      { id: "k-e2", source: "k-bhkw", target: "k-hws" },
      { id: "k-e3", source: "k-hws", target: "k-waermetauscher" },
    ]);
    // Erfolgsmeldung kommt von createDiagram
  });
}
