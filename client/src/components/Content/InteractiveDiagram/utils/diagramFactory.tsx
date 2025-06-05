import type { DiagramNode, DiagramEdge, TreeFactoryNodeConfig, TreeFactoryOptions } from "../data/flow-types";
import { createDiagram } from "./diagramRegistry"; 

export function createTreeDiagram(
  diagramId: string,
  rootNodeConfig: TreeFactoryNodeConfig, 
  options: TreeFactoryOptions = {}
): void {
  const nodes: DiagramNode[] = [];
  const edges: DiagramEdge[] = [];
  let nodeIdCounter = 0;

   // Extrahiert und setzt Standardwerte für Styling und ID-Generierung
  const {
    defaultClassName = "tree-node-default", // Diese werden verwendet, falls in config nichts steht
    nodeIdPrefix = diagramId + "-n", // Standardpräfix basierend auf diagramId
    defaultNodeType = "default",
    elkOptions,
  } = options;

  function processNodeConfig(config: TreeFactoryNodeConfig, parentNodeId?: string): string {
    nodeIdCounter++;
    // Generiere eine eindeutige ID für den Knoten, falls nicht angegeben
    const nodeId = config.id || `${nodeIdPrefix}-${nodeIdCounter}`;

    nodes.push({
      id: nodeId,
      position: { x: 0, y: 0 }, 
      data: config.data,       
      type: config.type || defaultNodeType,
      className: config.className || defaultClassName,
    });

    if (parentNodeId) {
      edges.push({
        id: `edge-${parentNodeId}-${nodeId}`,
        source: parentNodeId,
        target: nodeId,
      });
    }

    if (config.children && config.children.length > 0) {
      config.children.forEach(childConfig => {
        processNodeConfig(childConfig, nodeId);
      });
    }
    return nodeId;
  }

  processNodeConfig(rootNodeConfig);
  createDiagram(diagramId, nodes, edges, elkOptions);
  console.info(`Logik für Baumdiagramm "${diagramId}" ausgeführt (createDiagram wurde aufgerufen).`);
}