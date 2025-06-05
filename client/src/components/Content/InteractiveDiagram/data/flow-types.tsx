import type { Node, Edge } from '@xyflow/react';
import type { ElkLayoutOptions } from '../utils/ElkLayout-utils'; 

export type NodeDimensions = { 
  width: number;
  height: number;
};

// Daten, die jeder Knoten enthalten kann
export type NodeData = {
  label: string; // Beschriftung des Knotens
  description?: string;
  icon?: string;
  [key: string]: unknown; // Ermöglicht die Aufnahme beliebiger zusätzlicher Daten.
}
export type DiagramNode = Node<NodeData>; // Spezifischer Knotentyp
export type DiagramEdge = Edge<Record<string, unknown>>; // Allgemeiner Datentyp für Kanten

export type TreeFactoryNodeConfig = {
  id?: string;                     
  className?: string; 
  type?: string;            
  data: NodeData;               
  children?: TreeFactoryNodeConfig[]; // Kinder für die rekursive Erstellung
}

// Optionen für die Factory-Funktion
export type TreeFactoryOptions = {
  defaultClassName?: string;
  nodeIdPrefix?: string;
  defaultNodeType?: string;
  elkOptions?: ElkLayoutOptions;
  }