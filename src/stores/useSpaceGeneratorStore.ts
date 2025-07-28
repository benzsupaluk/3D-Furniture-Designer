import { create } from "zustand";
import {
  SpaceType,
  SpaceStyle,
  PoolResult,
  SpaceTypeItem,
  SpaceStyleItem,
} from "@/types/generator";
import { SPACE_STYLES, SPACE_TYPES } from "@/constants";

type SpaceGeneratorState = {
  refId: string;
  setRefId: (refId: string) => void;

  spaceTypeOptions: SpaceTypeItem[];
  spaceType: SpaceType;
  setSpaceType: (spaceType: SpaceType) => void;

  spaceStyleOptions: SpaceStyleItem[];
  spaceStyle: SpaceStyle;
  setSpaceStyle: (spaceStyle: SpaceStyle) => void;

  poolResult: PoolResult | null;
  setPoolResult: (result: PoolResult) => void;
};

export const useSpaceGeneratorStore = create<SpaceGeneratorState>((set) => ({
  refId: "",
  setRefId: (refId) => set({ refId }),

  spaceTypeOptions: SPACE_TYPES,
  spaceType: "living_room",
  setSpaceType: (spaceType) => set({ spaceType }),

  spaceStyleOptions: SPACE_STYLES,
  spaceStyle: "modern",
  setSpaceStyle: (spaceStyle) => set({ spaceStyle }),

  poolResult: null,
  setPoolResult: (result) => set({ poolResult: result }),
}));
