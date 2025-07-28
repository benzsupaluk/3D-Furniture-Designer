"use client";

import { useEffect, useRef, useState, useCallback, memo } from "react";
import { Group, Vector2, Vector3, Plane, BoxGeometry, Mesh } from "three";

import { useThree } from "@react-three/fiber";
import { Text, useGLTF } from "@react-three/drei";
import { PlacedFurniture } from "@/types/interactive";
import { useGesture } from "@use-gesture/react";
import { Coordinate } from "@/types/common";
import { modelPreloader } from "@/hooks/use-model-preloader";

import { isFurnitureValidPosition } from "@/utils/validator";
import { useSimulatorStore } from "@/stores/useSimulatorStore";

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

const FurnitureModel = memo(
  ({
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

    const initialDragPoint = useRef<Vector3 | null>(null);
    const initialFurniturePosition = useRef<Vector3 | null>(null);
    const initialScale = useRef<Coordinate>([1, 1, 1]);
    const tempScale = useRef<Coordinate>(furniture.scale || [1, 1, 1]);
    const clonedScene = useRef<Group | null>(null);

    const floorPlane = useRef(new Plane(new Vector3(0, 1, 0), 0)).current;
    const planeIntersectPoint = useRef(new Vector3()).current;

    const { camera, gl, size, raycaster, invalidate } = useThree();
    const { scene: simulatorScene } = useSimulatorStore();

    const otherFurniture = simulatorScene.furniture.filter(
      (f) => f.id !== furniture.id
    );
    const radius =
      Math.max(furniture.dimensions.width, furniture.dimensions.depth) / 2 +
      0.2;

    const cachedModel = furniture?.modelPath
      ? modelPreloader.getCachedModel(furniture?.modelPath)
      : null;

    const { scene: furnitureScene } = cachedModel
      ? cachedModel
      : furniture?.modelPath
      ? useGLTF(furniture.modelPath)
      : { scene: null };

    useEffect(() => {
      if (furnitureScene && !clonedScene.current) {
        clonedScene.current = furnitureScene.clone();
      }
    }, [furnitureScene]);

    const get3DIntersection = useCallback(
      (screenX: number, screenY: number): Vector3 | null => {
        const normalizedMouseX = ((screenX - size.left) / size.width) * 2 - 1;
        const normalizedMouseY = -((screenY - size.top) / size.height) * 2 + 1;

        raycaster.setFromCamera(
          new Vector2(normalizedMouseX, normalizedMouseY),
          camera
        );
        const intersection = raycaster.ray.intersectPlane(
          floorPlane,
          planeIntersectPoint
        );
        return intersection?.clone() ?? null;
      },
      [camera, raycaster, size]
    );

    const bind = useGesture(
      {
        onDragStart: ({ event, xy: [dragX, dragY] }) => {
          if (isScaling) {
            return;
          }
          event.stopPropagation();

          setIsDragging(true);

          const intersectPoint = get3DIntersection(dragX, dragY);
          if (intersectPoint) {
            initialDragPoint.current = intersectPoint;
            initialFurniturePosition.current =
              meshRef.current?.position.clone() || null;
          }
          invalidate();
        },
        onDrag: ({ event, xy: [dragX, dragY], intentional }) => {
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
              isFurnitureValidPosition(
                currentPosition,
                furniture,
                otherFurniture
              )
            ) {
              tempPosition.current = currentPosition;
              meshRef.current.position.copy(newPosition);
            }
          }
          invalidate();
        },
        onDragEnd: ({ event }) => {
          event.stopPropagation();

          setIsDragging(false);
          initialDragPoint.current = null;
          initialFurniturePosition.current = null;

          onMove(furniture, tempPosition.current);
          invalidate();
        },
        onClick: ({ event }) => {
          event.stopPropagation();
          if (!isDragging) {
            onSelect(furniture);
          }
        },
      },
      {
        drag: {
          filterTaps: true,
          threshold: 3,
        },
      }
    );

    const bindScale = useGesture(
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
          // event.stopPropagation();
          // if (!initialDragPoint.current || !meshRef.current) return;

          // const currentIntersectPoint = get3DIntersection(dragX, dragY);
          // if (currentIntersectPoint) {
          //   // Calculate distance dragged relative to the initial click point
          //   const dragDelta = currentIntersectPoint
          //     .clone()
          //     .sub(initialDragPoint.current);

          //   // Simple scaling factor based on X-axis movement
          //   const scaleFactorDelta = dragDelta.x * 0.5; // Adjust sensitivity
          //   let newScaleValue = initialScale.current[0] + scaleFactorDelta;

          //   // Clamp scale to reasonable values (min 0.3, max 3.0)
          //   newScaleValue = Math.max(0.3, Math.min(3.0, newScaleValue));

          //   const newScale: [number, number, number] = [
          //     newScaleValue,
          //     newScaleValue,
          //     newScaleValue,
          //   ];

          //   // Check collision with the new scale (use current position, new scale)
          //   if (
          //     isFurnitureValidPosition(
          //       tempPosition.current,
          //       { ...furniture, scale: newScale },
          //       otherFurniture
          //     )
          //   ) {
          //     tempScale.current = newScale; // Update ref
          //     meshRef.current.scale.set(...newScale); // Apply scale to the mesh
          //   }
          // }
          // invalidate();
          event.stopPropagation();
          const intersect = get3DIntersection(dragX, dragY);
          if (!intersect || !initialDragPoint.current || !meshRef.current)
            return;
          const delta = (intersect.x - initialDragPoint.current.x) * 0.5;
          const val = Math.max(
            0.3,
            Math.min(3.0, initialScale.current[0] + delta)
          );
          const newScale: Coordinate = [val, val, val];
          if (
            isFurnitureValidPosition(
              tempPosition.current,
              { ...furniture, scale: newScale },
              otherFurniture
            )
          ) {
            tempScale.current = newScale;
            meshRef.current.scale.set(...newScale);
          }
          invalidate();
        },
        onDragEnd: ({ event }) => {
          event.stopPropagation();
          setIsScaling(false);
          initialDragPoint.current = null;
          initialScale.current = [1, 1, 1];
          onScale?.(furniture, tempPosition.current, tempScale.current);
          invalidate();
        },
      },
      {
        drag: {
          filterTaps: true,
          threshold: 0.5,
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
              <mesh position={[0, height * 0.4, 0]} castShadow receiveShadow>
                <boxGeometry args={[width, height * 0.1, depth]} />
                <meshLambertMaterial color={color} />
              </mesh>
              {/* Backrest */}
              <mesh
                position={[0, height * 0.7, -depth * 0.35]}
                castShadow
                receiveShadow
              >
                <boxGeometry args={[width, height * 0.6, depth * 0.1]} />
                <meshLambertMaterial color={color} />
              </mesh>
              {/* Legs */}
              <mesh
                position={[-width / 3, height * 0.2, -depth / 3]}
                castShadow
                receiveShadow
              >
                <boxGeometry args={[0.05, height * 0.4, 0.05]} />
                <meshLambertMaterial color={color} />
              </mesh>
              <mesh
                position={[width / 3, height * 0.2, -depth / 3]}
                castShadow
                receiveShadow
              >
                <boxGeometry args={[0.05, height * 0.4, 0.05]} />
                <meshLambertMaterial color={color} />
              </mesh>
              <mesh
                position={[-width / 3, height * 0.2, depth / 3]}
                castShadow
                receiveShadow
              >
                <boxGeometry args={[0.05, height * 0.4, 0.05]} />
                <meshLambertMaterial color={color} />
              </mesh>
              <mesh
                position={[width / 3, height * 0.2, depth / 3]}
                castShadow
                receiveShadow
              >
                <boxGeometry args={[0.05, height * 0.4, 0.05]} />
                <meshLambertMaterial color={color} />
              </mesh>
            </group>
          );

        case "table":
          return (
            <group>
              {/* Top */}
              <mesh position={[0, height * 0.9, 0]} castShadow receiveShadow>
                <boxGeometry args={[width, height * 0.1, depth]} />
                <meshLambertMaterial color={color} />
              </mesh>
              {/* Legs */}
              <mesh
                position={[-width * 0.4, height * 0.4, -depth * 0.4]}
                castShadow
                receiveShadow
              >
                <boxGeometry args={[0.08, height * 0.8, 0.08]} />
                <meshLambertMaterial color={color} />
              </mesh>
              <mesh
                position={[width * 0.4, height * 0.4, -depth * 0.4]}
                castShadow
                receiveShadow
              >
                <boxGeometry args={[0.08, height * 0.8, 0.08]} />
                <meshLambertMaterial color={color} />
              </mesh>
              <mesh
                position={[-width * 0.4, height * 0.4, depth * 0.4]}
                castShadow
                receiveShadow
              >
                <boxGeometry args={[0.08, height * 0.8, 0.08]} />
                <meshLambertMaterial color={color} />
              </mesh>
              <mesh
                position={[width * 0.4, height * 0.4, depth * 0.4]}
                castShadow
                receiveShadow
              >
                <boxGeometry args={[0.08, height * 0.8, 0.08]} />
                <meshLambertMaterial color={color} />
              </mesh>
            </group>
          );

        case "sofa":
          return (
            <group>
              {/* Main body */}
              <mesh position={[0, height * 0.5, 0]} castShadow receiveShadow>
                <boxGeometry args={[width, height * 0.6, depth]} />
                <meshLambertMaterial color={color} />
              </mesh>
              {/* Backrest */}
              <mesh
                position={[0, height * 0.8, -depth * 0.3]}
                castShadow
                receiveShadow
              >
                <boxGeometry args={[width, height * 0.6, depth * 0.4]} />
                <meshLambertMaterial color={color} />
              </mesh>
              {/* Arms */}
              <mesh
                position={[-width * 0.4, height * 0.6, 0]}
                castShadow
                receiveShadow
              >
                <boxGeometry args={[width * 0.2, height * 0.4, depth * 0.8]} />
                <meshLambertMaterial color={color} />
              </mesh>
              <mesh
                position={[width * 0.4, height * 0.6, 0]}
                castShadow
                receiveShadow
              >
                <boxGeometry args={[width * 0.2, height * 0.4, depth * 0.8]} />
                <meshLambertMaterial color={color} />
              </mesh>
            </group>
          );

        case "cabinet":
          return (
            <group>
              {/* Cabinet body */}
              <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[width, height, depth]} />
                <meshLambertMaterial color={color} />
              </mesh>
              {/* Cabinet doors (visual detail) */}
              <mesh
                position={[-width * 0.25, height / 2, depth / 2 + 0.01]}
                castShadow
                receiveShadow
              >
                <boxGeometry args={[width * 0.45, height * 0.9, 0.02]} />
                <meshLambertMaterial color={"#d4d4d4"} />
              </mesh>
              <mesh
                position={[width * 0.25, height / 2, depth / 2 + 0.01]}
                castShadow
                receiveShadow
              >
                <boxGeometry args={[width * 0.45, height * 0.9, 0.02]} />
                <meshLambertMaterial color={"#d4d4d4"} />
              </mesh>
            </group>
          );

        case "bed":
          return (
            <group>
              {/* Mattress */}
              <mesh position={[0, height * 0.3, 0]} castShadow receiveShadow>
                <boxGeometry args={[width, height * 0.3, depth]} />
                <meshLambertMaterial color={color} />
              </mesh>
              {/* Headboard */}
              <mesh
                position={[0, height * 0.6, -depth / 2 + 0.05]}
                castShadow
                receiveShadow
              >
                <boxGeometry args={[width, height * 0.6, 0.1]} />
                <meshLambertMaterial color={color} />
              </mesh>
              {/* Legs */}
              <mesh
                position={[-width / 2 + 0.05, height * 0.15, -depth / 2 + 0.05]}
                castShadow
                receiveShadow
              >
                <boxGeometry args={[0.08, height * 0.3, 0.08]} />
                <meshLambertMaterial color={color} />
              </mesh>
              <mesh
                position={[width / 2 - 0.05, height * 0.15, -depth / 2 + 0.05]}
                castShadow
                receiveShadow
              >
                <boxGeometry args={[0.08, height * 0.3, 0.08]} />
                <meshLambertMaterial color={color} />
              </mesh>
              <mesh
                position={[-width / 2 + 0.05, height * 0.15, depth / 2 - 0.05]}
                castShadow
                receiveShadow
              >
                <boxGeometry args={[0.08, height * 0.3, 0.08]} />
                <meshLambertMaterial color={color} />
              </mesh>
              <mesh
                position={[width / 2 - 0.05, height * 0.15, depth / 2 - 0.05]}
                castShadow
                receiveShadow
              >
                <boxGeometry args={[0.08, height * 0.3, 0.08]} />
                <meshLambertMaterial color={color} />
              </mesh>
            </group>
          );

        default:
          return (
            <mesh castShadow receiveShadow>
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

    const planeRef = useRef<Mesh>(null);

    const initialPosition = useRef<Vector3 | null>(null);

    const getIntersection = useCallback(
      (x: number, y: number): Vector3 | null => {
        const mouse = new Vector2(
          (x / gl.domElement.clientWidth) * 2 - 1,
          -(y / gl.domElement.clientHeight) * 2 + 1
        );

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(planeRef.current!);
        return intersects.length > 0 ? intersects[0].point : null;
      },
      [camera, raycaster, gl.domElement]
    );

    return (
      <>
        <group
          ref={meshRef}
          position={[tempPosition.current[0], 0, tempPosition.current[2]]}
          rotation={furniture.rotation}
          scale={furniture.scale}
          {...bind()}
        >
          <Text
            key={furniture.name}
            position={[0, furniture.dimensions.height + 0.5, 0]}
            fontSize={0.1}
            name={`label:${furniture.name}`}
            color={"#475467"}
            anchorX="center"
            anchorY="middle"
          >
            {furniture.name}
          </Text>

          {furniture.modelPath && furnitureScene ? (
            <primitive
              castShadow
              receiveShadow
              object={clonedScene.current || furnitureScene}
            />
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
                name={`label:${furniture.name}-spotlight`}
              />
              {/* Glow ring on the floor below the selected furniture */}
              <mesh
                name={`label:${furniture.name}-glow-ring`}
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, 0.1, 0]}
              >
                <ringGeometry args={[radius * 1.2, radius * 1.5, 32]} />
                <meshBasicMaterial color="#000000" transparent opacity={0.5} />
              </mesh>
              {/* Diamond shape indicator on top */}
              <mesh
                name={`label:${furniture.name}-indicator`}
                position={[0, furniture.dimensions.height + 1, 0]}
              >
                <octahedronGeometry args={[0.3, 0]} />
                <meshBasicMaterial color="#0543f5" transparent opacity={0.8} />
              </mesh>
              {/* Arrow */}
              <group
                name={`label:${furniture.name}-scale`}
                position={[1, 0.4, 0]}
                {...bindScale()}
              >
                {/* Shaft of the arrow */}
                <mesh>
                  <cylinderGeometry args={[0.04, 0.04, 0.5, 10]} />
                  <meshBasicMaterial color={"#282120"} />
                </mesh>

                {/* Top cone - smaller and adjusted position */}
                <mesh position={[0, 0.3, 0]}>
                  <coneGeometry args={[0.1, 0.1, 4]} />
                  <meshBasicMaterial color={"#282120"} />
                </mesh>

                {/* Bottom cone - flipped and smaller */}
                <mesh position={[0, -0.3, 0]} rotation={[Math.PI, 0, 0]}>
                  <coneGeometry args={[0.1, 0.1, 4]} />
                  <meshBasicMaterial color={"#282120"} />
                </mesh>
              </group>
              {isScaling && (
                <mesh name={`label:${furniture.name}-scale-indicator`}>
                  <lineSegments>
                    <edgesGeometry
                      args={[
                        new BoxGeometry(
                          furniture.dimensions.width + 0.1,
                          furniture.dimensions.height,
                          furniture.dimensions.depth + 0.1
                        ),
                      ]}
                    />
                    <lineBasicMaterial
                      color="#000000"
                      transparent
                      opacity={0.6}
                    />
                  </lineSegments>
                </mesh>
              )}
            </>
          )}
        </group>
      </>
    );
  }
);

export default FurnitureModel;
