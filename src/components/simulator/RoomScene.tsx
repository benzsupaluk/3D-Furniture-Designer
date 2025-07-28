"use client";

import dynamic from "next/dynamic";
import { Suspense, useRef, useEffect, useImperativeHandle } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  PerspectiveCamera,
} from "@react-three/drei";

import { PlacedFurniture } from "@/types/interactive";
import { Coordinate } from "@/types/common";

import { PerspectiveCamera as ThreeCamera, WebGLRenderer } from "three";
import { useSimulatorStore } from "@/stores/useSimulatorStore";

import RoomSimulator from "@/components/simulator/RoomSimulator";
import { isFurnitureValidPosition } from "@/utils/validator";

const FurnitureModel = dynamic(() => import("@/components/3d/FurnitureModel"), {
  ssr: false,
  loading: () => <></>,
});

const RoomScene = () => {
  const cameraRef = useRef<ThreeCamera>(null);
  const controlsRef = useRef<any>(null);
  const glRef = useRef<WebGLRenderer | null>(null);

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

  const handleScalePlacedFurniture = (
    furniture: PlacedFurniture,
    newPosition: Coordinate,
    newScale: Coordinate
  ) => {
    // const otherFurniture = scene.furniture.filter((f) => f.id !== furniture.id);
    // // Use the new scale in the collision check
    // const furnitureWithNewScale = { ...furniture, scale: newScale };
    // if (isFurnitureValidPosition(newPosition, furnitureWithNewScale, otherFurniture)) {
    //   updatePlacedFurnitureById(furniture.id, { scale: newScale, position: newPosition });
    // }
    updatePlacedFurnitureById(furniture.id, {
      scale: newScale,
      position: newPosition,
    });
  };

  useEffect(() => {
    if (!cameraRef.current || !controlsRef.current) return;

    const camera = cameraRef.current;
    const controls = controlsRef.current;

    switch (cameraView) {
      case "top":
        camera.position.set(0, 15, 0);
        camera.lookAt(0, 0, 0);
        // controls.enabled = false;
        break;
      case "side":
        camera.position.set(15, 5, 0);
        camera.lookAt(0, 0, 0);
        // controls.enabled = false;
        break;
      case "front":
        camera.position.set(0, 5, 15);
        camera.lookAt(20, 0, 5);
        break;
      case "orbit":
        camera.position.set(8, 8, 8);
        camera.lookAt(0, 0, 0);
        // controls.enabled = true;
        break;
    }
    controls.update();
  }, [cameraView]);

  const isEnableOrbitControls = !selectedFurnitureId;

  return (
    <Canvas
      onCreated={({ gl }) => {
        glRef.current = gl;
      }}
      gl={{ preserveDrawingBuffer: true, toneMappingExposure: 1.0 }}
      shadows
      onPointerMissed={handlePointerMissed}
    >
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        fov={60}
        near={0.1}
        far={500}
        position={[3, 8, 11]}
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
      <ambientLight intensity={4} color="#ffffff" />
      <directionalLight
        position={[2, 5, 5]}
        intensity={3}
        color="#fff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-5}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <pointLight
        position={[-3, 8, 3]}
        intensity={0.1}
        color="#ffffff"
        distance={20}
        decay={2}
      />
      <Suspense fallback={null}>
        <RoomSimulator />
      </Suspense>
      {scene.furniture.map((furniture) => {
        return (
          <Suspense key={furniture.id}>
            <FurnitureModel
              key={furniture.id}
              furniture={furniture}
              onSelect={handleSelectPlacedFurniture}
              onMove={handleMovePlacedFurniture}
              onScale={handleScalePlacedFurniture}
              isSelected={selectedFurnitureId === furniture.id}
            />
          </Suspense>
        );
      })}
    </Canvas>
  );
};

export default RoomScene;
