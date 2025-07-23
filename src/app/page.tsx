import dynamic from "next/dynamic";

const Simulator = dynamic(() => import("@/components/Simulator"));
import FurnitureSelector from "@/components/FurnitureSelector";
import GenerateImageSection from "@/components/GenerateImageSection";

export default function Home() {
  return (
    <main className="md:p-8 p-4 flex flex-row gap-6">
      <FurnitureSelector />
      <div className="grow flex flex-col gap-4">
        <Simulator className="grow" />
        <GenerateImageSection />
      </div>
    </main>
  );
}
