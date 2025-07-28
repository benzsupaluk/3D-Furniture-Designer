import dynamic from "next/dynamic";

import { Suspense } from "react";
const SimulatorContainer = dynamic(
  () => import("@/components/simulator/SimulatorContainer")
);
import FurnitureSelector from "@/components/furnitureSelection/FurnitureSelector";
import GenerateImageSection from "@/components/spaceGenerator/GenerateImageSection";

export default function Home() {
  return (
    <main className="flex flex-row gap-4 h-svh overflow-hidden xl:py-8 py-4 xl:pl-8 pl-4">
      <FurnitureSelector />
      <div className="grow flex flex-col gap-4 overflow-auto xl:h-[calc(100svh-64px)] h-[calc(100svh-32px)] xl:pr-8 pr-4">
        <SimulatorContainer className="grow" />
        <Suspense
          fallback={
            <div className="flex bg-gray-50 animate-pulse rounded"></div>
          }
        >
          <GenerateImageSection className="flex" />
        </Suspense>
      </div>
    </main>
  );
}
