"use client";

import dynamic from "next/dynamic";

import { useSimulatorStore } from "@/stores/useSimulatorStore";

import { cn } from "@/lib/utils";

import { CameraView } from "@/types/interactive";
import { Coordinate } from "@/types/common";
import { useTheme } from "@/hooks/use-theme";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { ThemeConfig } from "@/utils";

import * as motion from "motion/react-client";
import { AnimatePresence } from "motion/react";

import Spinner from "@/components/loader/Spinner";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  TrashIcon,
  RotateCwIcon,
  RotateCcwIcon,
  SwitchCameraIcon,
  Settings2Icon,
} from "lucide-react";
import { THEME_CONFIGS } from "@/constants";

const RoomScene = dynamic(() => import("@/components/simulator/RoomScene"), {
  ssr: false,
  loading: () => <Spinner className="w-full h-full" />,
});

const SimulatorContainer = ({ className }: { className?: string }) => {
  const { currentTheme, isClient } = useTheme();

  return (
    <>
      <section
        style={isClient ? currentTheme.style : THEME_CONFIGS[0].style}
        className={cn(
          "relative border rounded-lg border-primary-300 overflow-hidden",
          className
        )}
      >
        <RoomScene />
        {/* Camera controller */}
        <CameraControls />
        {/* Config */}
        <ConfigSettings currentTheme={currentTheme} />
        {/* Placed furniture action */}
        <PlacedFurnitureActions />
        {/* Placed furniture label */}
        <ActivePlacedFurnitureCard />
      </section>
    </>
  );
};

const ConfigSettings = ({ currentTheme }: { currentTheme: ThemeConfig }) => {
  const { selectTheme, themes } = useTheme();

  return (
    <div className="absolute top-3 right-1">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant={"secondary"} className="rounded-full p-0 w-8 h-8">
            <Settings2Icon />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" side="bottom" className="text-sm">
          <div className="flex flex-col gap-2">
            <div className="text-gray-700 font-semibold">Background</div>
            <div className="flex flex-wrap gap-1">
              {themes.map((theme, index) => {
                const isSelected = currentTheme.name === theme.name;
                return (
                  <div
                    key={index}
                    style={theme.style}
                    onClick={() => selectTheme(theme.name)}
                    className={cn(
                      "border border-gray-300 w-20 h-14 rounded-md hover:ring-2 ring-primary-600 cursor-pointer",
                      isSelected && "ring-2 ring-primary-600"
                    )}
                  ></div>
                );
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

const CameraControls = () => {
  const CAMERA_CONTROL_LIST: CameraView[] = ["top", "side", "front", "orbit"];
  const { setCameraView } = useSimulatorStore();
  return (
    <div className="absolute top-2 right-11 p-2 rounded-lg bg-primary-50/70 flex items-center gap-3">
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
                {view?.[0]?.toUpperCase() + view?.slice(1)}
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
  const { addNotification } = useNotificationStore();

  const selectedFurniture =
    scene?.furniture?.find((f) => f.id === selectedFurnitureId) || null;

  const handleRotatePlacedFurniture = (delta: number) => {
    if (!selectedFurniture) return;
    const newY = selectedFurniture.rotation[1] + delta;
    const newRotation: Coordinate = [
      selectedFurniture.rotation[0],
      newY,
      selectedFurniture.rotation[2],
    ];

    updatePlacedFurnitureById(selectedFurniture.id, { rotation: newRotation });
  };

  const handleDeletedPlacedFurniture = () => {
    removeFurnitureFromScene(selectedFurnitureId);
    addNotification({
      title: `Remove ${selectedFurniture?.name} from scene`,
      description: "",
      state: "success",
    });
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
            className="absolute top-1/2 -translate-y-1/2 right-2 flex flex-col gap-1 object-action bg-white border border-gray-300 rounded-lg p-1"
          >
            {/* Rotate left */}
            <Button
              variant="ghost"
              size="icon"
              onClick={(event) => {
                event.stopPropagation();
                handleRotatePlacedFurniture(-Math.PI / 8);
              }}
            >
              <RotateCwIcon className="w-4 h-4 transform-[rotateX(-50deg)] transform-3d" />
            </Button>

            {/* Rotate right */}
            <Button
              variant="ghost"
              size="icon"
              onClick={(event) => {
                event.stopPropagation();
                handleRotatePlacedFurniture(Math.PI / 8);
              }}
            >
              <RotateCcwIcon className="w-4 h-4 transform-[rotateX(-50deg)] transform-3d" />
            </Button>
            <hr />
            {/* Delete */}
            <Button
              variant="ghost-destructive"
              size="icon"
              onClick={(event) => {
                event.stopPropagation();
                handleDeletedPlacedFurniture();
              }}
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
