import { create } from "zustand";
import { nanoid } from "nanoid";
import { RoomCategory, Furniture } from "@/types/room";
import { PlacedFurniture } from "@/types/interactive";
import { CameraView, InteractiveMode } from "@/types/interactive";
import { ROOM_CATEGORIES } from "@/constants";
import { Coordinate } from "@/types/common";

type SimulatorState = {
  roomCategories: RoomCategory[];

  scene: {
    furniture: PlacedFurniture[];
  };

  selectedFurnitureId: string;
  setSelectedFurnitureId: (furnitureId: string) => void;

  addFurnitureToScene: (
    furniture: Omit<PlacedFurniture, "id">,
    position?: Coordinate
  ) => void;
  removeFurnitureFromScene: (furnitureId: string) => void;
  updatePlacedFurnitureById: (
    furnitureId: string,
    updates: Partial<PlacedFurniture>
  ) => void;

  cameraView: CameraView;
  setCameraView: (view: CameraView) => void;

  interactiveMode: InteractiveMode;
  setInteractiveMode: (mode: Partial<InteractiveMode>) => void;

  loadingFullScreen: boolean;
  setLoadingFullScreen: (value: boolean) => void;
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

  addFurnitureToScene: (furniture, position = [0, 0, 0]) =>
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
          console.log("found", f.id, furnitureId, f.id === furnitureId);
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

  loadingFullScreen: false,
  setLoadingFullScreen: (value) => set({ loadingFullScreen: value }),
}));
