import { registerVSKSubdiagram } from "./versorgungskonzepte";
import { registerKomponentenSubdiagram } from "./komponenten";

export function registerAllSubdiagrams(): void {
  console.log("REGISTERING: Sub-Diagrams...");
  registerVSKSubdiagram();
  registerKomponentenSubdiagram();
  console.log("REGISTERED: Sub-Diagrams.");
}
