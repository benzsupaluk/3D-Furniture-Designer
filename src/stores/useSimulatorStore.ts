import { create } from "zustand";
import { nanoid } from "nanoid";
import { RoomCategory } from "@/types/room";
import { PlacedFurniture } from "@/types/interactive";
import { CameraView, InteractiveMode } from "@/types/interactive";
import { ROOM_CATEGORIES } from "@/constants";

type SimulatorState = {
  roomCategories: RoomCategory[];

  scene: {
    furniture: PlacedFurniture[];
  };

  selectedFurnitureId: string;
  setSelectedFurnitureId: (furnitureId: string) => void;

  addFurnitureToScene: (furniture: Omit<PlacedFurniture, "id">) => void;
  resetAllFurnitureFromScene: () => void;
  removeFurnitureFromScene: (furnitureId: string) => void;
  updatePlacedFurnitureById: (
    furnitureId: string,
    updates: Partial<PlacedFurniture>
  ) => void;

  cameraView: CameraView;
  setCameraView: (view: CameraView) => void;

  interactiveMode: InteractiveMode;
  setInteractiveMode: (mode: Partial<InteractiveMode>) => void;
};

export const useSimulatorStore = create<SimulatorState>((set) => ({
  // TODO: Get room categories from API
  roomCategories: ROOM_CATEGORIES,

  scene: {
    furniture: [],
  },

  selectedFurnitureId: "",
  setSelectedFurnitureId: (furnitureId) =>
    set({ selectedFurnitureId: furnitureId }),

  addFurnitureToScene: (furniture) =>
    set((state) => ({
      scene: {
        ...state.scene,
        furniture: [
          ...state.scene.furniture,
          {
            ...furniture,
            id: nanoid(),
          },
        ],
      },
    })),

  resetAllFurnitureFromScene: () => set({ scene: { furniture: [] } }),

  removeFurnitureFromScene: (furnitureId) =>
    set((state) => ({
      scene: {
        ...state.scene,
        furniture: state.scene.furniture.filter((f) => f.id !== furnitureId),
      },
    })),

  updatePlacedFurnitureById: (
    furnitureId: string,
    updates: Partial<PlacedFurniture>
  ) =>
    set((state) => ({
      scene: {
        ...state.scene,
        furniture: state.scene.furniture.map((f) => {
          return f.id === furnitureId ? { ...f, ...updates } : f;
        }),
      },
    })),

  cameraView: "orbit",
  setCameraView: (view) => set({ cameraView: view }),

  interactiveMode: {
    mode: "none",
    targetId: null,
    startPosition: null,
    startRotation: null,
    startScale: null,
  },
  setInteractiveMode: (mode) =>
    set((state) => ({
      interactiveMode: { ...state.interactiveMode, ...mode },
    })),
}));
