import { create } from "zustand";

type Store = {
  diagramId: string;
  setDiagramId: (id: string) => void;
};

export const useDiagramStore = create<Store>((set) => ({
  diagramId: "root",
  setDiagramId: (id) => set({ diagramId: id }),
}));
