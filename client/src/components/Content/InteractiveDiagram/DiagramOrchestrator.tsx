import { useState, useEffect, ReactElement } from 'react';
import DiagramContainer from './DiagramContainer';
import { registerMain } from './MainDiagram'; 
import { registerAllSubdiagrams as registerSubs } from './Subdiagrams';

const DiagramOrchestrator = (): ReactElement => {
  const [isRegistryReady, setIsRegistryReady] = useState<boolean>(false);

  useEffect(() => {
    console.log("[Orchestrator] useEffect: Starte Diagramm-Registrierungen...");
    registerMain(); // Registriert das Hauptdiagramm
    registerSubs(); // Registriert alle Subdiagramme
    setIsRegistryReady(true);
    console.log("[Orchestrator] useEffect: Registry ist jetzt bereit.");
  }, []);

  if (!isRegistryReady) {
    console.log("[Orchestrator] Registry noch nicht bereit, zeige Platzhalter.");
    return <div className="box"><p className="loading-text">Diagramm wird initialisiert...</p></div>;
  }

  console.log("[Orchestrator] Registry bereit, rendere DiagramContainer.");
  return <DiagramContainer />;
};

export default DiagramOrchestrator;