// store/useCanvasCaptureStore.ts
import { WebGLRenderer, Scene, Camera, Vector3, Euler } from "three";
import { create } from "zustand";

type CanvasCaptureStore = {
  gl: WebGLRenderer | null;
  scene: Scene | null;
  camera: Camera | null;
  setRefs: (gl: WebGLRenderer, scene: Scene, camera: Camera) => void;
  imageDataUrl: string | null;
  setImageDataUrl: (url: string) => void;
  clearImageDataUrl: () => void;
};

export const useCanvasCaptureStore = create<CanvasCaptureStore>((set, get) => ({
  gl: null,
  scene: null,
  camera: null,
  imageDataUrl: null,
  setRefs: (gl, scene, camera) => set({ gl, scene, camera }),
  setImageDataUrl: (url) => {
    const currentUrl = get().imageDataUrl;
    if (currentUrl) {
      URL.revokeObjectURL(currentUrl);
    }
    set({ imageDataUrl: url });
  },
  clearImageDataUrl: () => {
    const currentUrl = get().imageDataUrl;
    if (currentUrl && currentUrl.startsWith("blob:")) {
      URL.revokeObjectURL(currentUrl);
    }
    set({ imageDataUrl: null });
  },
}));
