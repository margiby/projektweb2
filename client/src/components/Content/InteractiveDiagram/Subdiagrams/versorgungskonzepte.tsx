import { createTreeDiagram } from "../diagrammHooks/subdiagramFactory";
import type { TreeFactoryNodeConfig, TreeFactoryOptions } from "../data/flow-types";

export function registerVSKSubdiagram() {
  const tech4BiowasteTree: TreeFactoryNodeConfig = {
    id: "tech4biowaste-main", 
    type: "default", 
    className: "tech-logo-node",
    data: { label: "TECH4\nBIOWASTE" },
    children: [
      {
        id: "feedstocks",
        className: "tech-category-node tech-feedstocks",
        data: { label: "Feedstocks" },
        children: [
          { id: "food-waste", data: { label: "Food waste" }, className: "tech-item-node tech-feedstocks-item" },
          { id: "garden-park-waste", data: { label: "Garden and park waste" }, className: "tech-item-node tech-feedstocks-item" },
        ],
      },
      {
        id: "technologies",
        className: "tech-category-node tech-technologies",
        data: { label: "Technologies" },
        children: [
          { id: "pre-processing", data: { label: "Pre-processing" }, className: "tech-item-node technologies-item" },
          { id: "conversion", data: { label: "Conversion" }, className: "tech-item-node technologies-item" },
          { id: "post-processing", data: { label: "Post-processing" }, className: "tech-item-node technologies-item" },
          { id: "pilot-demo", data: { label: "Pilot and demo facilities" }, className: "tech-item-node technologies-item" },
        ],
      },
      {
        id: "products",
        className: "tech-category-node tech-products",
        data: { label: "Products" },
        children: [
          { id: "chemicals", data: { label: "Chemicals" }, className: "tech-item-node tech-products-item" },
          { id: "energy-fuels", data: { label: "Energy and fuels" }, className: "tech-item-node tech-products-item" },
          { id: "food-ingredients", data: { label: "Food ingredients" }, className: "tech-item-node tech-products-item" },
          { id: "materials", data: { label: "Materials" }, className: "tech-item-node tech-products-item" },
        ],
      },
    ],
  };

  const options: TreeFactoryOptions = {
    nodeIdPrefix: "vsk-tree", // Eindeutiger Präfix für automatisch generierte IDs in diesem Baum
    // defaultClassName und defaultNodeType können hier gesetzt werden, wenn die TreeNodeConfig sie nicht überschreibt
  };

  // Registriere dieses Diagramm unter der ID "versorgungskonzepte"
  createTreeDiagram("versorgungskonzepte", tech4BiowasteTree, options);
  console.log('Subdiagramm "versorgungskonzepte" registriert.');
}