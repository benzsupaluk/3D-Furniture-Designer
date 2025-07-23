import { Furniture } from "./room";

export type CameraView = "top" | "side" | "front" | "orbit";

export type InteractionMode = "none" | "drag" | "rotate" | "scale";

export type InteractiveMode = {
  mode: InteractionMode;
  targetId: string | null;
  startPosition: [number, number, number] | null;
  startRotation: [number, number, number] | null;
  startScale: [number, number, number] | null;
};

export type SceneInstance = {
  furniture: Furniture[];
};
