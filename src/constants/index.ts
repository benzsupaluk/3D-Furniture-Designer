import { RoomCategory } from "@/types/room";

export const ROOM_CATEGORIES: RoomCategory[] = [
  {
    id: "bedroom",
    name: "Bedroom",
    imageUrl:
      "https://images.unsplash.com/photo-1618221118493-9cfa1a1c00da?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    furniture: [
      {
        id: "bed-1",
        name: "Modern Bed",
        categoryId: "bedroom",
        modelPath: "/models/bed.glb",
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
      },
      {
        id: "wardrobe-1",
        name: "Wardrobe",
        categoryId: "bedroom",
        modelPath: "/models/wardrobe.glb",
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
      },
    ],
  },
  {
    id: "livingRoom",
    name: "Living Room",
    imageUrl:
      "https://images.unsplash.com/photo-1605774337664-7a846e9cdf17?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    furniture: [
      {
        id: "fridge-1",
        name: "Fridge",
        categoryId: "kitchen",
        modelPath: "/models/fridge.glb",
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
      },
    ],
  },
];
