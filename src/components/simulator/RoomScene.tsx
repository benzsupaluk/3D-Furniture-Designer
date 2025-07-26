"use client";

import { Suspense, useRef } from "react";
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

const RoomScene = () => {
  const cameraRef = useRef<ThreeCamera>(null);
  const controlsRef = useRef<any>(null);

  const {
    cameraView,
    scene,
    updatePlacedFurnitureById,
    selectedFurnitureId,
    setSelectedFurnitureId,
  } = useSimulatorStore();

  const handleSelectPlacedFurniture = (furniture: PlacedFurniture) => {
    setSelectedFurnitureId(furniture.id);
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

  const handlePointerMissed = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target?.closest?.(".object-action")) {
      setSelectedFurnitureId("");
    }
  };

  const isEnableOrbitControls = !selectedFurnitureId;

  return (
    <Canvas onPointerMissed={handlePointerMissed}>
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        fov={75}
        near={0.1}
        far={1000}
        position={[5, 8, 12]}
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

      {/* Bulb light above the room */}
      {/* <pointLight
        position={[0, 5, 0]}
        intensity={2}
        color="#ffffff"
        distance={15}
        decay={2}
        castShadow
      /> */}

      {/* Light */}
      <ambientLight intensity={1.2} color="#ffffff" />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.2}
        color="#fff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <pointLight position={[-10, 10, -10]} intensity={0.5} color="#ffffff" />
      <Suspense fallback={null}>
        <RoomSimulator />
      </Suspense>

      {scene.furniture.map((furniture) => {
        return (
          <FurnitureModel
            key={furniture.id}
            furniture={furniture}
            onSelect={handleSelectPlacedFurniture}
            onMove={handleMovePlacedFurniture}
            isSelected={selectedFurnitureId === furniture.id}
          />
        );
      })}
    </Canvas>
  );
};

export default RoomScene;
