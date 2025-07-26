import { PlacedFurniture } from "@/types/interactive";
import { Dimension, Coordinate } from "@/types/common";

export interface BoundingBox {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
}

const getBoundingBox = (
  position: Coordinate,
  dimension: Dimension
): BoundingBox => {
  const [x, y, z] = position;

  return {
    minX: x - dimension.width / 2,
    maxX: x + dimension.width / 2,
    minY: y - dimension.height / 2,
    maxY: y + dimension.height / 2,
    minZ: z - dimension.depth / 2,
    maxZ: z + dimension.depth / 2,
  };
};

export const isFurnitureValidPosition = (
  newPosition: Coordinate,
  furniture: PlacedFurniture,
  furnitureList: PlacedFurniture[]
): boolean => {
  // get bounding box of current box with new position
  const currentBox = getBoundingBox(newPosition, furniture.dimension);
  console.log("check");
  // check if any other box is overlapping with current box
  for (const otherFurniture of furnitureList) {
    const otherBox = getBoundingBox(
      otherFurniture.position,
      otherFurniture.dimension
    );
    if (
      currentBox.minX < otherBox.maxX &&
      currentBox.maxX > otherBox.minX &&
      currentBox.minY < otherBox.maxY &&
      currentBox.maxY > otherBox.minY &&
      currentBox.minZ < otherBox.maxZ &&
      currentBox.maxZ > otherBox.minZ
    ) {
      return false;
    }
  }

  // check room boundaries
  const roomBoundary = {
    minX: -4.5,
    maxX: 4.5,
    minZ: -4.5,
    maxZ: 4.5,
  };
  if (
    currentBox.minX < roomBoundary.minX ||
    currentBox.maxX > roomBoundary.maxX ||
    currentBox.minZ < roomBoundary.minZ ||
    currentBox.maxZ > roomBoundary.maxZ
  ) {
    return false;
  }

  return true;
};
