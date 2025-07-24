"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useSpaceGeneratorStore } from "@/stores/useSpaceGeneratorStore";

import { Button } from "./ui/button";
import GenerateConfirmationModal from "./GenerateConfirmationModal";

import { SparklesIcon } from "lucide-react";

const GenerateImageSection = ({ className }: { className?: string }) => {
  const [openConfirmationModal, setOpenConfirmationModal] =
    useState<boolean>(false);

  const { poolResult } = useSpaceGeneratorStore();

  return (
    <>
      <GenerateConfirmationModal
        open={openConfirmationModal}
        setOpen={setOpenConfirmationModal}
      />
      <section className={cn("flex flex-col gap-3", className)}>
        <Button
          className="ml-auto"
          onClick={() => setOpenConfirmationModal(true)}
          variant={poolResult?.result ? "secondary" : "default"}
        >
          <SparklesIcon />
          Generate from Scene
        </Button>
        {poolResult && (
          <section className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5">
              <SparklesIcon className="shrink-0 text-primary-700" />
              <h3 className="text-gray-900 font-semibold">Generated result</h3>
            </div>
            <ResultGeneratedImages images={poolResult.result} />
          </section>
        )}
      </section>
    </>
  );
};

const ResultGeneratedImages = ({ images }: { images: string[] }) => {
  if (images.length === 0) return null;
  return (
    <div className="overflow-auto flex flex-row justify-center gap-3 px-6 py-2 rounded-2xl bg-primary-300 snap-x">
      {images.map((image, index) => (
        <Image
          key={index}
          alt={`result-${index}`}
          src={image}
          width={200}
          height={150}
          className="aspect-video object-cover snap-center rounded"
        />
      ))}
    </div>
  );
};

export default GenerateImageSection;
