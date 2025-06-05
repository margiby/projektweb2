import { registerVSKSubdiagram } from "./versorgungskonzepte";
import { registerKomponentenSubdiagram } from "./komponenten";

export function registerAllSubdiagrams(): void {
  console.log("STARTE REGISTRIERUNG aller Sub-Diagramme...");
  registerVSKSubdiagram();
  registerKomponentenSubdiagram();
  console.log("ABGESCHLOSSEN: Registrierung aller Sub-Diagramme.");
}
