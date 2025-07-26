import { useRef, useState } from "react";
import { Mesh } from "three";
import * as THREE from "three";
import { useThree, useFrame, useLoader } from "@react-three/fiber";

const RoomSimulator = () => {
  const floorRef = useRef<Mesh>(null);
  const wallRef = useRef<Mesh>(null);
  const leftWallRef = useRef<Mesh>(null);
  const rightWallRef = useRef<Mesh>(null);

  const { camera } = useThree();

  useFrame(() => {
    if (leftWallRef.current) {
      const material = leftWallRef.current
        .material as THREE.MeshStandardMaterial;
      material.opacity = camera.position.x >= 0 ? 1 : 0;
      material.transparent = true;
    }
    if (rightWallRef.current) {
      const material = rightWallRef.current
        .material as THREE.MeshStandardMaterial;
      material.opacity = camera.position.x < 5 ? 1 : 0;
      material.transparent = true;
    }
  });

  const woodTexture = useLoader(
    THREE.TextureLoader,
    "/images/textures/wood.webp"
  );

  const wallpaperTexture = useLoader(
    THREE.TextureLoader,
    "/images/textures/wallpaper.webp"
  );

  return (
    <group>
      {/* Floor */}
      <mesh
        receiveShadow
        position={[0, 0, 0]} // half thickness above y=0
      >
        <boxGeometry args={[10, 0.2, 10]} />
        <meshStandardMaterial color="#bfa074" map={woodTexture} />
      </mesh>

      {/* Back Wall */}
      <mesh
        receiveShadow
        position={[0, 2.4, -5]} // y = half of 5, z = -half of room size
      >
        <boxGeometry args={[10, 5, 0.2]} />
        <meshStandardMaterial color="#fff" map={wallpaperTexture} />
      </mesh>

      {/* Left Wall */}
      <mesh
        ref={leftWallRef}
        receiveShadow
        position={[-5.1, 2.4, 0]} // x = -half of room size, y = half of 5
      >
        <boxGeometry args={[0.2, 5, 10.2]} />
        <meshStandardMaterial color="#fff" map={wallpaperTexture} />
      </mesh>

      {/* Right Wall */}
      <mesh
        ref={rightWallRef}
        receiveShadow
        position={[5.1, 2.4, 0]} // x = +half of room size
      >
        <boxGeometry args={[0.2, 5, 10.2]} />
        <meshStandardMaterial color="#fff" map={wallpaperTexture} />
      </mesh>
    </group>
  );
};

export default RoomSimulator;
