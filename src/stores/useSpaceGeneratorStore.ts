import { create } from "zustand";
import { SpaceType, SpaceStyle, PoolResult } from "@/types/generator";

type SpaceGeneratorState = {
  refId: string;

  spaceType: SpaceType;
  setSpaceType: (spaceType: SpaceType) => void;

  spaceStyle: SpaceStyle;
  setSpaceStyle: (spaceStyle: SpaceStyle) => void;

  poolResult: PoolResult | null;
  setPoolResult: (result: PoolResult) => void;
};

export const useSpaceGeneratorStore = create<SpaceGeneratorState>((set) => ({
  refId: "",

  spaceType: "living_room",
  setSpaceType: (spaceType) => set({ spaceType }),

  spaceStyle: "modern",
  setSpaceStyle: (spaceStyle) => set({ spaceStyle }),

  poolResult: null,
  setPoolResult: (result) => set({ poolResult: result }),
}));
