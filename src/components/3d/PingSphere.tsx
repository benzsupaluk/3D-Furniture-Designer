import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export const PingSphere = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime() % 1;
    const scale = 1 + elapsed;
    const opacity = 1 - elapsed;

    if (meshRef.current) {
      meshRef.current.scale.set(scale, scale, scale);
      const material = meshRef.current.material as THREE.MeshStandardMaterial;
      material.opacity = opacity;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.2, 32, 32]} />
      <meshBasicMaterial color="#3b82f6" transparent opacity={1} />
    </mesh>
  );
};
