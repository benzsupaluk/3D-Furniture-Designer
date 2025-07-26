# 3D Room Simulator

A modern, interactive 3D room design and visualization tool built with Next.js and `react-three-fiber`. Create, customize, and visualize room layouts with realistic 3D furniture models in real-time.

## Features

- **Interactive 3D Room Environment**: Navigate and explore a fully rendered 3D room with realistic lighting and textures
- **Furniture Library**: Extensive collection of 3D furniture models including beds, tables, cabinets, and more
- **Real-time Placement**: Drag and drop furniture into your room with collision detection
- **Customizable Room**: Adjust wall textures, floor materials, and room dimensions
- **Image Generation**: Capture and generate high-quality renders of your room designs
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Modern UI**: Clean, intuitive interface with smooth animations and transitions

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework

### 3D Graphics
- **Three.js** - 3D graphics library
- **React Three Fiber** - React renderer for Three.js
- **React Three Drei** - Useful helpers for React Three Fiber

### State Management & UI
- **Zustand** - Lightweight state management
- **Lucide React** - Icon library
- **Motion** - Animation library

### Development Tools
- **Turbopack** - Fast bundler for development

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/3d-room-simulator.git
   cd 3d-room-simulator
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   NEXT_PUBLIC_API_URL=your_api_url_here
   NEXT_PUBLIC_API_KEY=your_api_key_here
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
3d-room-simulator/
├── public/
│   ├── models/          # 3D furniture models (GLTF/GLB)
│   ├── images/
│   │   └── textures/    # Room textures
│   └── ...
├── src/
│   ├── app/             # Next.js App Router
│   ├── components/
│   │   ├── 3d/         # Three.js components
│   │   ├── simulator/  # Room simulation
│   │   └── ui/         # Reusable UI components
│   ├── stores/         # Zustand state management
│   ├── types/          # TypeScript type definitions
│   ├── hooks/          # Custom React hooks
│   └── utils/          # Utility functions
└── ...
```

## Usage

### Basic Navigation
- **Mouse/Touch**: Rotate camera view
- **Scroll**: Zoom in/out
- **Drag**: Pan around the room

### Adding Furniture
1. Select a furniture category from the sidebar
2. Click on any furniture item to add it to the room
3. The furniture will be automatically placed in a valid position
4. Use the 3D controls to move, rotate, and scale furniture

### Generating Images
1. Arrange your furniture as desired
2. Click the "Generate from Scene" button
3. Wait for the styled version to be generated
4. Download or share your room design

## Available Scripts

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## Customization

### Adding New Furniture Models
1. Place your GLTF/GLB files in `public/models/`
2. Add furniture data to the store configuration
3. Include preview images in the model directory

### Modifying Room Textures
- Replace texture files in `public/images/textures/`
- Update texture paths in the room components
