import { Dimension } from "./common";

export type Furniture = {
  id: string;
  type?: string;
  name: string;
  description?: string;
  categoryId: string;
  modelPath: string;
  dimension: Dimension;
  color?: string;
};

export type RoomCategory = {
  id: string;
  name: string;
  imageUrl?: string;
  furniture: Furniture[];
};
