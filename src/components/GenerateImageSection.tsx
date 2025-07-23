"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import GenerateConfirmationModal from "./GenerateConfirmationModal";

import { SparklesIcon } from "lucide-react";

const GenerateImageSection = ({ className }: { className?: string }) => {
  const [openConfirmationModal, setOpenConfirmationModal] =
    useState<boolean>(false);

  return (
    <>
      <GenerateConfirmationModal
        open={openConfirmationModal}
        setOpen={setOpenConfirmationModal}
      />
      <section className={cn("flex", className)}>
        <Button
          className="ml-auto"
          onClick={() => setOpenConfirmationModal(true)}
        >
          <SparklesIcon />
          Generate from Scene
        </Button>
      </section>
    </>
  );
};

const ResultGeneratedImages = () => {
  return <></>;
};

export default GenerateImageSection;
