"use client";

import { useState } from "react";
import Image from "next/image";

import * as motion from "motion/react-client";
import { AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { ChevronLeftIcon, HousePlusIcon, X, XIcon } from "lucide-react";

import { useSimulatorStore } from "@/stores/useSimulatorStore";
import { RoomCategory } from "@/types/room";

import { Button } from "./ui/button";

const FurnitureSelector = () => {
  const [selectedCategory, setSelectedCategory] = useState<RoomCategory | null>(
    null
  );
  const [expand, setExpand] = useState<boolean>(true);

  const { roomCategories, addFurnitureToScene } = useSimulatorStore();

  return (
    <aside
      className={cn(
        "relative transition-all shadow-xs md:h-[calc(100svh-64px)] h-[calc(100svh-32px)] rounded-xl bg-white border md:px-3 px-2 py-8",
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
        className={cn(expand ? "w-full" : "w-0 invisible")}
      >
        {/* Browse furniture by room category */}
        <section
          className={cn("flex flex-col gap-3", selectedCategory && "hidden")}
        >
          <h4 className="font-semibold">Browse furniture by room</h4>
          <ul className="mt-2 flex flex-col gap-2 grow overflow-y-auto">
            {roomCategories.map((category) => {
              return (
                <li
                  key={category.id}
                  className="relative group cursor-pointer h-40 overflow-hidden rounded-lg"
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
            <header className="flex flex-col gap-1">
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
            <div className="grid sm:grid-cols-2 gap-3">
              {selectedCategory.furniture.map((furniture) => {
                return (
                  <AnimatePresence key={furniture.id} mode="wait">
                    <motion.button
                      type="button"
                      key={furniture.id}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -10, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="rounded flex flex-col border border-gray-300 hover:border-primary-600 aspect-square overflow-hidden p-1 hover:ring-4 ring-primary-600"
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
        )}
      </motion.div>
    </aside>
  );
};

export default FurnitureSelector;
