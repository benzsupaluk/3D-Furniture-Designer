"use client";

import dynamic from "next/dynamic";

import Spinner from "@/components/loader/Spinner";
import { Button } from "@/components/ui/button";
import { useSimulatorStore } from "@/stores/useSimulatorStore";

import { cn } from "@/lib/utils";
import { isFurnitureValidPosition } from "@/utils/validator";

import { PlacedFurniture } from "@/types/interactive";
import { Coordinate } from "@/types/common";

import * as motion from "motion/react-client";
import { AnimatePresence } from "motion/react";
import { TrashIcon, RotateCwIcon, RotateCcwIcon } from "lucide-react";

const RoomScene = dynamic(() => import("@/components/simulator/RoomScene"), {
  ssr: false,
  loading: () => <Spinner className="w-full h-full" />,
});

const SimulatorContainer = ({ className }: { className?: string }) => {
  return (
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
      {/* Placed furniture action */}
      <PlacedFurnitureActions />
      {/* Placed furniture label */}
      <ActivePlacedFurnitureCard />
    </section>
  );
};

const PlacedFurnitureActions = () => {
  const {
    scene,
    selectedFurnitureId,
    setSelectedFurnitureId,
    updatePlacedFurnitureById,
  } = useSimulatorStore();

  const selectedFurniture =
    scene?.furniture?.find((f) => f.id === selectedFurnitureId) || null;

  const handleRotatePlacedFurniture = (delta: number) => {
    console.log("clcik", selectedFurniture);
    if (!selectedFurniture) return;
    const newY = selectedFurniture.rotation[1] + delta;
    const newPosition: Coordinate = [
      selectedFurniture.rotation[0],
      newY,
      selectedFurniture.rotation[2],
    ];
    console.log("newPosition", newPosition);
    updatePlacedFurnitureById(selectedFurniture.id, { rotation: newPosition });
  };

  const handleDeletedPlacedFurniture = () => {
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
            className="absolute top-1/2 -translate-y-1/2 right-2 flex flex-col gap-2"
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
              onClick={handleDeletedPlacedFurniture}
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
