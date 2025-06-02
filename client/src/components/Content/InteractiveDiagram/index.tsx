import { ReactElement, useEffect, useState, useRef, useCallback } from "react";
import { FormattedMessage } from "react-intl";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import { initialNodes } from "./nodes";
import { initialEdges } from "./edges";
import { getLayoutedElements, ElkLayoutOptions } from "./layout-utils";
import "@xyflow/react/dist/style.css";
import "./diagram.css";

// Grundlegende Layout-Optionen für ELKjs
const BASE_ELK_OPTIONS: ElkLayoutOptions = {
  "elk.algorithm": "mrtree",
  "elk.direction": "DOWN",
  "elk.spacing.nodeNode": "60",
  "elk.spacing.edgeNode": "60",
};

const InteractiveDiagramCore = (): ReactElement => {
  /** 
   React Flow Hooks zur Verwaltung des Zustands von Knoten und Kanten:
   * `initialNodes` und `initialEdges` werden hier als Startwerte verwendet.
   * `onNodesChange` und `onEdgesChange` sind Handler, die React Flow intern für Änderungen benötigt. 
   */
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  // Zustand, um anzuzeigen, ob das Layout gerade berechnet wird.
  const [isLoadingLayout, setIsLoadingLayout] = useState<boolean>(true);

  // Ref für das Container-Div des Diagramms. Wird vom ResizeObserver verwendet, um Größenänderungen zu erkennen.
  const flowContainerRef = useRef<HTMLDivElement>(null);

  // Hook von React Flow, um die Ansicht automatisch anzupassen, wenn das Layout fertig ist.
  // `fitView` zentriert und zoomt das Diagramm, sodass alle Knoten sichtbar sind.
  const { fitView } = useReactFlow();

  /**
  Eine Callback-Funktion, die das Layout der Elemente (Knoten und Kanten)
   * mithilfe von `getLayoutedElements` (ELKjs) berechnet und anwendet.
   * Sie passt die ELK-Optionen basierend auf der optionalen Containerbreite an.
   * [containerWidth] - Die aktuelle Breite des Diagramm-Containers.
   * Wird verwendet, um Layout-Optionen anzupassen.
   */
  const layoutElements = useCallback(
    async (containerWidth?: number) => {
      setIsLoadingLayout(true); // Ladezustand aktivieren

      // Kopie der Basis-ELK-Optionen erstellen, um sie modifizieren zu können.
      const currentElkOptions: ElkLayoutOptions = { ...BASE_ELK_OPTIONS };

      // Responsive Anpassung der ELK-Optionen für kleinere Bildschirme.
      if (containerWidth && containerWidth < 768) {
        currentElkOptions["elk.direction"] = "DOWN";
        currentElkOptions["elk.spacing.nodeNode"] = "30";
        currentElkOptions["elk.spacing.edgeNode"] = "30";
      } else {
        currentElkOptions["elk.direction"] = BASE_ELK_OPTIONS["elk.direction"];
      }

      /**
      Erstellt Kopien der initialen Knoten und Kanten, um sicherzustellen,
      * dass `getLayoutedElements` immer mit einem sauberen Zustand arbeitet.
      * Dies verhindert, dass Änderungen an den Originaldaten die Layout-Berechnung beeinflussen.
      */
      const nodesToProcess = initialNodes.map((n) => ({ ...n }));
      const edgesToProcess = initialEdges.map((e) => ({ ...e }));

      /**
       * Fehlerbehandlung: "try...catch...finally"-Block fängt Fehler 
       * während des Layouts ab und setzt im Fehlerfall die Knoten 
       * auf ihre ursprünglichen Definitionen zurück. 
       */
      try {
        // Ruft die Layout-Funktion auf, um die neuen Positionen zu erhalten.
        const { nodes: layoutedNodes } = await getLayoutedElements(
          nodesToProcess,
          edgesToProcess,
          currentElkOptions
        );
        setNodes(layoutedNodes); // Aktualisiere den Knotenzustand mit den neuen Positionen/Größen.
        /**
         *  `setTimeout` mit 0ms Verzögerung, um sicherzustellen, dass die Knoten gerendert wurden,
         *  bevor `fitView` aufgerufen wird (gibt dem Browser einen Moment zum Aktualisieren).
         */
        setTimeout(() => fitView({ padding: 0.1, duration: 300 }), 0);
      } catch (e) {
        console.error("Fehler beim Layouting:", e);
        /**
        * Im Fehlerfall die Knoten auf ihre ursprünglichen Positionen zurücksetzen.
        * Dies stellt sicher, dass zumindest die Basisdaten angezeigt werden.
        */
        setNodes(
          initialNodes.map((n) => ({
            ...n,
            position: n.position,
          }))
        );
      } finally {
        setIsLoadingLayout(false); // Ladezustand deaktivieren
      }
    },
    [setNodes, fitView]
  );

  /**
   * Hook für das initiale Layout und das Beobachten von Größenänderungen des Containers.
   * Dieser Effekt wird einmal beim Mounten der Komponente und immer dann ausgeführt, 
   * wenn sich layoutElements ändert (was aufgrund von `useCallback` nur selten der Fall sein sollte).
   * - Die `cleanup`-Funktion des `useEffect` (return-Anweisung) trennt den `ResizeObserver`,
   * wenn die Komponente unmounted wird, um Memory Leaks zu vermeiden.
   */
  useEffect(() => {
    if (!flowContainerRef.current) return; // Sicherstellen, dass der Container existiert

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        layoutElements(entry.contentRect.width); // Layout mit der neuen Breite neu berechnen
      }
    });

    observer.observe(flowContainerRef.current);  // Beobachtung des Containers starten
    layoutElements(flowContainerRef.current.clientWidth); // Initiales Layout mit der aktuellen Breite

    return () => observer.disconnect(); // Aufräumen: Beobachter entfernen
  }, [layoutElements]);

  // Ladeanzeige, während das Layout berechnet wird und noch keine Knoten vorhanden sind
  if (isLoadingLayout && nodes.length === 0) {
    return (
      <div className="box">
        <h3 className="title is-4 has-text-centered">
          <FormattedMessage
            id="diagram_title"
            defaultMessage="Datenübersicht"
          />
        </h3>
        <div
          ref={flowContainerRef}
          className="diagram-reactflow-container is-loading"
        >
          <p className="loading-text">Layout wird berechnet...</p>
        </div>
      </div>
    );
  }

   // Rendern des eigentlichen Diagramms
  return (
    <div className="box">
      <h3 className="title is-4 has-text-centered">
        <FormattedMessage id="diagram_title" defaultMessage="Datenübersicht" />
      </h3>
      <div ref={flowContainerRef} className="diagram-reactflow-container">
        <ReactFlow
          nodes={nodes} // Die aktuellen Knoten aus dem State
          edges={edges} // Die aktuellen Kanten aus dem State
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodesDraggable={false} //Macht alle Knoten unbeweglich
        >
          <Background /> {/* Hintergrund für das Diagramm */}
          <Controls /> {/* Steuerelemente für Zoom und Pan */}
          <MiniMap /> {/* Mini-Übersichtskarte des Diagramms */}
        </ReactFlow>
      </div>
    </div>
  );
};

const InteractiveDiagram = (): ReactElement => (
  // `ReactFlowProvider` ist notwendig, damit Hooks wie `useReactFlow`
 // * in Kindkomponenten (hier `InteractiveDiagramCore`) funktionieren.
  <ReactFlowProvider>
    <InteractiveDiagramCore />
  </ReactFlowProvider>
);

export default InteractiveDiagram;
