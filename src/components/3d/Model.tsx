/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useRef, useState, useCallback, memo } from "react";
import { Group, Vector2, Vector3, Plane, BoxGeometry, Mesh } from "three";
import { useThree } from "@react-three/fiber";
import { Text, useGLTF } from "@react-three/drei";
import { useGesture } from "@use-gesture/react";

import { PlacedFurniture } from "@/types/interactive";
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
    const [isDragging, setIsDragging] = useState(false);
    const [isScaling, setIsScaling] = useState(false);

    const meshRef = useRef<Group>(null);
    const tempPosition = useRef<Coordinate>(furniture.position);
    const tempScale = useRef<Coordinate>(furniture.scale || [1, 1, 1]);
    const initialDragPoint = useRef<Vector3 | null>(null);
    const initialFurniturePosition = useRef<Vector3 | null>(null);
    const initialScale = useRef<Coordinate>([1, 1, 1]);

    const { camera, raycaster, size, invalidate } = useThree();
    const { scene: simulatorScene } = useSimulatorStore();
    const otherFurniture = simulatorScene.furniture.filter(
      (f) => f.id !== furniture.id
    );

    const floorPlane = useRef(new Plane(new Vector3(0, 1, 0), 0)).current;
    const planeIntersectPoint = useRef(new Vector3()).current;

    const get3DIntersection = useCallback(
      (x: number, y: number): Vector3 | null => {
        const normX = ((x - size.left) / size.width) * 2 - 1;
        const normY = -((y - size.top) / size.height) * 2 + 1;
        raycaster.setFromCamera(new Vector2(normX, normY), camera);
        const intersection = raycaster.ray.intersectPlane(
          floorPlane,
          planeIntersectPoint
        );
        return intersection?.clone() ?? null;
      },
      [camera, raycaster, size]
    );

    const cachedModel = furniture.modelPath
      ? modelPreloader.getCachedModel(furniture.modelPath)
      : null;
    const { scene: furnitureScene } =
      cachedModel ?? useGLTF(furniture.modelPath ?? "");
    const clonedScene = useRef<Group | null>(null);

    useEffect(() => {
      if (furnitureScene && !clonedScene.current) {
        clonedScene.current = furnitureScene.clone();
      }
    }, [furnitureScene]);

    const updateFurniturePosition = (intersect: Vector3) => {
      const displacement = intersect.clone().sub(initialDragPoint.current!);
      const newPosition = initialFurniturePosition
        .current!.clone()
        .add(displacement);
      const { width, depth } = furniture.dimensions;

      newPosition.y = 0;
      newPosition.x = Math.max(
        -5 + width / 2,
        Math.min(5 - width / 2, newPosition.x)
      );
      newPosition.z = Math.max(
        -5 + depth / 2,
        Math.min(5 - depth / 2, newPosition.z)
      );

      const currentPos: Coordinate = [newPosition.x, 0, newPosition.z];
      if (isFurnitureValidPosition(currentPos, furniture, otherFurniture)) {
        tempPosition.current = currentPos;
        meshRef.current?.position.copy(newPosition);
      }
    };

    const bind = useGesture(
      {
        onDragStart: ({ event, xy: [x, y] }) => {
          if (isScaling) return;
          event.stopPropagation();
          setIsDragging(true);
          initialDragPoint.current = get3DIntersection(x, y);
          initialFurniturePosition.current =
            meshRef.current?.position.clone() ?? null;
          invalidate();
        },
        onDrag: ({ event, xy: [x, y], intentional }) => {
          if (
            !intentional ||
            !isSelected ||
            isScaling ||
            !initialDragPoint.current ||
            !initialFurniturePosition.current
          )
            return;
          event.stopPropagation();
          const intersect = get3DIntersection(x, y);
          if (intersect) updateFurniturePosition(intersect);
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
          if (!isDragging) onSelect(furniture);
        },
      },
      { drag: { filterTaps: true, threshold: 3 } }
    );

    const bindScale = useGesture(
      {
        onDragStart: ({ event, xy: [x, y] }) => {
          event.stopPropagation();
          setIsScaling(true);
          initialDragPoint.current = get3DIntersection(x, y);
          initialScale.current = [...tempScale.current];
          invalidate();
        },
        onDrag: ({ event, xy: [x, y] }) => {
          event.stopPropagation();
          const intersect = get3DIntersection(x, y);
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
      { drag: { filterTaps: true, threshold: 1 } }
    );

    return (
      <group
        ref={meshRef}
        position={tempPosition.current}
        rotation={furniture.rotation}
        scale={furniture.scale}
        {...bind()}
      >
        <Text
          position={[0, furniture.dimensions.height + 0.5, 0]}
          fontSize={0.2}
          color="#475467"
          anchorX="center"
          anchorY="middle"
        >
          {furniture.name}
        </Text>
        {furniture.modelPath && furnitureScene ? (
          <primitive object={clonedScene.current || furnitureScene} />
        ) : (
          <mesh>
            <boxGeometry
              args={[
                furniture.dimensions.width,
                furniture.dimensions.height,
                furniture.dimensions.depth,
              ]}
            />
            <meshLambertMaterial
              color={furniture.color}
              transparent
              opacity={isSelected ? 0.8 : 1}
            />
          </mesh>
        )}
        {isSelected && (
          <group position={[1.4, 0, 0]} {...bindScale()}>
            <mesh>
              <cylinderGeometry args={[0.05, 0.05, 1.0, 10]} />
              <meshBasicMaterial color="#282120" />
            </mesh>
            <mesh position={[0, 0.6, 0]}>
              <coneGeometry args={[0.1, 0.2, 4]} />
              <meshBasicMaterial color="#282120" />
            </mesh>
          </group>
        )}
      </group>
    );
  }
);

export default FurnitureModel;
