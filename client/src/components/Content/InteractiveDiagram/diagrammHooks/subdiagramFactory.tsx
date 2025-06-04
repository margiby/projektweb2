import type { DiagramNode, DiagramEdge, TreeFactoryNodeConfig, TreeFactoryOptions } from "../data/flow-types";
import { createSubDiagram } from "./diagramRegistry";

export function createTreeDiagram(
  diagramId: string,
  rootNodeConfig: TreeFactoryNodeConfig, 
  options: TreeFactoryOptions = {}
): void {
  const nodes: DiagramNode[] = [];
  const edges: DiagramEdge[] = [];
  let nodeIdCounter = 0;

  const {
    defaultClassName = "tree-node-default",
    nodeIdPrefix = "treeN",
    defaultNodeType = "default",
  } = options;

  function processNodeConfig(config: TreeFactoryNodeConfig, parentNodeId?: string): string {
    nodeIdCounter++;
    const nodeId = config.id || `${nodeIdPrefix}-${nodeIdCounter}`;

    // Erstelle das DiagramNode-Objekt
    nodes.push({
      id: nodeId,
      position: { x: 0, y: 0 }, // ELK kümmert sich um die Positionierung
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
  createSubDiagram(diagramId, nodes, edges);
  console.info(`Baumdiagramm "${diagramId}" erstellt.`);
}

