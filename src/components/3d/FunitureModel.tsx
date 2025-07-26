import { useEffect, useRef, useState, useCallback } from "react";
import { Group, Vector2, Vector3, Plane } from "three";
import { ThreeEvent, useThree } from "@react-three/fiber";
import { Text, Html } from "@react-three/drei";
import { PlacedFurniture } from "@/types/interactive";
import { useDrag, useGesture } from "@use-gesture/react";
import { Coordinate } from "@/types/common";
import { isFurnitureValidPosition } from "@/utils/validator";

import { useSimulatorStore } from "@/stores/useSimulatorStore";
import { Button } from "@/components/ui/button";

import { RotateCcwIcon, RotateCwIcon } from "lucide-react";

interface FurnitureModelProps {
  furniture: PlacedFurniture;
  onSelect: (fur: PlacedFurniture) => void;
  onMove: (fur: PlacedFurniture, position: Coordinate) => void;
  isSelected?: boolean;
}

export const FurnitureModel = ({
  furniture,
  onSelect,
  onMove,
  isSelected,
}: FurnitureModelProps) => {
  const meshRef = useRef<Group>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isRotationMode, setRotationMode] = useState<boolean>(false);
  const [isRotating, setIsRotating] = useState<boolean>(false);

  const tempPosition = useRef<Coordinate>(furniture.position);

  // Stores the 3D point on the floor where the drag initially started
  const initialDragPoint = useRef<Vector3 | null>(null);
  // Stores the furniture's 3D position when the drag initially started
  const initialFurniturePosition = useRef<Vector3 | null>(null);

  const { camera, size, raycaster, invalidate } = useThree();
  const { scene } = useSimulatorStore();

  // Define a floor plane at y=0. This is used for raycasting to determine
  // where the mouse pointer is on the floor in 3D space.
  const floorPlane = useRef(new Plane(new Vector3(0, 1, 0), 0)).current;
  // A temporary Vector3 to store the intersection result from raycasting
  const planeIntersectPoint = useRef(new Vector3()).current;

  const otherFurniture = scene.furniture.filter((f) => f.id !== furniture.id);
  const radius =
    Math.max(furniture.dimension.width, furniture.dimension.depth) / 2 + 0.2;

  // Exit rotation mode when clicking outside or pressing Escape
  useEffect(() => {
    if (!isRotationMode) return;

    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is outside the rotation controls
      const target = event.target as HTMLElement;
      if (!target?.closest?.(".rotation-controls")) {
        setRotationMode(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setRotationMode(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isRotationMode]);

  const get3DIntersection = useCallback(
    (screenX: number, screenY: number): Vector3 | null => {
      // Normalize mouse coordinates to a range of -1 to +1 for raycasting
      const normalizedMouseX = ((screenX - size.left) / size.width) * 2 - 1;
      const normalizedMouseY = -((screenY - size.top) / size.height) * 2 + 1;

      const mousePosition2D = new Vector2(normalizedMouseX, normalizedMouseY);
      // Set the raycaster's origin and direction based on the camera and mouse position
      raycaster.setFromCamera(mousePosition2D, camera);

      // Intersect the ray with the defined floor plane
      const intersection = raycaster.ray.intersectPlane(
        floorPlane,
        planeIntersectPoint
      );
      return intersection ? intersection.clone() : null;
    },
    [
      camera,
      raycaster,
      size.left,
      size.width,
      size.top,
      size.height,
      floorPlane,
    ]
  );

  const bind = useGesture(
    {
      onDragStart: ({ event, xy: [dragX, dragY] }) => {
        event.stopPropagation();

        if (isRotationMode) {
          setIsRotating(true);
          return;
        }

        setIsDragging(true);

        const intersectPoint = get3DIntersection(dragX, dragY);
        if (intersectPoint) {
          initialDragPoint.current = intersectPoint;
          initialFurniturePosition.current =
            meshRef.current?.position.clone() || null;
        }
        invalidate();
      },
      // Triggered continuously while a drag gesture is active
      onDrag: ({ event, xy: [dragX, dragY], intentional }) => {
        // Only proceed if the gesture is intentional and all necessary refs are set
        if (
          !intentional ||
          !meshRef.current ||
          !initialDragPoint.current ||
          !initialFurniturePosition.current ||
          !isSelected
        ) {
          return;
        }
        event.stopPropagation();

        // Get the current 3D intersection point on the floor
        const currentIntersectPoint = get3DIntersection(dragX, dragY);

        if (currentIntersectPoint) {
          // Calculate the displacement vector from the initial drag point to the current point
          const displacement = currentIntersectPoint
            .clone()
            .sub(initialDragPoint.current);

          const halfWidth = furniture.dimension.width / 2;
          const halfDepth = furniture.dimension.depth / 2;
          // Apply this displacement to the furniture's initial position to get the new position
          const newPosition = initialFurniturePosition.current
            .clone()
            .add(displacement);

          newPosition.y = 0;

          newPosition.x = Math.max(
            -5 + halfWidth,
            Math.min(5 - halfWidth, newPosition.x)
          );
          newPosition.z = Math.max(
            -5 + halfDepth,
            Math.min(5 - halfDepth, newPosition.z)
          );

          const currentPosition: Coordinate = [
            newPosition.x,
            newPosition.y,
            newPosition.z,
          ];

          // Check collision
          if (
            isFurnitureValidPosition(currentPosition, furniture, otherFurniture)
          ) {
            tempPosition.current = currentPosition;
            meshRef.current.position.copy(newPosition);
          }
        }
        invalidate();
      },
      onDragEnd: ({ event }) => {
        event.stopPropagation(); // Stop propagation

        if (isRotationMode) {
          setIsRotating(false);
          return;
        }

        setIsDragging(false); // Reset dragging state
        initialDragPoint.current = null; // Clear initial drag point
        initialFurniturePosition.current = null; // Clear initial furniture position
        // No need to call onMove again here as onDrag continuously updates the position
        onMove(furniture, tempPosition.current);
        invalidate(); // Request a final re-render
      },
      // Triggered when a click (tap) gesture occurs without a drag
      onClick: ({ event }) => {
        event.stopPropagation();
        if (!isDragging && !isRotating) {
          // Only select if not currently dragging or rotating
          onSelect(furniture);
        }
      },
    },
    {
      drag: {
        filterTaps: true, // Prevents a tap from also being registered as a drag
        threshold: 3, // Minimum distance (in pixels) the pointer must move to initiate a drag
      },
    }
  );

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
      position={tempPosition.current}
      rotation={furniture.rotation}
      {...bind()}
    >
      {renderGeometry()}

      {/* selection outline */}
      {isSelected && (
        <>
          {/* Spotlight above the selected furniture */}
          <spotLight
            position={[0, furniture.dimension.height + 2, 0]}
            angle={0.5}
            penumbra={0.7}
            intensity={1.5}
            distance={6}
            castShadow={false}
            color={"#fffbe6"}
          />
          {/* Glow ring on the floor below the selected furniture */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
            <ringGeometry args={[radius * 0.9, radius * 1.1, 32]} />
            <meshBasicMaterial color="#DC6803" transparent opacity={0.5} />
          </mesh>
          {/* Existing selection outline */}
          <mesh>
            <boxGeometry
              args={[
                furniture.dimension.width + 0.1,
                (furniture.dimension.height + 0.1) / 2,
                furniture.dimension.depth + 0.1,
              ]}
            />
            <meshBasicMaterial color="#000000" wireframe opacity={1} />
          </mesh>
        </>
      )}
    </group>
  );
};
