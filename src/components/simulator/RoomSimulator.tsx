import { useRef } from "react";
import { Mesh } from "three";

const RoomSimulator = () => {
  const floorRef = useRef<Mesh>(null);
  const wallRef = useRef<Mesh>(null);

  return (
    <group>
      {/* Floor */}
      <mesh ref={floorRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshLambertMaterial color="#f5f5f5" />
      </mesh>

      {/* Back Wall */}
      <mesh position={[0, 2.5, -5]}>
        <planeGeometry args={[10, 5]} />
        <meshLambertMaterial color="#ffffff" />
      </mesh>

      {/* Left Wall */}
      <mesh position={[-5, 2.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[10, 5]} />
        <meshLambertMaterial color="#ffffff" />
      </mesh>

      {/* Right Wall */}
      <mesh position={[5, 2.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[10, 5]} />
        <meshLambertMaterial color="#ffffff" />
      </mesh>
    </group>
  );
};

export default RoomSimulator;
