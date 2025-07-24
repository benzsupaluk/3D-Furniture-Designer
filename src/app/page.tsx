import dynamic from "next/dynamic";

const SimulatorContainer = dynamic(
  () => import("@/components/simulator/SimulatorContainer")
);
import FurnitureSelector from "@/components/FurnitureSelector";
import GenerateImageSection from "@/components/GenerateImageSection";

export default function Home() {
  return (
    <main className="md:p-8 p-4 flex flex-row gap-6 h-svh overflow-hidden">
      <FurnitureSelector />
      <div className="grow flex flex-col gap-4 overflow-hidden">
        <SimulatorContainer className="grow shrink-0" />
        <GenerateImageSection />
      </div>
    </main>
  );
}
