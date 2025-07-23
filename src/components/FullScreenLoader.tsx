"use client";

import { useSimulatorStore } from "@/stores/useSimulatorStore";


const FullScreenLoader = () => {
  const loading = useSimulatorStore((state) => state.loadingFullScreen);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center flex-col gap-3 bg-black/20 bg-opacity-50">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 bg-primary-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="h-8 w-8 bg-secondary-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="h-8 w-8 bg-secondary-900 rounded-full animate-bounce"></div>
      </div>
      <div className="text-gray-700 text-lg font-medium animate-pulse">
        Loading...
      </div>
    </div>
  );
};

export default FullScreenLoader;
