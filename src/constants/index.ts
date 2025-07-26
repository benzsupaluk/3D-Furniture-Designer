import { RoomCategory } from "@/types/room";

export const ROOM_CATEGORIES: RoomCategory[] = [
  {
    id: "bedroom",
    name: "Bedroom",
    imageUrl:
      "https://images.unsplash.com/photo-1618221118493-9cfa1a1c00da?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    furniture: [
      {
        id: "cabinet-1",
        name: "Gallinera Table",
        description:
          "Technically a cabinet, secretly a portal to a world of lost socks and mystery snacks.",
        type: "cabinet",
        categoryId: "bedroom",
        modelPath: "/models/gothicCabinet/model.gltf",
        previewImage: "/models/gothicCabinet/preview.webp",
      },
      {
        id: "bed-1",
        name: "Gothic Bed",
        description:
          "Sleep like royalty—or a vampire. Either way, you’re not getting up early.",
        type: "bed",
        categoryId: "bedroom",
        modelPath: "/models/gothicBed/model.gltf",
        previewImage: "/models/gothicBed/preview.webp",
      },

      {
        id: "chair-1",
        name: "Chairy Potter",
        description: "The chosen seat for wizarding comfort.",
        type: "chair",
        categoryId: "bedroom",
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
        id: "table-1",
        name: "Gallinera Table",
        description:
          "A rustic charm with room for gossip, snacks, or spontaneous dance moves.",
        type: "table",
        categoryId: "livingRoom",
        modelPath: "/models/gallineraTable/model.gltf",
        previewImage: "/models/gallineraTable/preview.webp",
      },
      {
        id: "chair-1",
        name: "Ottoman",
        description:
          "Not quite a chair, not quite a table—just vibes and footrest royalty.",
        type: "chair",
        categoryId: "livingRoom",
        modelPath: "/models/ottoman/model.gltf",
        previewImage: "/models/ottoman/preview.webp",
      },
      {
        id: "table-2",
        name: "Round Wooden Table",
        description:
          "Circle of life? Nah—circle of snacks, coffee, and deep conversations.",
        type: "table",
        categoryId: "livingRoom",
        modelPath: "/models/roundWoodenTable/model.gltf",
        previewImage: "/models/roundWoodenTable/preview.webp",
      },
      {
        id: "table-3",
        name: "Side Table",
        description: "The loyal sidekick your coffee never knew it needed.",
        type: "table",
        categoryId: "livingRoom",
        modelPath: "/models/sideTable/model.gltf",
        previewImage: "/models/sideTable/preview.webp",
      },
      {
        id: "table-4",
        name: "Table Swift",
        description: "Write songs, sip coffee—this table does it all.",
        type: "table",
        categoryId: "livingRoom",
      },
      {
        id: "sofa-1",
        name: "Sofapalooza",
        description: "Three cushions. Infinite naps.",
        type: "sofa",
        categoryId: "livingRoom",
      },
      {
        id: "sofa-2",
        name: "Couchzilla",
        description: "Crushes your back pain, not your dreams.",
        type: "sofa",
        categoryId: "livingRoom",
      },
      {
        id: "chair-2",
        name: "Sir Sits-a-Lot",
        description: "A noble seat for royal cheeks.",
        type: "chair",
        categoryId: "livingRoom",
      },
    ],
  },
];
