import { RoomCategory } from "@/types/room";

export const ROOM_CATEGORIES: RoomCategory[] = [
  {
    id: "bedroom",
    name: "Bedroom",
    imageUrl:
      "https://images.unsplash.com/photo-1618221118493-9cfa1a1c00da?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    furniture: [
      {
        id: "chair-1",
        name: "Office Chair",
        type: "chair",
        dimension: { width: 0.6, height: 1.2, depth: 0.6 },
        color: "#8B4513",
        categoryId: "bedroom",
        modelPath: "",
      },
      {
        id: "table-1",
        name: "Dining Table",
        type: "table",
        dimension: { width: 2, height: 0.8, depth: 1 },
        color: "#654321",
        categoryId: "bedroom",
        modelPath: "",
      },
      {
        id: "sofa-1",
        name: "Modern Sofa",
        type: "sofa",
        dimension: { width: 2.5, height: 0.8, depth: 1 },
        color: "#696969",
        categoryId: "bedroom",
        modelPath: "",
      },
      {
        id: "desk-1",
        name: "Work Desk",
        type: "desk",
        dimension: { width: 1.5, height: 0.75, depth: 0.8 },
        color: "#8B4513",
        categoryId: "bedroom",
        modelPath: "",
      },
      {
        id: "bed-1",
        name: "Queen Bed",
        type: "bed",
        dimension: { width: 2, height: 0.6, depth: 1.6 },
        color: "#DCDCDC",
        categoryId: "bedroom",
        modelPath: "",
      },
      {
        id: "cabinet-1",
        name: "Storage Cabinet",
        type: "cabinet",
        dimension: { width: 1, height: 2, depth: 0.5 },
        color: "#8B4513",
        categoryId: "bedroom",
        modelPath: "",
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
        id: "cabinet-1",
        name: "Storage Cabinet",
        type: "cabinet",
        dimension: { width: 1, height: 2, depth: 0.5 },
        color: "#8B4513",
        categoryId: "livingRoom",
        modelPath: "",
      },
    ],
  },
];
