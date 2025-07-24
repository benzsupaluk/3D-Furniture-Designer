"use client";

import { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  PerspectiveCamera,
} from "@react-three/drei";
import * as THREE from "three";
import { PlacedFurniture } from "@/types/interactive";
import { Coordinate } from "@/types/common";

import { PerspectiveCamera as ThreeCamera } from "three";
import { useSimulatorStore } from "@/stores/useSimulatorStore";

import RoomSimulator from "@/components/simulator/RoomSimulator";
import { FurnitureModel } from "../3d/FunitureModel";
import { isFurnitureValidPosition } from "@/utils/validator";

const Scene = () => {
  const cameraRef = useRef<ThreeCamera>(null);
  const controlsRef = useRef<any>(null);

  const {
    cameraView,
    scene,
    updatePlacedFurnitureById,
    selectedFurniture,
    setSelectedFurniture,
  } = useSimulatorStore();

  const handleSelectPlacedFurniture = (furniture: PlacedFurniture) => {
    setSelectedFurniture(furniture);
  };

  const handleMovePlacedFurniture = (
    furniture: PlacedFurniture,
    newPosition: Coordinate
  ) => {
    const otherFurniture = scene.furniture.filter((f) => f.id !== furniture.id);
    if (isFurnitureValidPosition(newPosition, furniture, otherFurniture)) {
      updatePlacedFurnitureById(furniture.id, { position: newPosition });
    }
  };

  const handleDeletedPlacedFurniture = () => {
    setSelectedFurniture(null);
  };

  const isEnableOrbitControls = !selectedFurniture;

  return (
    <Canvas onPointerMissed={() => setSelectedFurniture(null)}>
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        fov={75}
        near={0.1}
        far={1000}
        position={[8, 8, 8]}
      />
      <OrbitControls
        ref={controlsRef}
        enablePan={isEnableOrbitControls}
        enableZoom={isEnableOrbitControls}
        enableRotate={isEnableOrbitControls}
        enableDamping={isEnableOrbitControls}
        dampingFactor={0.05}
        maxPolarAngle={Math.PI / 2}
      />

      {/* Light */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <pointLight position={[-10, 10, -10]} intensity={0.5} />

      <RoomSimulator />

      {scene.furniture.map((furniture) => {
        return (
          <FurnitureModel
            key={furniture.id}
            furniture={furniture}
            onSelect={handleSelectPlacedFurniture}
            onMove={handleMovePlacedFurniture}
            onDelete={handleDeletedPlacedFurniture}
            isSelected={selectedFurniture?.id === furniture.id}
          />
        );
      })}
    </Canvas>
  );
};

export default Scene;
