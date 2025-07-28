"use client";

import { useState } from "react";
import Image from "next/image";

import * as motion from "motion/react-client";
import { AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import {
  ChevronLeftIcon,
  HousePlusIcon,
  PanelLeftCloseIcon,
  InfoIcon,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { useSimulatorStore } from "@/stores/useSimulatorStore";
import { RoomCategory, Furniture } from "@/types/room";
import { PlacedFurniture } from "@/types/interactive";
import { Dimensions } from "@/types/common";
import { modelPreloader } from "@/hooks/use-model-preloader";
import { useIsMobile } from "@/hooks/use-mobile";

import { Button } from "../ui/button";
import { isFurnitureValidPosition } from "@/utils/validator";
import { getDefaultFurnitureInfo } from "@/utils/model";

const FurnitureSelector = ({ className }: { className?: string }) => {
  const [selectedCategory, setSelectedCategory] = useState<RoomCategory | null>(
    null
  );
  const [expand, setExpand] = useState<boolean>(true);

  const { roomCategories, addFurnitureToScene, scene } = useSimulatorStore();
  const isMobile = useIsMobile();

  const { addNotification } = useNotificationStore();

  const placedFurnitureList = scene.furniture;

  const handleAddFurnitureToScene = async (furniture: Furniture) => {
    // pre-load model and get dimensions
    let dimensions: Dimensions | null = null;
    const defaultDimensions = getDefaultFurnitureInfo(
      furniture.type
    ).dimensions;
    if (furniture.modelPath) {
      try {
        const modelData = await modelPreloader.preloadModel(
          furniture.modelPath
        );

        dimensions = modelData.dimensions;
      } catch (error) {
        dimensions = defaultDimensions;
      }
    } else {
      dimensions = defaultDimensions;
    }
    const color = furniture.color || getRandomHexColor();

    const placeFurniture: PlacedFurniture = {
      ...furniture,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      dimensions: dimensions || { width: 1, height: 1, depth: 1 },
      ...(!furniture.modelPath && { color: color }),
    };

    // Check collision
    if (
      isFurnitureValidPosition(
        placeFurniture.position,
        placeFurniture,
        placedFurnitureList
      )
    ) {
      addFurnitureToScene(placeFurniture);
      addNotification({
        title: `Added ${furniture.name} to scene`,
        state: "success",
      });
    } else {
      // Find new position because collision occurs
      let validPositionFound = false;
      for (let x = -5; x <= 5 && !validPositionFound; x += 0.5) {
        for (let z = -5; z <= 5 && !validPositionFound; z += 0.5) {
          const testPosition: [number, number, number] = [x, 0, z];
          if (
            isFurnitureValidPosition(
              testPosition,
              placeFurniture,
              placedFurnitureList
            )
          ) {
            const placedItem = { ...placeFurniture, position: testPosition };
            addFurnitureToScene(placedItem);
            addNotification({
              title: `Added ${furniture.name} to scene`,
              state: "success",
            });
            validPositionFound = true;
          }
        }
      }
      // Cannot find any space
      if (!validPositionFound) {
        addNotification({
          title: `Cannot add ${furniture.name} to scene`,
          description: "No space available for this furniture",
          state: "error",
        });
      }
    }
  };

  const getRandomHexColor = (): string => {
    const hex = Math.floor(Math.random() * 0xffffff).toString(16);
    return `#${hex.padStart(6, "0")}`;
  };

  return (
    <aside
      className={cn(
        "relative transition-all flex shadow-xs xl:h-[calc(100svh-64px)] h-[calc(100svh-32px)] rounded-xl bg-white border pt-6",
        expand
          ? "w-1/3 max-w-[240px] border-gray-200"
          : "w-5 max-w-[20px] border-transparent",
        className
      )}
    >
      <Button
        variant={`icon`}
        className="rounded-full absolute top-[-10px] right-[-10px] w-10 h-10 border hover:bg-primary-50 bg-white"
        onClick={() => setExpand(!expand)}
        aria-label={
          expand ? "Hide furniture selector" : "Show furniture selector"
        }
      >
        {expand ? (
          <PanelLeftCloseIcon className="size-5" />
        ) : (
          <HousePlusIcon className="size-5" />
        )}
      </Button>
      {isMobile ? (
        <div className="bg-secondary-50 w-full rounded-md m-2"></div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={expand ? { opacity: 100 } : { opacity: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className={cn(
            "overflow-auto flex shrink-0",
            expand ? "w-full" : "w-0 invisible"
          )}
        >
          {/* Browse furniture by room category */}
          <section
            className={cn(
              "flex flex-col gap-3 shrink-0 w-full",
              selectedCategory && "hidden"
            )}
          >
            <h4 className="font-semibold md:px-3 px-2">
              Browse furniture by room
            </h4>
            <ul className="mt-2 flex flex-col gap-4 grow overflow-y-auto md:px-3 px-2">
              {roomCategories.map((category) => {
                return (
                  <li
                    key={category.id}
                    className="relative group shrink-0 cursor-pointer h-40 overflow-hidden rounded-lg"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category.imageUrl && (
                      <Image
                        alt={`${category.name} category`}
                        src={category.imageUrl}
                        fill={true}
                        className="object-cover mx-auto rounded-lg group-hover:scale-110 transition-all duration-300 opacity-80 group-hover:opacity-100"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        placeholder="blur"
                        blurDataURL="/images/placeholder.webp"
                        priority
                      />
                    )}
                    <div className="relative flex items-end h-full p-1">
                      <span className="text-white font-semibold bg-primary-500/90 py-0.5 px-2 rounded-2xl">
                        {category.name}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
          {/* Furniture list by category id */}
          {selectedCategory && (
            <section className="flex flex-col gap-3">
              <header className="flex flex-col gap-1 md:px-3 px-2">
                <Button
                  variant={`link`}
                  onClick={() => setSelectedCategory(null)}
                >
                  <ChevronLeftIcon className="size-4" />
                  <span className="text-sm">Back</span>
                </Button>
                <h4 className="font-semibold">
                  {selectedCategory.name} furniture
                </h4>
                <span className="text-sm text-gray-500">
                  {selectedCategory.furniture.length} item
                  {selectedCategory.furniture.length > 1 ? "s" : ""}
                </span>
                <span className="text-sm text-gray-600 border border-gray-200 rounded p-2 bg-primary-50">
                  Click to add furniture to the scene
                </span>
              </header>
              {/* Furniture */}
              <section className="grow overflow-auto">
                <div className="grid grid-cols-2 gap-3 md:p-3 p-2">
                  {selectedCategory.furniture.map((furniture) => {
                    const imageUrl =
                      furniture?.previewImage ||
                      getDefaultFurnitureInfo(furniture.type).imagePreview;
                    return (
                      <AnimatePresence key={furniture.id} mode="wait">
                        <motion.button
                          type="button"
                          key={furniture.id}
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -10, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className={cn(
                            "relative rounded cursor-pointer h-42 w-full flex flex-col border-gray-300 gap-2 border hover:border-primary-600 overflow-hidden p-1 hover:ring-4 ring-primary-600"
                          )}
                          onClick={() => {
                            handleAddFurnitureToScene(furniture);
                          }}
                        >
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <InfoIcon className="absolute size-3 top-2 right-2 text-gray-600 opacity-70 z-1 bg-white rounded-full" />
                            </TooltipTrigger>
                            <TooltipContent className="space-y-0.5 text-xs text-gray-500 max-w-40">
                              <p className="font-semibold">{furniture.name}</p>
                              <hr />
                              <p>{furniture.description}</p>
                            </TooltipContent>
                          </Tooltip>
                          {/* Image */}
                          <div className="relative flex grow overflow-hidden bg-gray-100 rounded-sm p-1">
                            {imageUrl && (
                              <Image
                                alt={furniture.name}
                                src={imageUrl}
                                fill={true}
                                className="object-contain m-auto"
                                placeholder="blur"
                                blurDataURL="/images/placeholder.webp"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              />
                            )}
                          </div>
                          {/* Name */}
                          <span className="text-xs font-medium h-8 flex items-center justify-center text-center line-clamp-2">
                            {furniture.name}
                          </span>
                        </motion.button>
                      </AnimatePresence>
                    );
                  })}
                </div>
              </section>
            </section>
          )}
        </motion.div>
      )}
    </aside>
  );
};

export default FurnitureSelector;
