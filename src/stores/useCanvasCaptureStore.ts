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
};

export const useCanvasCaptureStore = create<CanvasCaptureStore>((set) => ({
  gl: null,
  scene: null,
  camera: null,
  imageDataUrl: null,
  setRefs: (gl, scene, camera) => set({ gl, scene, camera }),
  setImageDataUrl: (url) => set({ imageDataUrl: url }),
}));
