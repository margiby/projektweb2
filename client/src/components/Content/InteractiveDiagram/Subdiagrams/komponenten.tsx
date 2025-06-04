import { createSubDiagram } from "../diagrammHooks/diagramRegistry";

/**
 * Registriert das Subdiagramm für "komponenten"
 * Knoten enthalten Beschreibung und Kenndaten
 */
export function registerKomponentenSubdiagram() {
  createSubDiagram("komponenten", [
    {
      id: "k-hws",
      data: {
        label: "Heißwasserspeicher",
      },
      position: { x: 0, y: 0 },
      type: "default",
      className: "komponenten-node",
    },
    {
      id: "k-biomassekessel",
      data: {
        label: "Biomassekessel",
      },
      position: { x: 0, y: 0 },
      type: "default",
      className: "komponenten-node",
    },
    {
      id: "k-bhkw",
      data: {
        label: "Gas-BHKW",
      },
      position: { x: 0, y: 0 },
      type: "default",
      className: "komponenten-node",
    },
    {
      id: "k-waermetauscher",
      data: {
        label: "Wärmetauscher",
      },
      position: { x: 0, y: 0 },
      type: "default",
      className: "komponenten-node",
    },
  ], [
    { id: "k-e1", source: "k-biomassekessel", target: "k-hws" },
    { id: "k-e2", source: "k-bhkw", target: "k-hws" },
    { id: "k-e3", source: "k-hws", target: "k-waermetauscher" },
  ]);
}
