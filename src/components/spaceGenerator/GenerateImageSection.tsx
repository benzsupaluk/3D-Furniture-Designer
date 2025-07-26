"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import * as motion from "motion/react-client";
import { AnimatePresence } from "motion/react";
import { PerspectiveCamera, Vector2 } from "three";

import { useSpaceGeneratorStore } from "@/stores/useSpaceGeneratorStore";
import { useCanvasCaptureStore } from "@/stores/useCanvasCaptureStore";

import { Button } from "../ui/button";
import GenerateConfirmationModal from "./GenerateConfirmationModal";

import { RefreshCwIcon, SparklesIcon, ChevronDown } from "lucide-react";

const GenerateImageSection = ({ className }: { className?: string }) => {
  const [openConfirmationModal, setOpenConfirmationModal] =
    useState<boolean>(false);
  const [hideResult, setHideResult] = useState<boolean>(false);

  const searchParams = useSearchParams();
  const interval = useRef<NodeJS.Timeout | null>(null);

  const { refId, setRefId, poolResult, setPoolResult } =
    useSpaceGeneratorStore();
  const { gl, camera, scene, setImageDataUrl } = useCanvasCaptureStore();

  const handleCapture = () => {
    if (!gl || !camera || !scene) return;

    const originalPos = camera.position.clone();
    const originalRot = camera.rotation.clone();
    const originalSize = gl.getSize(new Vector2());
    const originalPixelRatio = gl.getPixelRatio();
    // const originalAspect = camera.aspect;

    const targetWidth = 1920;
    const targetHeight = 1080;
    gl.setSize(targetWidth, targetHeight, false);
    gl.setPixelRatio(1);
    (camera as PerspectiveCamera).aspect = targetWidth / targetHeight;

    // Force front view
    camera.position.set(0, 10, 15);
    camera.lookAt(0, 0, 0);

    gl.render(scene, camera);
    const img = gl.domElement.toDataURL("image/png");
    setImageDataUrl(img);

    // Restore original size and camera
    gl.setSize(originalSize.x, originalSize.y, false);
    gl.setPixelRatio(originalPixelRatio);
    camera.position.copy(originalPos);
    camera.rotation.copy(originalRot);

    // Open modal
    setOpenConfirmationModal(true);
  };

  useEffect(() => {
    if (searchParams.get("refId") && !refId) {
      setRefId(searchParams.get("refId") as string);
    }
  }, [searchParams, refId]);

  useEffect(() => {
    if (!refId) return;

    const clearState = () => {
      setRefId("");
      if (interval.current) {
        clearInterval(interval.current);
      }
      window.history.pushState(null, "", ``);
    };
    interval.current = setInterval(async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/v1/generate/poll-result?refId=${refId}`,
          {
            method: "GET",
            headers: {
              "X-API-KEY": process.env.NEXT_PUBLIC_API_KEY || "",
            },
          }
        );
        if (response.ok) {
          const responseData = await response.json();
          // success
          if (responseData?.data?.status === "success") {
            setPoolResult(responseData.data);
            clearState();
            return;
          }
          // failed
          if (responseData?.date?.status === "failed") {
            clearState();
          }
        }
      } catch (err) {
        console.error("Polling failed:", err);
        clearState();
      }
    }, 60000);

    return () => {
      clearState();
    };
  }, [refId]);

  const generateButton = (
    <Button
      className="ml-auto"
      onClick={handleCapture}
      variant={poolResult?.result ? "ghost" : "default"}
      disabled={refId !== null}
    >
      {poolResult?.result ? <RefreshCwIcon /> : <SparklesIcon />}
      Generate from Scene
    </Button>
  );

  return (
    <>
      <GenerateConfirmationModal
        open={openConfirmationModal}
        setOpen={setOpenConfirmationModal}
      />
      <section className={cn("flex flex-col gap-3", className)}>
        {!poolResult?.result && !refId && generateButton}
        {poolResult && (
          <section className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5">
              <SparklesIcon className="shrink-0 text-primary-700" />
              <h3 className="text-gray-900 font-semibold">Generated result</h3>
            </div>
            <ResultGeneratedImages images={poolResult.result} />
          </section>
        )}
        {refId && (
          <section className="flex flex-col">
            <div className="flex items-end justify-between">
              <div
                className={cn(
                  "flex items-center gap-1.5 bg-primary-50 w-fit px-4 py-1",
                  hideResult ? "rounded-2xl" : "rounded-t-2xl"
                )}
              >
                {poolResult?.result ? (
                  <>
                    <SparklesIcon className="shrink-0 text-primary-700" />
                    <div className="text-primary-600 font-semibold">Result</div>
                  </>
                ) : (
                  <div className="flex items-end gap-1">
                    <span className="text-gray-600 text-sm">
                      Loading result
                    </span>
                    <div className="flex gap-0.5 mb-1.5">
                      <div className="h-1 w-1 bg-gray-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="h-1 w-1 bg-gray-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="h-1 w-1 bg-gray-600 rounded-full animate-bounce"></div>
                    </div>
                  </div>
                )}
              </div>
              <Button
                variant={`icon`}
                className=""
                size={`xs`}
                onClick={() => setHideResult(!hideResult)}
              >
                {!hideResult ? `Hide` : `Show`}
                <div className="w-3">
                  <ChevronDown
                    className={cn(
                      "transition-transform",
                      hideResult ? "rotate-180" : ""
                    )}
                  />
                </div>
              </Button>
              {poolResult?.result && generateButton}
            </div>
            {!hideResult && (
              <AnimatePresence>
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  className="shrink-0"
                >
                  <div className="relative w-full h-2 bg-primary-50 overflow-hidden rounded-tr-md -mb-2">
                    <motion.div
                      className="absolute top-0 h-full w-full rounded bg-primary-300"
                      initial={{ x: "-100%" }}
                      animate={{ x: "100%" }}
                      transition={{
                        repeat: Infinity,
                        repeatType: "loop",
                        duration: 3,
                        ease: "linear",
                      }}
                    />
                  </div>
                  <section className="overflow-auto h-35 flex flex-row gap-3 px-6 py-2 bg-primary-50 snap-x rounded-b-2xl rounded-r-2xl">
                    {!poolResult?.result ? (
                      <LoaderImages />
                    ) : (
                      <ResultGeneratedImages
                        images={[
                          "https://images.unsplash.com/photo-1605774337664-7a846e9cdf17?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                          "https://images.unsplash.com/photo-1605774337664-7a846e9cdf17?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                        ]}
                      />
                    )}
                  </section>
                </motion.div>
              </AnimatePresence>
            )}
          </section>
        )}
      </section>
    </>
  );
};

const LoaderImages = () => {
  return (
    <>
      {[...Array(4)].map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded aspect-video h-[120px] w-auto bg-white/80"
        ></div>
      ))}
    </>
  );
};

const ResultGeneratedImages = ({ images }: { images: string[] }) => {
  if (images.length === 0) return null;
  return (
    <>
      {images.map((image, index) => (
        <motion.div
          key={index}
          initial={{ x: 10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -10, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Image
            alt={`result-${index}`}
            src={image}
            width={200}
            height={140}
            className="aspect-video h-[120px] w-auto object-contain snap-center rounded"
          />
        </motion.div>
      ))}
    </>
  );
};

export default GenerateImageSection;
