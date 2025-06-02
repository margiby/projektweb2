import type { Node, Edge } from '@xyflow/react';

// Daten, die jeder Knoten enthalten kann
export type NodeData = {
  label: string; // Beschriftung des Knotens
  description?: string;
  icon?: string;
  [key: string]: unknown; // Ermöglicht die Aufnahme beliebiger zusätzlicher Daten.
}
export type DiagramNode = Node<NodeData>; // Spezifischer Knotentyp
export type DiagramEdge = Edge<Record<string, unknown>>; // Allgemeiner Datentyp für Kanten