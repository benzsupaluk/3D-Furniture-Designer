import { Furniture } from "./room";
import { Coordinate, Dimensions } from "./common";

export type CameraView = "top" | "side" | "front" | "orbit";

export type InteractionMode = "none" | "drag" | "rotate" | "scale";

export type InteractiveMode = {
  mode: InteractionMode;
  targetId: string | null;
  startPosition: Coordinate | null;
  startRotation: Coordinate | null;
  startScale: Coordinate | null;
};

export type SceneInstance = {
  furniture: Furniture[];
};

export interface PlacedFurniture extends Furniture {
  position: Coordinate;
  rotation: Coordinate;
  scale: Coordinate;
  dimensions: Dimensions;
}
