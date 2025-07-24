"use client";

import dynamic from "next/dynamic";

const Scene = dynamic(() => import("@/components/simulator/Scene"), {
  ssr: false,
});

import { cn } from "@/lib/utils";

const SimulatorContainer = ({ className }: { className?: string }) => {
  return (
    <section
      style={{
        backgroundImage:
          "radial-gradient(circle, #d1d5db 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
      className={cn(
        "border rounded-lg border-primary-300 overflow-hidden",
        className
      )}
    >
      <Scene />
    </section>
  );
};

export default SimulatorContainer;
