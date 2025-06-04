import type { DiagramNode } from "./flow-types";

//Definition der Knoten
export const initialNodes: DiagramNode[] = [
  {
    id: "eigenschaften",
    data: { label: "Eigenschaften" },
    position: { x: 0, y: 0 }, // Wird von ELK überschrieben
    type: 'default', // Standard-Knotentyp von React Flow
    className: "circle-node",
  },
  {
    id: "produkte",
    data: { label: "Produkte,\nz.B. Scheitholz" },
    position: { x: 0, y: 0 },
    type: "default",
    className: "produkte-node",
  },
  {
    id: "paramProdukte",
    data: { label: "Parameter" },
    position: { x: 0, y: 0 },
    type: "default",
    className: "circle-node",
  },
  {
    id: "komponenten",
    data: {
      label:
        "Komponenten\nz.B. Heißwasserspeicher für En30\nKlassen von Konversionsverfahren",
    },
    position: { x: 0, y: 0 },
    type: 'default',
    className: "komponenten-node",
  },
  {
    id: "paramKomponenten",
    data: { label: "Parameter" },
    position: { x: 0, y: 0 },
    type: "default",
    className: "circle-node",
  },
  {
    id: "mix",
    data: { label: "Mix" },
    position: { x: 0, y: 0 },
    type: "default",
    className: "mix-node",
  },
  {
    id: "prozessketten",
    data: { label: "Prozessketten\nz.B.: BGA 75k PQ1 Gülle" },
    position: { x: 0, y: 0 },
    type: "default",
    className: "prozessketten-node",
  },
  {
    id: "paramProzessketten",
    data: { label: "Parameter" },
    position: { x: 0, y: 0 },
    type: "default",
    className: "circle-node",
  },
  {
    id: "versorgungsaufgaben",
    data: {
      label:
        "Versorgungsaufgaben/Tasks\nz.B.: Industrielle Wärmeversorgung\nbis zu max. 200°C",
    },
    position: { x: 0, y: 0 },
    type: "default",
    className: "versorgungsaufgaben-node",
  },
  {
    id: "paramVersorgungsaufgaben",
    data: { label: "Parameter" },
    position: { x: 0, y: 0 },
    type: "default",
    className: "circle-node",
  },
  {
    id: "versorgungskonzepte",
    data: {
      label: "Versorgungskonzepte/\nsupply concepts\nz.B.: EH + ST für En30",
    },
    position: { x: 0, y: 0 },
    type: "default",
    className: "versorgungskonzepte-node",
  },
  {
    id: "paramVersorgungskonzepte",
    data: { label: "Parameter" },
    position: { x: 0, y: 0 },
    type: "default",
    className: "circle-node",
  },
];