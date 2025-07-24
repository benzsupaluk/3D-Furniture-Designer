import { useEffect, useRef, useState } from "react";
import { Group, Vector3 } from "three";
import { ThreeEvent } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { PlacedFurniture } from "@/types/interactive";

interface FurnitureModelProps {
  furniture: PlacedFurniture;
  onSelect: (fur: PlacedFurniture) => void;
  onMove: (fur: PlacedFurniture, position: [number, number, number]) => void;
  onDelete: (fur: PlacedFurniture) => void;
  isSelected?: boolean;
}

export const FurnitureModel = ({
  furniture,
  onSelect,
  onMove,
  onDelete,
  isSelected,
}: FurnitureModelProps) => {
  const meshRef = useRef<Group>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Vector3>(new Vector3());

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    onSelect(furniture);
    setIsDragging(true);

    if (meshRef.current) {
      const offset = new Vector3();
      offset.copy(event.point).sub(meshRef.current.position);
      setDragOffset(offset);
    }
  };

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (isDragging && isSelected && meshRef.current) {
      const newPosition = new Vector3();
      newPosition.copy(event.point).sub(dragOffset);

      // keep furniture on the floor (y = half height)
      newPosition.y = 0;

      // constrain to room bounds
      newPosition.x = Math.max(-4.5, Math.min(4.5, newPosition.x));
      newPosition.z = Math.max(-4.5, Math.min(4.5, newPosition.z));

      onMove(furniture, [newPosition.x, newPosition.y, newPosition.z]);
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    if (meshRef.current) {
      const pos = meshRef.current.position;
      onMove(furniture, [pos.x, pos.y, pos.z]);
    }
  };

  const handleDelete = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    if (isSelected) {
      onDelete(furniture);
    }
  };

  const renderGeometry = () => {
    const { width, height, depth } = furniture.dimension;

    switch (furniture.type) {
      case "chair":
        return (
          <group>
            {/* Seat */}
            <mesh position={[0, height * 0.4, 0]}>
              <boxGeometry args={[width, height * 0.1, depth]} />
              <meshLambertMaterial color={furniture.color} />
            </mesh>
            {/* Backrest */}
            <mesh position={[0, height * 0.7, -depth * 0.35]}>
              <boxGeometry args={[width, height * 0.6, depth * 0.1]} />
              <meshLambertMaterial color={furniture.color} />
            </mesh>
            {/* Legs */}
            <mesh position={[-width / 3, height * 0.2, -depth / 3]}>
              <boxGeometry args={[0.05, height * 0.4, 0.05]} />
              <meshLambertMaterial color={furniture.color} />
            </mesh>
            <mesh position={[width / 3, height * 0.2, -depth / 3]}>
              <boxGeometry args={[0.05, height * 0.4, 0.05]} />
              <meshLambertMaterial color={furniture.color} />
            </mesh>
            <mesh position={[-width / 3, height * 0.2, depth / 3]}>
              <boxGeometry args={[0.05, height * 0.4, 0.05]} />
              <meshLambertMaterial color={furniture.color} />
            </mesh>
            <mesh position={[width / 3, height * 0.2, depth / 3]}>
              <boxGeometry args={[0.05, height * 0.4, 0.05]} />
              <meshLambertMaterial color={furniture.color} />
            </mesh>
          </group>
        );

      case "table":
        return (
          <group>
            {/* Top */}
            <mesh position={[0, height * 0.9, 0]}>
              <boxGeometry args={[width, height * 0.1, depth]} />
              <meshLambertMaterial color={furniture.color} />
            </mesh>
            {/* Legs */}
            <mesh position={[-width * 0.4, height * 0.4, -depth * 0.4]}>
              <boxGeometry args={[0.08, height * 0.8, 0.08]} />
              <meshLambertMaterial color={furniture.color} />
            </mesh>
            <mesh position={[width * 0.4, height * 0.4, -depth * 0.4]}>
              <boxGeometry args={[0.08, height * 0.8, 0.08]} />
              <meshLambertMaterial color={furniture.color} />
            </mesh>
            <mesh position={[-width * 0.4, height * 0.4, depth * 0.4]}>
              <boxGeometry args={[0.08, height * 0.8, 0.08]} />
              <meshLambertMaterial color={furniture.color} />
            </mesh>
            <mesh position={[width * 0.4, height * 0.4, depth * 0.4]}>
              <boxGeometry args={[0.08, height * 0.8, 0.08]} />
              <meshLambertMaterial color={furniture.color} />
            </mesh>
          </group>
        );

      case "sofa":
        return (
          <group>
            {/* Main body */}
            <mesh position={[0, height * 0.5, 0]}>
              <boxGeometry args={[width, height * 0.6, depth]} />
              <meshLambertMaterial color={furniture.color} />
            </mesh>
            {/* Backrest */}
            <mesh position={[0, height * 0.8, -depth * 0.3]}>
              <boxGeometry args={[width, height * 0.6, depth * 0.4]} />
              <meshLambertMaterial color={furniture.color} />
            </mesh>
            {/* Arms */}
            <mesh position={[-width * 0.4, height * 0.6, 0]}>
              <boxGeometry args={[width * 0.2, height * 0.4, depth * 0.8]} />
              <meshLambertMaterial color={furniture.color} />
            </mesh>
            <mesh position={[width * 0.4, height * 0.6, 0]}>
              <boxGeometry args={[width * 0.2, height * 0.4, depth * 0.8]} />
              <meshLambertMaterial color={furniture.color} />
            </mesh>
          </group>
        );

      default:
        return (
          <mesh>
            <boxGeometry args={[width, height, depth]} />
            <meshLambertMaterial
              color={furniture.color}
              transparent
              opacity={isSelected ? 0.8 : 1}
            />
          </mesh>
        );
    }
  };

  return (
    <group
      ref={meshRef}
      position={furniture.position}
      rotation={furniture.rotation}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {renderGeometry()}

      {/* selection outline */}
      {isSelected && (
        <mesh>
          <boxGeometry
            args={[
              furniture.dimension.width + 0.1,
              (furniture.dimension.height + 0.1) / 2,
              furniture.dimension.depth + 0.1,
            ]}
          />
          <meshBasicMaterial
            color="#404040"
            wireframe
            transparent
            opacity={0.5}
          />
          <pointLight
            color="#ffffff"
            intensity={1}
            distance={2}
            position={[0, furniture.dimension.height / 2 + 0.2, 0]}
          />
        </mesh>
      )}
    </group>
  );
};
