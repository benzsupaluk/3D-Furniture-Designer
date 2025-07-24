"use client";

import { useState } from "react";
import Image from "next/image";

import * as motion from "motion/react-client";
import { AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { ChevronLeftIcon, HousePlusIcon, X, XIcon } from "lucide-react";

import { useSimulatorStore } from "@/stores/useSimulatorStore";
import { RoomCategory } from "@/types/room";
import { PlacedFurniture } from "@/types/interactive";
import { Furniture } from "@/types/room";

import { Button } from "./ui/button";
import { isFurnitureValidPosition } from "@/utils/validator";

const FurnitureSelector = () => {
  const [selectedCategory, setSelectedCategory] = useState<RoomCategory | null>(
    null
  );
  const [expand, setExpand] = useState<boolean>(true);

  const {
    roomCategories,
    addFurnitureToScene,
    removeFurnitureFromScene,
    scene,
  } = useSimulatorStore();

  const placedFurnitureList = scene.furniture;

  const handleAddFurnitureToScene = (furniture: Furniture) => {
    const placeFurniture: PlacedFurniture = {
      ...furniture,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    };
    // check collision
    if (
      isFurnitureValidPosition(
        placeFurniture.position,
        placeFurniture,
        placedFurnitureList
      )
    ) {
      addFurnitureToScene(placeFurniture);
    } else {
      // find new position because collision occurs
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
            validPositionFound = true;
          }
        }
      }
      // cannot find any space
      if (!validPositionFound) {
        // TODO: add notification
        console.log("cannot find any space");
      }
    }
  };

  return (
    <aside
      className={cn(
        "relative transition-all flex shadow-xs md:h-[calc(100svh-64px)] h-[calc(100svh-32px)] rounded-xl bg-white border py-8",
        expand
          ? "w-1/3 max-w-[240px] border-gray-200"
          : "w-5 max-w-[20px] border-transparent"
      )}
    >
      <Button
        variant={`icon`}
        className="rounded-full absolute top-[-10px] right-[-10px] w-10 h-10 border hover:bg-primary-50 bg-white"
        onClick={() => setExpand(!expand)}
      >
        {expand ? (
          <XIcon className="size-5" />
        ) : (
          <HousePlusIcon className="size-5" />
        )}
      </Button>
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
          <ul className="mt-2 flex flex-col gap-2 grow overflow-y-auto md:px-3 px-2">
            {roomCategories.map((category) => {
              return (
                <li
                  key={category.id}
                  className="relative group shrink-0 cursor-pointer h-40 overflow-hidden rounded-lg"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category.imageUrl && (
                    <Image
                      alt={category.name}
                      src={category.imageUrl}
                      fill={true}
                      className="object-cover w-full rounded-lg group-hover:scale-110 transition-all duration-300 opacity-80 group-hover:opacity-100"
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
            </header>
            {/* Furniture */}
            <section className="grow overflow-auto">
              <div className="flex flex-wrap gap-3 md:p-3 p-2">
                {selectedCategory.furniture.map((furniture) => {
                  const isSelected = placedFurnitureList.some(
                    (f) => f.id === furniture.id
                  );
                  return (
                    <AnimatePresence key={furniture.id} mode="wait">
                      <motion.button
                        type="button"
                        key={furniture.id}
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -10, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="rounded cursor-pointer h-[100px] w-[100px] flex flex-col border border-gray-300 hover:border-primary-600 overflow-hidden p-1 hover:ring-4 ring-primary-600"
                        onClick={() => {
                          if (isSelected) {
                            removeFurnitureFromScene(furniture.id);
                            return;
                          }
                          handleAddFurnitureToScene(furniture);
                        }}
                      >
                        {/* Image */}
                        <div className="grow"></div>
                        {/* Name */}
                        <span className="text-sm font-medium">
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
    </aside>
  );
};

export default FurnitureSelector;
