"use client";

import dynamic from "next/dynamic";

import Spinner from "@/components/loader/Spinner";
import { Button } from "@/components/ui/button";
import { useSimulatorStore } from "@/stores/useSimulatorStore";

import { cn } from "@/lib/utils";
import { isFurnitureValidPosition } from "@/utils/validator";

import { CameraView, PlacedFurniture } from "@/types/interactive";
import { Coordinate } from "@/types/common";

import * as motion from "motion/react-client";
import { AnimatePresence } from "motion/react";
import {
  TrashIcon,
  RotateCwIcon,
  RotateCcwIcon,
  SwitchCameraIcon,
} from "lucide-react";

const RoomScene = dynamic(() => import("@/components/simulator/RoomScene"), {
  ssr: false,
  loading: () => <Spinner className="w-full h-full" />,
});

const SimulatorContainer = ({ className }: { className?: string }) => {
  return (
    <>
      <section
        style={{
          backgroundImage:
            "radial-gradient(circle, #d1d5db 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
        className={cn(
          "relative border rounded-lg border-primary-300 overflow-hidden",
          className
        )}
      >
        <RoomScene />
        <SimulatorHeader />
        {/* Placed furniture action */}
        <PlacedFurnitureActions />
        {/* Placed furniture label */}
        <ActivePlacedFurnitureCard />
      </section>
    </>
  );
};

const SimulatorHeader = () => {
  return (
    <div className="absolute top-2 right-2 p-2 rounded-lg bg-primary-50/70">
      <CameraControls />
    </div>
  );
};

const CameraControls = () => {
  const CAMERA_CONTROL_LIST: CameraView[] = ["top", "side", "front", "orbit"];
  const { setCameraView } = useSimulatorStore();
  return (
    <div className="flex items-center gap-3">
      <SwitchCameraIcon className="size-6 text-primary-700" />
      <ul className="flex flex-wrap gap-2">
        {CAMERA_CONTROL_LIST.map((view, index) => {
          return (
            <li key={index}>
              <Button
                type="button"
                variant={"outline"}
                className="text-xs"
                size={"xs"}
                onClick={() => setCameraView(view)}
              >
                {view}
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const PlacedFurnitureActions = () => {
  const {
    scene,
    selectedFurnitureId,
    setSelectedFurnitureId,
    updatePlacedFurnitureById,
    removeFurnitureFromScene,
  } = useSimulatorStore();

  const selectedFurniture =
    scene?.furniture?.find((f) => f.id === selectedFurnitureId) || null;

  const handleRotatePlacedFurniture = (delta: number) => {
    if (!selectedFurniture) return;
    const newY = selectedFurniture.rotation[1] + delta;
    const newPosition: Coordinate = [
      selectedFurniture.rotation[0],
      newY,
      selectedFurniture.rotation[2],
    ];

    updatePlacedFurnitureById(selectedFurniture.id, { rotation: newPosition });
  };

  const handleDeletedPlacedFurniture = () => {
    removeFurnitureFromScene(selectedFurnitureId);
    setSelectedFurnitureId("");
  };

  return (
    <>
      {selectedFurnitureId && (
        <AnimatePresence>
          <motion.div
            initial={{ x: 10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -10, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute top-1/2 -translate-y-1/2 right-2 flex flex-col gap-2 object-action"
          >
            {/* rotate left */}
            <Button
              variant="ghost"
              size="icon"
              onClick={(event) => {
                // event.preventDefault();
                event.stopPropagation();
                handleRotatePlacedFurniture(-Math.PI / 8);
              }}
            >
              <RotateCcwIcon className="w-4 h-4" />
            </Button>

            {/* rotate right */}
            <Button
              variant="ghost"
              size="icon"
              onClick={(event) => {
                // event.preventDefault();
                event.stopPropagation();
                handleRotatePlacedFurniture(Math.PI / 8);
              }}
            >
              <RotateCwIcon className="w-4 h-4" />
            </Button>

            {/* delete */}
            <Button
              variant="ghost-destructive"
              size="icon"
              onClick={(event) => {
                console.log("remove");
                event.stopPropagation();
                handleDeletedPlacedFurniture();
              }}
              className="mt-2"
            >
              <TrashIcon className="w-4 h-4" />
            </Button>
          </motion.div>{" "}
        </AnimatePresence>
      )}
    </>
  );
};

const ActivePlacedFurnitureCard = () => {
  const { selectedFurnitureId, scene } = useSimulatorStore();
  const selectedFurniture =
    scene?.furniture?.find((f) => f.id === selectedFurnitureId) || null;
  return (
    <>
      {selectedFurnitureId && (
        <AnimatePresence>
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className={cn(
              "absolute bg-primary-50/50 flex-col border-2 border-primary-600 max-w-[80%] overflow-hidden px-3 py-0.5 text-sm text-gray-700 font-semibold flex items-center gap-0.5 bottom-2 right-2 shadow-xl rounded-lg"
            )}
          >
            <p className="break-word overflow-hidden line-clamp-1">
              <span className="text-gray-700 font-medium">
                Selected Furniture:{" "}
              </span>
              <span className="text-gray-900 font-semibold">
                {selectedFurniture?.name}
              </span>
            </p>
            <p className="text-gray-500 text-xs font-normal line-clamp-1">
              Category: Bedroom
            </p>
          </motion.div>
        </AnimatePresence>
      )}
    </>
  );
};

export default SimulatorContainer;
