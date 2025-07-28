export type FurnitureType =
  | "chair"
  | "table"
  | "sofa"
  | "bed"
  | "cabinet"
  | "desk";

export type Furniture = {
  id: string;
  type?: FurnitureType;
  name: string;
  description?: string;
  categoryId: string;
  color?: string;
  modelPath?: string;
  previewImage?: string;
};

export type RoomCategory = {
  id: string;
  name: string;
  imageUrl?: string;
  furniture: Furniture[];
};
