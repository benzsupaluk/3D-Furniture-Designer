"use client";

import { useEffect, useRef, useState, useCallback, Suspense } from "react";
import { Group, Vector2, Vector3, Plane, BoxGeometry } from "three";
import { ThreeEvent, useThree } from "@react-three/fiber";
import { Text, Html, useGLTF } from "@react-three/drei";
import { PlacedFurniture } from "@/types/interactive";
import { useDrag, useGesture } from "@use-gesture/react";
import { Coordinate, Dimensions } from "@/types/common";
import { modelPreloader } from "@/hooks/use-model-preloader";

import { isFurnitureValidPosition } from "@/utils/validator";

import { useSimulatorStore } from "@/stores/useSimulatorStore";
import { Button } from "@/components/ui/button";

import { RotateCcwIcon, RotateCwIcon } from "lucide-react";

interface FurnitureModelProps {
  furniture: PlacedFurniture;
  onSelect: (fur: PlacedFurniture) => void;
  onMove: (fur: PlacedFurniture, position: Coordinate) => void;
  onScale?: (
    fur: PlacedFurniture,
    position: Coordinate,
    scale: Coordinate
  ) => void;
  isSelected?: boolean;
}

const FurnitureModel = ({
  furniture,
  onSelect,
  onMove,
  onScale,
  isSelected,
}: FurnitureModelProps) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isScaling, setIsScaling] = useState<boolean>(false);

  const meshRef = useRef<Group>(null);
  const tempPosition = useRef<Coordinate>(furniture.position);

  // Stores the 3D point on the floor where the drag initially started
  const initialDragPoint = useRef<Vector3 | null>(null);
  // Stores the furniture's 3D position when the drag initially started
  const initialFurniturePosition = useRef<Vector3 | null>(null);
  // Store the initial scale
  const initialScale = useRef<Coordinate>([1, 1, 1]);
  // Store scale temporarily
  const tempScale = useRef<Coordinate>(furniture.scale || [1, 1, 1]);

  const cachedModel = furniture?.modelPath
    ? modelPreloader.getCachedModel(furniture?.modelPath)
    : null;

  const { scene: furnitureScene } = cachedModel
    ? cachedModel
    : furniture?.modelPath
    ? useGLTF(furniture.modelPath)
    : { scene: null };
  // Clone the scene to avoid sharing the same 3D object instance between components
  const clonedScene = useRef<Group | null>(null);

  useEffect(() => {
    if (furnitureScene && !clonedScene.current) {
      clonedScene.current = furnitureScene.clone();
    }
  }, [furnitureScene]);
  const { camera, size, raycaster, invalidate } = useThree();
  const { scene } = useSimulatorStore();

  // Define a floor plane at y=0. This is used for raycasting to determine
  // where the mouse pointer is on the floor in 3D space.
  const floorPlane = useRef(new Plane(new Vector3(0, 1, 0), 0)).current;
  // A temporary Vector3 to store the intersection result from raycasting
  const planeIntersectPoint = useRef(new Vector3()).current;

  const otherFurniture = scene.furniture.filter((f) => f.id !== furniture.id);
  const radius =
    Math.max(furniture.dimensions.width, furniture.dimensions.depth) / 2 + 0.2;

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

        if (isScaling) {
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
          !isSelected ||
          isScaling
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

          const halfWidth = furniture.dimensions.width / 2;
          const halfDepth = furniture.dimensions.depth / 2;
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
        if (!isDragging) {
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

  const bindScaleGizmoDrag = useGesture(
    {
      onDragStart: ({ event, xy: [dragX, dragY] }) => {
        event.stopPropagation();
        setIsScaling(true);

        const intersectPoint = get3DIntersection(dragX, dragY);
        if (intersectPoint) {
          initialDragPoint.current = intersectPoint; // Re-use for scaling
          initialScale.current = [...tempScale.current]; // Store current scale
        }
        invalidate();
      },
      onDrag: ({ event, xy: [dragX, dragY] }) => {
        event.stopPropagation();
        if (!initialDragPoint.current || !meshRef.current) return;

        const currentIntersectPoint = get3DIntersection(dragX, dragY);
        if (currentIntersectPoint) {
          // Calculate distance dragged relative to the initial click point
          const dragDelta = currentIntersectPoint
            .clone()
            .sub(initialDragPoint.current);

          // Simple scaling factor based on X-axis movement
          const scaleFactorDelta = dragDelta.x * 0.5; // Adjust sensitivity
          let newScaleValue = initialScale.current[0] + scaleFactorDelta;

          // Clamp scale to reasonable values (min 0.3, max 3.0)
          newScaleValue = Math.max(0.3, Math.min(3.0, newScaleValue));

          const newScale: [number, number, number] = [
            newScaleValue,
            newScaleValue,
            newScaleValue,
          ];

          // Check collision with the new scale (use current position, new scale)
          if (
            isFurnitureValidPosition(
              tempPosition.current,
              { ...furniture, scale: newScale },
              otherFurniture
            )
          ) {
            tempScale.current = newScale; // Update ref
            meshRef.current.scale.set(...newScale); // Apply scale to the mesh
          }
        }
        invalidate();
      },
      onDragEnd: ({ event }) => {
        event.stopPropagation();
        setIsScaling(false);
        initialDragPoint.current = null;
        initialScale.current = [1, 1, 1]; // Reset
        // Only persist the new scale if it is valid
        if (
          isFurnitureValidPosition(
            tempPosition.current,
            { ...furniture, scale: tempScale.current },
            otherFurniture
          )
        ) {
          onScale?.(furniture, tempPosition.current, tempScale.current);
        }
        invalidate();
      },
    },
    {
      drag: {
        filterTaps: true,
        threshold: 1, // Make it sensitive to start dragging
      },
    }
  );

  const getScaledDimensions = useCallback(() => {
    return {
      width: furniture.dimensions.width * tempScale.current[0],
      height: furniture.dimensions.height * tempScale.current[1],
      depth: furniture.dimensions.depth * tempScale.current[2],
    };
  }, [furniture.dimensions, tempScale.current]);

  const scaledDims = getScaledDimensions();

  const renderGeometry = () => {
    const { width, height, depth } = furniture.dimensions;
    const color = furniture.color;

    switch (furniture.type) {
      case "chair":
        return (
          <group>
            {/* Seat */}
            <mesh position={[0, height * 0.4, 0]}>
              <boxGeometry args={[width, height * 0.1, depth]} />
              <meshLambertMaterial color={color} />
            </mesh>
            {/* Backrest */}
            <mesh position={[0, height * 0.7, -depth * 0.35]}>
              <boxGeometry args={[width, height * 0.6, depth * 0.1]} />
              <meshLambertMaterial color={color} />
            </mesh>
            {/* Legs */}
            <mesh position={[-width / 3, height * 0.2, -depth / 3]}>
              <boxGeometry args={[0.05, height * 0.4, 0.05]} />
              <meshLambertMaterial color={color} />
            </mesh>
            <mesh position={[width / 3, height * 0.2, -depth / 3]}>
              <boxGeometry args={[0.05, height * 0.4, 0.05]} />
              <meshLambertMaterial color={color} />
            </mesh>
            <mesh position={[-width / 3, height * 0.2, depth / 3]}>
              <boxGeometry args={[0.05, height * 0.4, 0.05]} />
              <meshLambertMaterial color={color} />
            </mesh>
            <mesh position={[width / 3, height * 0.2, depth / 3]}>
              <boxGeometry args={[0.05, height * 0.4, 0.05]} />
              <meshLambertMaterial color={color} />
            </mesh>
          </group>
        );

      case "table":
        return (
          <group>
            {/* Top */}
            <mesh position={[0, height * 0.9, 0]}>
              <boxGeometry args={[width, height * 0.1, depth]} />
              <meshLambertMaterial color={color} />
            </mesh>
            {/* Legs */}
            <mesh position={[-width * 0.4, height * 0.4, -depth * 0.4]}>
              <boxGeometry args={[0.08, height * 0.8, 0.08]} />
              <meshLambertMaterial color={color} />
            </mesh>
            <mesh position={[width * 0.4, height * 0.4, -depth * 0.4]}>
              <boxGeometry args={[0.08, height * 0.8, 0.08]} />
              <meshLambertMaterial color={color} />
            </mesh>
            <mesh position={[-width * 0.4, height * 0.4, depth * 0.4]}>
              <boxGeometry args={[0.08, height * 0.8, 0.08]} />
              <meshLambertMaterial color={color} />
            </mesh>
            <mesh position={[width * 0.4, height * 0.4, depth * 0.4]}>
              <boxGeometry args={[0.08, height * 0.8, 0.08]} />
              <meshLambertMaterial color={color} />
            </mesh>
          </group>
        );

      case "sofa":
        return (
          <group>
            {/* Main body */}
            <mesh position={[0, height * 0.5, 0]}>
              <boxGeometry args={[width, height * 0.6, depth]} />
              <meshLambertMaterial color={color} />
            </mesh>
            {/* Backrest */}
            <mesh position={[0, height * 0.8, -depth * 0.3]}>
              <boxGeometry args={[width, height * 0.6, depth * 0.4]} />
              <meshLambertMaterial color={color} />
            </mesh>
            {/* Arms */}
            <mesh position={[-width * 0.4, height * 0.6, 0]}>
              <boxGeometry args={[width * 0.2, height * 0.4, depth * 0.8]} />
              <meshLambertMaterial color={color} />
            </mesh>
            <mesh position={[width * 0.4, height * 0.6, 0]}>
              <boxGeometry args={[width * 0.2, height * 0.4, depth * 0.8]} />
              <meshLambertMaterial color={color} />
            </mesh>
          </group>
        );

      default:
        return (
          <mesh>
            <boxGeometry args={[width, height, depth]} />
            <meshLambertMaterial
              color={color}
              transparent
              opacity={isSelected ? 0.8 : 1}
            />
          </mesh>
        );
    }
  };

  return (
    <>
      <group
        ref={meshRef}
        position={tempPosition.current}
        rotation={furniture.rotation}
        scale={furniture.scale}
        {...bind()}
      >
        <Text
          key={furniture.name}
          position={[0, furniture.dimensions.height + 0.5, 0]}
          fontSize={0.2}
          color={"#475467"}
          anchorX="center"
          anchorY="middle"
        >
          {furniture.name}
        </Text>

        {furniture.modelPath && furnitureScene ? (
          <primitive object={clonedScene.current || furnitureScene} />
        ) : (
          renderGeometry()
        )}

        {/* selection outline */}
        {isSelected && (
          <>
            {/* Spotlight above the selected furniture */}
            <spotLight
              position={[0, furniture.dimensions.height + 0.7, 0]}
              angle={0.5}
              penumbra={0.7}
              intensity={5}
              distance={6}
              castShadow={false}
              color={"#fffbe6"}
            />
            {/* Glow ring on the floor below the selected furniture */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.2, 0]}>
              <ringGeometry args={[radius * 1.2, radius * 1.5, 32]} />
              <meshBasicMaterial color="#000000" transparent opacity={0.5} />
            </mesh>
            {/* Diamond shape indicator on top */}
            <mesh position={[0, furniture.dimensions.height + 1, 0]}>
              <octahedronGeometry args={[0.3, 0]} />
              <meshBasicMaterial color="#0543f5" transparent opacity={0.8} />
            </mesh>
            {/* Existing selection outline */}
            {/* Scaling Gizmo (Drag Line) */}
            {/* <mesh
              position={[scaledDims.width / 2 + 0.5, scaledDims.height / 2, 0]} // Position it relative to the object's edge
              {...bindScaleGizmoDrag()}
            >
              <cylinderGeometry args={[0.05, 0.05, 1.0, 8]} />{" "} */}
            {/* A thin cylinder for the handle */}
            {/* <meshBasicMaterial color={"#FF0000"} />{" "} */}
            {/* Red for X-axis indication */}
            {/* <boxGeometry
                args={[
                  furniture.dimensions.width,
                  furniture.dimensions.height + 0.1,
                  furniture.dimensions.depth + 0.1,
                ]}
              />
              <meshBasicMaterial
                color="#3b82f6"
                wireframe
                transparent
                opacity={0.5}
              /> */}
            {/* </mesh> */}

            {/* Arrow */}
            <group position={[1.4, 0, 0]} {...bindScaleGizmoDrag()}>
              {/* Shaft of the arrow */}
              <mesh>
                <cylinderGeometry args={[0.05, 0.05, 1.0, 10]} />
                <meshBasicMaterial color={"#282120"} />
              </mesh>
              {/* Arrowhead (cone) at the tip */}
              <mesh position={[0, 0.6, 0]}>
                <coneGeometry args={[0.1, 0.2, 4]} />
                <meshBasicMaterial color={"#282120"} />
              </mesh>
            </group>
            {isScaling && (
              <mesh>
                {/* <boxGeometry
                  args={[
                    furniture.dimensions.width + 0.1,
                    furniture.dimensions.height + 1.5,
                    furniture.dimensions.depth + 0.1,
                  ]}
                />
                <meshBasicMaterial
                  color="#3b82f6"
                  wireframe
                  transparent
                  opacity={0.5}
                /> */}
                <lineSegments
                  position={[0, furniture.dimensions.height / 2, 0]}
                >
                  <edgesGeometry
                    args={[
                      new BoxGeometry(
                        furniture.dimensions.width + 0.1,
                        furniture.dimensions.height + 1.5,
                        furniture.dimensions.depth + 0.1
                      ),
                    ]}
                  />
                  <lineBasicMaterial color="#feda15" />
                </lineSegments>
              </mesh>
            )}
          </>
        )}
      </group>
    </>
  );
};

export default FurnitureModel;
