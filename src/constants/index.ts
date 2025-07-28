import { RoomCategory } from "@/types/room";
import { ThemeConfig } from "@/utils/theme";
import { SpaceStyleItem, SpaceTypeItem } from "@/types/generator";

export const ROOM_CATEGORIES: RoomCategory[] = [
  {
    id: "bedroom",
    name: "Bedroom",
    imageUrl:
      "https://pub-6b5e438ff521432d97743fa951e0db00.r2.dev/bedroom.webp",
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
        id: "cabinet-2",
        name: "Whimsicrate",
        description:
          "Technically a cabinet, secretly a portal to a world of lost socks and mystery snacks.",
        type: "cabinet",
        categoryId: "bedroom",
        modelPath: "/models/paintedWoodenCabinet/model.gltf",
        previewImage: "/models/paintedWoodenCabinet/preview.webp",
      },
      {
        id: "chair-1",
        name: "Brushstroke Butler",
        description: "Holds you up like a masterpiece in motion.",
        type: "chair",
        categoryId: "bedroom",
        modelPath: "/models/paintedWoodenChair/model.gltf",
        previewImage: "/models/paintedWoodenChair/preview.webp",
      },
      {
        id: "chair-2",
        name: "Chairy Potter",
        description: "The chosen seat for wizarding comfort.",
        type: "chair",
        categoryId: "bedroom",
      },
      {
        id: "bed-2",
        name: "Naplord 3000",
        description: "Initiates instant hibernation mode.",
        type: "bed",
        categoryId: "bedroom",
      },
      {
        id: "bed-3",
        name: "Closet Goblin",
        description: "Consumes clutter like a pro.",
        type: "cabinet",
        categoryId: "bedroom",
      },
      {
        id: "chair-3",
        name: "Sleepy Sitter",
        description: "For when you’re too tired to bed.",
        type: "chair",
        categoryId: "bedroom",
      },
      {
        id: "table-1",
        name: "Nightstand Ninja",
        description: "Guards your glasses and bad decisions.",
        type: "table",
        categoryId: "bedroom",
      },
      {
        id: "sofa-1",
        name: "Mini Couchy",
        description: "Because even your socks deserve a couch.",
        type: "sofa",
        categoryId: "bedroom",
      },
    ],
  },
  {
    id: "livingRoom",
    name: "Living Room",
    imageUrl:
      "https://pub-6b5e438ff521432d97743fa951e0db00.r2.dev/living_room.webp",
    furniture: [
      {
        id: "table-2",
        name: "Gallinera Table",
        description:
          "A rustic charm with room for gossip, snacks, or spontaneous dance moves.",
        type: "table",
        categoryId: "livingRoom",
        modelPath: "/models/gallineraTable/model.gltf",
        previewImage: "/models/gallineraTable/preview.webp",
      },
      {
        id: "sofa-2",
        name: "Emperor’s Lounge",
        description: "A Chinese sofa fit for ancient chill sessions.",
        type: "sofa",
        categoryId: "livingRoom",
        modelPath: "/models/chineseSofa/model.gltf",
        previewImage: "/models/chineseSofa/preview.webp",
      },
      {
        id: "sofa-3",
        name: "Shadow Hugger",
        description: "Absorbs light—and your will to get up again.",
        type: "sofa",
        categoryId: "livingRoom",
        modelPath: "/models/blackSofa/model.gltf",
        previewImage: "/models/blackSofa/preview.webp",
      },
      {
        id: "sofa-4",
        name: "Cloud Couch",
        description: "Whiter than your laundry ever will be.",
        type: "sofa",
        categoryId: "livingRoom",
        modelPath: "/models/whiteSofa/model.gltf",
        previewImage: "/models/whiteSofa/preview.webp",
      },
      {
        id: "chair-4",
        name: "Ottoman",
        description:
          "Not quite a chair, not quite a table—just vibes and footrest royalty.",
        type: "chair",
        categoryId: "livingRoom",
        modelPath: "/models/ottoman/model.gltf",
        previewImage: "/models/ottoman/preview.webp",
      },
      {
        id: "table-4",
        name: "Round Wooden Table",
        description:
          "Circle of life? Nah—circle of snacks, coffee, and deep conversations.",
        type: "table",
        categoryId: "livingRoom",
        modelPath: "/models/roundWoodenTable/model.gltf",
        previewImage: "/models/roundWoodenTable/preview.webp",
      },
      {
        id: "table-5",
        name: "Side Table",
        description: "The loyal sidekick your coffee never knew it needed.",
        type: "table",
        categoryId: "livingRoom",
        modelPath: "/models/sideTable/model.gltf",
        previewImage: "/models/sideTable/preview.webp",
      },
      {
        id: "table-6",
        name: "Table Swift",
        description: "Write songs, sip coffee—this table does it all.",
        type: "table",
        categoryId: "livingRoom",
      },
      {
        id: "sofa-5",
        name: "Sofapalooza",
        description: "Three cushions. Infinite naps.",
        type: "sofa",
        categoryId: "livingRoom",
      },
      {
        id: "sofa-6",
        name: "Couchzilla",
        description: "Crushes your back pain, not your dreams.",
        type: "sofa",
        categoryId: "livingRoom",
      },
      {
        id: "chair-5",
        name: "Sir Sits-a-Lot",
        description: "A noble seat for royal cheeks.",
        type: "chair",
        categoryId: "livingRoom",
      },
      {
        id: "table-7",
        name: "Remote Island",
        description: "Home of remotes, snacks, and mystery crumbs.",
        type: "table",
        categoryId: "livingRoom",
      },
      {
        id: "cabinet-3",
        name: "Media Fortress",
        description: "Defends DVDs like it's 2005.",
        type: "cabinet",
        categoryId: "livingRoom",
      },
    ],
  },
  {
    id: "dining",
    name: "Dining",
    imageUrl: "https://pub-6b5e438ff521432d97743fa951e0db00.r2.dev/dining.webp",
    furniture: [
      {
        id: "table-3",
        name: "Espresso Express",
        description: "Where mugs gather for deep conversations.",
        type: "table",
        categoryId: "dining",
        modelPath: "/models/coffeeTable/model.gltf",
        previewImage: "/models/coffeeTable/preview.webp",
      },
      {
        id: "stool-1",
        name: "Painted Perch",
        description: "Short, stylish, and surprisingly supportive.",
        type: "chair",
        categoryId: "dining",
        modelPath: "/models/paintedWoodenStool/model.gltf",
        previewImage: "/models/paintedWoodenStool/preview.webp",
      },
      {
        id: "table-8",
        name: "Oak Overlord",
        description: "This wooden table fears no gravy spill.",
        type: "table",
        categoryId: "dining",
        modelPath: "/models/WoodenTable/model.gltf",
        previewImage: "/models/WoodenTable/preview.webp",
      },
      {
        id: "table-9",
        name: "Feast Field",
        description: "A battlefield for forks and opinions.",
        type: "table",
        categoryId: "dining",
      },
      {
        id: "chair-6",
        name: "Butt Buffet",
        description: "Seats the cheeks of champions.",
        type: "chair",
        categoryId: "dining",
      },
      {
        id: "cabinet-4",
        name: "Plate Vault",
        description: "Guards grandma’s fancy china.",
        type: "cabinet",
        categoryId: "dining",
      },
      {
        id: "sofa-7",
        name: "Banquet Bench",
        description: "When you need room for one more cousin.",
        type: "sofa",
        categoryId: "dining",
      },
      {
        id: "bed-4",
        name: "Food Coma Couch",
        description: "Not a bed, but sure feels like it after dinner.",
        type: "bed",
        categoryId: "dining",
      },
    ],
  },
];

export const THEME_CONFIGS: ThemeConfig[] = [
  {
    name: "dot-light-theme",
    style: {
      backgroundImage: "radial-gradient(circle, #d1d5db 1px, transparent 1px)",
      backgroundSize: "20px 20px",
    },
  },
  {
    name: "dark-light-theme",
    style: {
      backgroundColor: "#1B1C1E",
      backgroundImage: "radial-gradient(circle, #d1d5db 1px, transparent 1px)",
      backgroundSize: "20px 20px",
    },
  },
  {
    name: "light-theme",
    style: {
      backgroundColor: "#f6f7f8",
    },
  },
  {
    name: "dark-theme",
    style: {
      backgroundColor: "#1B1C1E",
    },
  },
];

export const SPACE_TYPES: SpaceTypeItem[] = [
  {
    key: "bedroom",
    name: "Bedroom",
  },
  {
    key: "living_room",
    name: "Living Room",
  },
  {
    key: "dining_room",
    name: "Dining Room",
  },
];

export const SPACE_STYLES: SpaceStyleItem[] = [
  {
    key: "modern",
    name: "Modern",
  },
  {
    key: "minimalist",
    name: "Minimalist",
  },
  {
    key: "industrial_loft",
    name: "Industrial Loft",
  },
];
