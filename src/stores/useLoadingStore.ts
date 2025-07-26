import { create } from "zustand";

type LoadingState = {
  loadingFullScreen: boolean;
  setLoadingFullScreen: (value: boolean) => void;
};

export const useLoadingStore = create<LoadingState>((set) => ({
  loadingFullScreen: false,
  setLoadingFullScreen: (value) => set({ loadingFullScreen: value }),
}));
