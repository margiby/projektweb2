import { useEffect, useRef, useState, useCallback } from "react";
import { useNodesState, useEdgesState, useReactFlow } from "@xyflow/react";
import type { DiagramNode, DiagramEdge } from "../data/flow-types";
import {
  getLayoutedElements,
  type ElkLayoutOptions,
} from "../utils/ElkLayout-utils";
import { BASE_ELK_OPTIONS } from "../data/diagram-constants";
import { diagramRegistry } from "../utils/diagramRegistry";
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
  const [nodes, setNodes, onNodesChange] = useNodesState<DiagramNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<DiagramEdge>([]);
  const [isLoadingLayout, setIsLoadingLayout] = useState<boolean>(true);
  const [hasLayouted, setHasLayouted] = useState<boolean>(false);
  const flowContainerRef = useRef<HTMLDivElement>(null);
  const layoutTimeout = useRef<number | null>(null);
  const { fitView } = useReactFlow(); // React Flow Funktion zum Anpassen der Ansicht
  const { diagramId } = useDiagramStore(); // Aktuelle ID des anzuzeigenden Diagramms

  /**
   * Berechnet die Positionen der Knoten und Kanten mithilfe von ELK
   * und aktualisiert den Zustand für React Flow.
   */
  const layoutElements = useCallback(
    async (containerWidth?: number) => {
      setIsLoadingLayout(true);
      console.log(
        `[useDiagramLayout] layoutElements START für diagramId: "${diagramId}"`
      );

      // Lade die Daten (Knoten, Kanten, spezifische ELK-Optionen) für das aktuelle Diagramm
      // Greife auf "root" als Fallback zurück, falls die diagramId nicht im Registry ist.
      const currentDiagramData =
        diagramRegistry[diagramId] ?? diagramRegistry["root"];
      console.log(
        "[useDiagramLayout] currentDiagramData ermittelt:",
        currentDiagramData
      );

      // Sicherheitsprüfung: Stelle sicher, dass gültige Diagrammdaten vorhanden sind
      if (
        !currentDiagramData ||
        !currentDiagramData.nodes ||
        !currentDiagramData.edges ||
        !Array.isArray(currentDiagramData.nodes) ||
        !Array.isArray(currentDiagramData.edges)
      ) {
        console.error(
          `FEHLER: Kein gültiges Diagramm-Objekt für ID "${diagramId}" oder Fallback "root" gefunden`
        );
        setNodes([]);
        setEdges([]);
        setHasLayouted(true); // Wichtig, um Ladeanzeige zu beenden
        setIsLoadingLayout(false);
        return;
      }

      // --- Dynamische ELK-Optionen bestimmen ---
      // 1. Starte mit einer Kopie der globalen Basisoptionen
      let resolvedElkOptions: ElkLayoutOptions = { ...BASE_ELK_OPTIONS };

      // 2. Wenn das aktuelle Diagramm spezifische Optionen hat, mische sie hinzu
      //    (spezifische Optionen überschreiben dabei die Basisoptionen)
      if (currentDiagramData.elkOptions) {
        console.log(
          `[useDiagramLayout] Spezifische ELK-Optionen für Diagramm "${diagramId}" gefunden:`,
          currentDiagramData.elkOptions
        );
        resolvedElkOptions = {
          ...resolvedElkOptions,
          ...currentDiagramData.elkOptions,
        };
      } else {
        console.log(
          `[useDiagramLayout] Keine spezifischen ELK-Optionen für "${diagramId}", verwende Basisoptionen.`
        );
      }

      // 3. Wende responsive Anpassungen auf die bereits aufgelösten Optionen an
      //    Diese überschreiben ggf. vorher gesetzte Werte für Abstände.
      if (containerWidth && containerWidth < 768) {
        resolvedElkOptions["elk.spacing.nodeNode"] = "10";
        resolvedElkOptions["elk.spacing.edgeNode"] = "10";
      }
      console.log(
        "[useDiagramLayout] Finale ELK-Optionen für Layout:",
        resolvedElkOptions
      );
      // --- Ende Dynamische ELK-Optionen ---

      // Erstelle Kopien der Knoten und Kanten für die Verarbeitung
      const nodesToProcess = currentDiagramData.nodes.map((n) => ({ ...n }));
      const edgesToProcess = currentDiagramData.edges.map((e) => ({ ...e }));

      try {
        // Asynchrone Berechnung des Layouts
        const { nodes: layoutedNodes, edges: layoutedEdges } =
          await getLayoutedElements(
            nodesToProcess,
            edgesToProcess,
            resolvedElkOptions // Übergebe die final bestimmten Optionen
          );

        setNodes(layoutedNodes); // Aktualisiere Knoten im React Flow Zustand
        setEdges(layoutedEdges); // Aktualisiere Kanten im React Flow Zustand

        // Passe die Ansicht nach dem Layout an
        requestAnimationFrame(() => {
          fitView({ padding: 0.05, duration: 300 });
          setHasLayouted(true); // Markiere Layout als abgeschlossen
        });
      } catch (err) {
        console.error("Fehler bei der Layoutberechnung:", err, {
          nodesToProcess,
          edgesToProcess,
        });
        // Fallback: Zeige die ursprünglichen (ungelayouteten) Knoten und Kanten des aktuellen Diagramms an
        setNodes(currentDiagramData.nodes);
        setEdges(currentDiagramData.edges);
        setHasLayouted(true);
      } finally {
        setIsLoadingLayout(false); // Beende den Ladezustand
      }
    },
    [diagramId, setNodes, setEdges, fitView] // Abhängigkeiten für useCallback
  );

  /**
   * Effekt für das initiale Layout und die Beobachtung von Größenänderungen des Containers.
   */
  useEffect(() => {
    console.log(
      `[useDiagramLayout] useEffect triggered. diagramId: "${diagramId}". flowContainerRef.current vorhanden:`,
      !!flowContainerRef.current
    );
    /**
     * Rufe layoutElements initial auf. containerWidth wird undefined sein, wenn das Ref noch nicht bereit ist,
     * aber layoutElements sollte damit umgehen können (durch den optionalen Parameter).
     *  Ein `if (!flowContainerRef.current) return;` würde den ersten Aufruf blockieren, wenn das Ref noch nicht da ist.
     * Hier wird es direkt versucht.
     */
    layoutElements(flowContainerRef.current?.clientWidth);

    const currentFlowContainer = flowContainerRef.current; // Wert für Cleanup speichern
    if (!currentFlowContainer) {
      console.warn(
        "[useDiagramLayout] useEffect: flowContainerRef ist beim Setup des ResizeObserver noch nicht gesetzt."
      );
      return; // Ohne Ref kann kein Observer erstellt werden
    }

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (layoutTimeout.current) clearTimeout(layoutTimeout.current);
        layoutTimeout.current = window.setTimeout(() => {
          console.log(
            "[useDiagramLayout] ResizeObserver ruft layoutElements auf."
          );
          layoutElements(entry.contentRect.width);
        }, 250);
      }
    });

    observer.observe(currentFlowContainer);

    return () => {
      observer.disconnect();
      if (layoutTimeout.current) clearTimeout(layoutTimeout.current);
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
