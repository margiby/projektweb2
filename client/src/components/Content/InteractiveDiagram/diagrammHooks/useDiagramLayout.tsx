import { useEffect, useRef, useState, useCallback } from "react";
import { useNodesState, useEdgesState, useReactFlow } from "@xyflow/react";
import type { DiagramNode, DiagramEdge } from "../data/flow-types";
import { getLayoutedElements, type ElkLayoutOptions } from "../ElkLayout/layout-utils";
import { BASE_ELK_OPTIONS } from "./diagram-constants";
import { diagramRegistry } from "./diagramRegistry";
import { useDiagramStore } from "./useDiagramStore";

/**
 * Custom Hook zur Verwaltung der Logik eines interaktiven Diagramms.
 * Er kümmert sich um:
 * - Zustand der Knoten (Nodes) und Kanten (Edges).
 * - Berechnung und Aktualisierung des Layouts mithilfe von ELK.
 * - Behandlung von Größenänderungen des Containers.
 * - Verwaltung des Ladezustands.
 */
export function useDiagramLayout() {
  // Zustand für Knoten und Kanten, initialisiert mit leeren Arrays, da das Layout sie setzt.
  const [nodes, setNodes, onNodesChange] = useNodesState<DiagramNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<DiagramEdge>([]);

  // Ladezustand während der Layoutberechnung.
  const [isLoadingLayout, setIsLoadingLayout] = useState<boolean>(true);
  // Wird gesetzt, sobald das erste Layout abgeschlossen ist und das Diagramm angezeigt werden kann.
  const [hasLayouted, setHasLayouted] = useState<boolean>(false);

  // Referenz auf das HTML-Element, das das Diagramm enthält.
  const flowContainerRef = useRef<HTMLDivElement>(null);
  // Ref zur Drosselung (Debouncing) von ResizeEvents, um Performance zu schonen.
  const layoutTimeout = useRef<number | null>(null);

  // Zugriff auf React Flow Instanzmethoden
  const { fitView } = useReactFlow();

  const { diagramId } = useDiagramStore();

  /**
   * Berechnet die Positionen der Knoten mithilfe von ELK und aktualisiert den React Flow Zustand.
   * Wird initial und bei Container-Größenänderungen aufgerufen.
   * [containerWidth] Optionale aktuelle Breite des Containers für responsives Layout.
   */
  const layoutElements = useCallback(
    async (containerWidth?: number) => {
      setIsLoadingLayout(true); // UI: Ladezustand anzeigen

      const currentElkOptions: ElkLayoutOptions = { ...BASE_ELK_OPTIONS };

      // Responsive Anpassung der Abstände für schmale Viewports.
      if (containerWidth && containerWidth < 768) {
        currentElkOptions["elk.spacing.nodeNode"] = "10";
        currentElkOptions["elk.spacing.edgeNode"] = "10";
      }

        // Diagramm aus Registry holen
      const currentDiagram = diagramRegistry[diagramId] ?? diagramRegistry["root"];

      if (!currentDiagram) {
        console.error(`[useDiagramLayout]: Kein gültiges Diagramm für ID "${diagramId}"`);
        setNodes([]);
        setEdges([]);
        setHasLayouted(true);
        setIsLoadingLayout(false);
        return;
      }

      // Erstelle Kopien der initialen Knoten und Kanten, um sie prozessieren zu können.
      const nodesToProcess = currentDiagram.nodes.map((n) => ({ ...n }));
      const edgesToProcess = currentDiagram.edges.map((e) => ({ ...e }));

      try {
        // Asynchrone Berechnung des Layouts über die ELK-Bibliothek.
        const { nodes: layoutedNodes, edges: layoutedEdges } =
          await getLayoutedElements(
            nodesToProcess,
            edgesToProcess,
            currentElkOptions
          );

        // Aktualisiere den Zustand der Knoten und Kanten in React Flow.
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);

        // Warte auf den nächsten Frame, bevor `fitView` aufgerufen wird,
        // um sicherzustellen, dass die Knoten gerendert wurden und Dimensionen haben.
        requestAnimationFrame(() => {
          fitView({ padding: 0.05, duration: 300 }); // Zentriert und zoomt das Diagramm passend ein.
          setHasLayouted(true); // Markiert, dass das initiale Layout abgeschlossen ist.
        });
      } catch (err) {
        console.error("Fehler bei der Layoutberechnung:", err);
        // Fallback: Setze auf initiale (unlayoutete) Knoten/Kanten, falls ein Fehler auftritt.
        setNodes(currentDiagram.nodes);
        setEdges(currentDiagram.edges);
        setHasLayouted(true); // Trotz Fehler als "gelayoutet" markieren, um Endlosschleife zu vermeiden.
      } finally {
        setIsLoadingLayout(false); // UI: Ladezustand beenden.
      }
    },
    [diagramId, setNodes, setEdges, fitView] // Abhängigkeiten des Callbacks
  );

  /**
   * Effekt für das initiale Layout und die Beobachtung von Größenänderungen des Containers.
   */
  useEffect(() => {
    if (!flowContainerRef.current) return; // Stelle sicher, dass der Container existiert.

    // Erstelle einen ResizeObserver, um auf Änderungen der Containergröße zu reagieren.
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        // Debounce: Verhindere zu häufige Layout-Neuberechnungen bei schnellen Größenänderungen.
        if (layoutTimeout.current) clearTimeout(layoutTimeout.current);

        layoutTimeout.current = window.setTimeout(() => {
          layoutElements(entry.contentRect.width); // Rufe Layout-Funktion mit neuer Breite auf.
        }, 250); // Warte 250ms bevor das Layout neu berechnet wird.
      }
    });

    observer.observe(flowContainerRef.current); // Starte die Beobachtung des Containers.
    layoutElements(flowContainerRef.current.clientWidth); // Führe das initiale Layout aus.

    // Aufräumfunktion: Wird beim Unmounten der Komponente oder vor erneutem Ausführen des Effekts aufgerufen.
    return () => {
      observer.disconnect(); // Beende die Beobachtung.
      if (layoutTimeout.current) clearTimeout(layoutTimeout.current); // Bereinige den Timeout.
    };
  }, [layoutElements]);

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    isLoadingLayout,
    hasLayouted,
    flowContainerRef,
  };
}
