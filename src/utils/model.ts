import { Dimensions, Coordinate } from "@/types/common";
import { FurnitureType } from "@/types/room";

export const getDefaultFurnitureInfo = (
  type?: FurnitureType
): { dimensions: Dimensions; imagePreview: string } => {
  let dimensions: Dimensions = { width: 1, height: 1, depth: 1 };
  let imagePreview: string = "";

  switch (type) {
    case "chair":
      dimensions = { width: 0.6, height: 0.8, depth: 0.6 };
      imagePreview =
        "https://pub-6b5e438ff521432d97743fa951e0db00.r2.dev/chair.webp";
      break;
    case "table":
      dimensions = { width: 1.2, height: 0.8, depth: 0.8 };
      imagePreview =
        "https://pub-6b5e438ff521432d97743fa951e0db00.r2.dev/table.webp";
      break;
    case "sofa":
      dimensions = { width: 2.0, height: 0.8, depth: 0.9 };
      imagePreview =
        "https://pub-6b5e438ff521432d97743fa951e0db00.r2.dev/sofa.webp";
      break;
    case "bed":
      dimensions = { width: 1.6, height: 0.6, depth: 2.0 };
      imagePreview =
        "https://pub-6b5e438ff521432d97743fa951e0db00.r2.dev/bed.webp";
      break;
    case "cabinet":
      dimensions = { width: 1.0, height: 2.0, depth: 0.5 };
      imagePreview =
        "https://pub-6b5e438ff521432d97743fa951e0db00.r2.dev/cabinet.webp";
      break;
  }

  return { dimensions, imagePreview };
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
  scale: Coordinate,
  rotationY: number = 0
): BoundingBox => {
  const [x, y, z] = position;

  const width = dimensions.width * scale[0];
  const height = dimensions.height * scale[1];
  const depth = dimensions.depth * scale[2];

  // Normalize rotation to 0-2π range
  const angle = ((rotationY % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

  // Calculate exact rotated bounding box
  const sin = Math.abs(Math.sin(angle));
  const cos = Math.abs(Math.cos(angle));

  // Rotated dimensions (axis-aligned bounding box after rotation)
  const rotatedWidth = width * cos + depth * sin;
  const rotatedDepth = width * sin + depth * cos;

  return {
    minX: x - rotatedWidth / 2,
    maxX: x + rotatedWidth / 2,
    minY: y - height / 2,
    maxY: y + height / 2,
    minZ: z - rotatedDepth / 2,
    maxZ: z + rotatedDepth / 2,
  };
};
