export type Furniture = {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  modelPath: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
};

export type RoomCategory = {
  id: string;
  name: string;
  imageUrl?: string;
  furniture: Furniture[];
};
