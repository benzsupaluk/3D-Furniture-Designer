import { Dimensions, Coordinate } from "@/types/common";
import { FurnitureType } from "@/types/room";

export const getDefaultDimensions = (type?: FurnitureType): Dimensions => {
  switch (type) {
    case "chair":
      return { width: 0.6, height: 0.8, depth: 0.6 };
    case "table":
      return { width: 1.2, height: 0.8, depth: 0.8 };
    case "sofa":
      return { width: 2.0, height: 0.8, depth: 0.9 };
    case "bed":
      return { width: 1.6, height: 0.6, depth: 2.0 };
    case "cabinet":
      return { width: 1.0, height: 2.0, depth: 0.5 };
    case "desk":
      return { width: 1.5, height: 0.75, depth: 0.8 };
    default:
      return { width: 1.0, height: 1.0, depth: 1.0 };
  }
};

export interface BoundingBox {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
}

export const getBoundingBox = (
  position: Coordinate,
  dimensions: Dimensions,
  scale: Coordinate
): BoundingBox => {
  const [x, y, z] = position;

  const width = dimensions.width * scale[0];
  const height = dimensions.height * scale[1];
  const depth = dimensions.depth * scale[2];

  return {
    minX: x - width / 2,
    maxX: x + width / 2,
    minY: y - height / 2,
    maxY: y + height / 2,
    minZ: z - depth / 2,
    maxZ: z + depth / 2,
  };
};
