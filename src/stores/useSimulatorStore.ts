import { create } from "zustand";
import { nanoid } from "nanoid";
import { RoomCategory, Furniture } from "@/types/room";
import { CameraView, InteractiveMode } from "@/types/simulator";
import { ROOM_CATEGORIES } from "@/constants";

type SimulatorState = {
  roomCategories: RoomCategory[];

  scene: {
    furniture: Furniture[];
  };

  addFurnitureToScene: (furniture: Omit<Furniture, "id">) => void;
  removeFurnitureFromScene: (furnitureId: string) => void;

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

  removeFurnitureFromScene: (furnitureId) =>
    set((state) => ({
      scene: {
        ...state.scene,
        furniture: state.scene.furniture.filter((f) => f.id !== furnitureId),
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
