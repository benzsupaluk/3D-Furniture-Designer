# 3D Space Base Interior Designer

A modern, interactive 3D space base interior design tool built with Next.js and `react-three-fiber`. Design, customize, and visualize space base interiors with realistic 3D furniture models in real-time. Create stunning space environments with advanced controls and AI-powered image generation.

## Live Demo

**Try it now:** [https://3d-furniture-designer.vercel.app](https://3d-furniture-designer.vercel.app)

## Features

- **3D Space Base Interior Tool**
  - Interactive room layout with floor and walls
  - Built with `@react-three/fiber`, `@react-three/drei`, and `three`

- **Furniture Selection & Placement**
  - Load and display multiple 3D furniture models (GLTF and primitives)
  - Add furniture dynamically from a selectable list
  - Label each item with its name using `Text`

- **Furniture Editing Tools**
  - Drag, rotate, and scale furniture items in real-time
  - Prevent overlapping with **collision detection**

- **Camera Controls**
  - Top View, Side View, Front View, and Orbit View preset buttons
  - Optional free orbit navigation using `OrbitControls`

- **Screenshot & AI Styling**
  - Capture current scene view
  - Send screenshot to **Spacely AI** for styled image generation
  - Preview styled result in-app


## Tech Stack

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
- **Zustand** - State management
- **Lucide React** - Icon library
- **Motion** - Animation library

### Development Tools
- **Turbopack** - Fast bundler for development

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm

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
   NEXT_PUBLIC_API_URL=your_spacely_ai_api_url_here
   NEXT_PUBLIC_API_KEY=your_spacely_ai_api_key_here

   NEXT_PUBLIC_ALLOWED_DOMAIN=your_current_domain

   NEXT_PUBLIC_R2_ENDPOINT=cloudflare_r2_endpoint
   NEXT_PUBLIC_R2_PUBLIC_URL=cloudflare_r2_public_url
   NEXT_PUBLIC_R2_BUCKET_NAME=cloudflare_r2_bucket_name
   NEXT_PUBLIC_R2_ACCESS_KEY=cloudflare_r2_access_key
   NEXT_PUBLIC_R2_SECRET_KEY=cloudflare_r2_secret_key
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
3D-Furniture-Designer/
├── public/
│   ├── models/          # 3D furniture models (GLTF)
│   │   ├── blackSofa/   # Furniture model directories including preview.webp, model.gltf, etc.
│   │   ├── chineseSofa/
│   │   ├── coffeeTable/
│   │   └── ...
│   ├── images/
│   │   └── textures/    # Space base textures
│   └── ...
├── src/
│   ├── app/             # Next.js App Router
│   ├── components/
│   │   ├── 3d/         # Three.js components
│   │   ├── simulator/  # Space simulation
│   │   ├── furnitureSelection/ # Furniture selection UI
│   │   └── ui/         # Reusable UI components
│   ├── stores/         # Zustand state management
│   ├── types/          # TypeScript type definitions
│   ├── hooks/          # Custom React hooks
│   └── utils/          # Utility functions
└── ...
```

## Usage

### Basic Navigation in Canvas Scene
- **Mouse/Touch**: Rotate camera view
- **Pinch**: Zoom in/out
- **Drag**: Pan around the space

### Camera Controls
- **Top View**: Sets camera to look directly from above
- **Front View**: Sets camera to look directly from the front
- **Side View**: Sets camera to a side-on angle
- **Free Orbit**: Go back to free navigation mode

### Adding and Manipulating Furniture
1. Select a furniture category from the sidebar
2. Click on any furniture item to add it to the space
3. The furniture will be automatically placed with *collision detection*
4. Use the 3D controls to move, rotate, and scale furniture
5. Each furniture item displays a text label with its name

### Screenshot and AI Generation
1. Arrange your furniture as desired
2. Click the "Generate from Scene" button to capture the current view
3. Select space type and style on "Confirmation Generate from Scene" popup
4. Click "Start Generation"
5. The image is sent to Spacely AI API for processing
6. View the generated styled version in the preview panel

## Deployment

This project is deployed on Vercel for optimal performance and scalability.

### API Integration
The application integrates with Spacely AI API for image generation:
- Capture room space base with current camera angle
- Captured image is sent to the API for styled version generation
- Results are displayed in a preview panel

## Internal API

### Upload Screenshot to Cloudflare R2

The application uses a custom API route (`/api/upload`) to handle screenshot uploads before forwarding them to the Spacely AI API.

#### How It Works

1. A screenshot is captured from the 3D canvas and encoded as a base64 image.
2. This base64 string is sent in a `POST` request to the `/api/upload` endpoint.
3. The server decodes the image and uploads it to a Cloudflare R2 bucket.
4. Once uploaded, the server responds with the **public image URL**.
5. This image URL is then passed to the Spacely AI API to generate styled room visuals.

>⚠️ Important: This API route includes a domain origin check in both development and production mode. Only requests from the specified app domain are allowed.

- On production, requests are only accepted from my domain `https://3d-furniture-designer.vercel.app`
  - When running pnpm build or testing locally, make sure to set the environment variable:

   ```
   NEXT_PUBLIC_ALLOWED_DOMAIN=http://localhost:3000
   ```
If not set correctly, requests from your local app will receive a 403 Forbidden response.

