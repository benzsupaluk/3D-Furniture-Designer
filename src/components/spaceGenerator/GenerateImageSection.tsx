"use client";

import { useState, useEffect, useRef, useId, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import * as motion from "motion/react-client";
import { AnimatePresence } from "motion/react";
import { PerspectiveCamera, Vector2 } from "three";

import { useSpaceGeneratorStore } from "@/stores/useSpaceGeneratorStore";
import { useCanvasCaptureStore } from "@/stores/useCanvasCaptureStore";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { useSimulatorStore } from "@/stores/useSimulatorStore";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import GenerateConfirmationModal from "./GenerateConfirmationModal";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  RefreshCwIcon,
  SparklesIcon,
  ChevronDown,
  ChevronLeftCircleIcon,
  ChevronRightCircleIcon,
  InfoIcon,
} from "lucide-react";

const GenerateImageSection = ({ className }: { className?: string }) => {
  const [openConfirmationModal, setOpenConfirmationModal] =
    useState<boolean>(false);
  const [hideResult, setHideResult] = useState<boolean>(false);
  const [errorState, setErrorState] = useState<boolean>(false);

  const searchParams = useSearchParams();
  const interval = useRef<NodeJS.Timeout | null>(null);

  const { refId, setRefId, poolResult, setPoolResult } =
    useSpaceGeneratorStore();
  const { gl, camera, scene, setImageDataUrl } = useCanvasCaptureStore();
  const { addNotification } = useNotificationStore();
  const { setSelectedFurnitureId } = useSimulatorStore();

  const setLabelsVisibility = (visible: boolean) => {
    scene?.traverse((object) => {
      if (object.name.startsWith("label:")) {
        object.visible = visible;
      }
    });
  };

  const handleCapture = async () => {
    setSelectedFurnitureId("");

    if (!gl || !camera || !scene) return;

    setLabelsVisibility(false);

    const originalSize = gl.getSize(new Vector2());
    const originalPixelRatio = gl.getPixelRatio();

    const perspectiveCamera = camera as PerspectiveCamera;
    const originalFov = perspectiveCamera.fov;

    const scaleFactor = 1;
    const newWidth = originalSize.x * scaleFactor;
    const newHeight = originalSize.y * scaleFactor;

    gl.setSize(newWidth, newHeight, false);
    gl.setPixelRatio(originalPixelRatio * scaleFactor);

    gl.render(scene, camera);

    const imageData = gl.domElement.toDataURL("image/png");
    setImageDataUrl(imageData);

    gl.setSize(originalSize.x, originalSize.y, false);
    gl.setPixelRatio(originalPixelRatio);

    perspectiveCamera.fov = originalFov;
    perspectiveCamera.updateProjectionMatrix();
    setLabelsVisibility(true);

    if (imageData) {
      setOpenConfirmationModal(true);
    } else {
      addNotification({
        title: `Error`,
        description:
          "Sorry, we are unable to generate image from canvas. Please try again.",
        state: "error",
      });
    }
  };

  useEffect(() => {
    if (searchParams.get("refId") && !refId) {
      setRefId(searchParams.get("refId") as string);
    }
  }, [searchParams]);

  const clearRefId = () => {
    setRefId("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("refId");
    window.history.replaceState(null, "", `?${params.toString()}`);
  };

  useEffect(() => {
    if (!refId) return;
    setErrorState(false);

    const abortController = new AbortController();

    const clearState = () => {
      if (interval.current) {
        clearInterval(interval.current);
        interval.current = null;
      }
    };

    let alreadyUploaded = false;
    const pollingResultImages = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/v1/generate/poll-result?refId=${refId}`,
          {
            method: "GET",
            headers: {
              "X-API-KEY": process.env.NEXT_PUBLIC_API_KEY || "",
            },
            signal: abortController.signal,
          }
        );

        if (response.ok) {
          const responseData = await response.json();
          setPoolResult(responseData?.data);

          const status = responseData?.data?.status;

          if (status === "failed" || status === "success") {
            alreadyUploaded = true;
            if (status === "success") {
              addNotification({
                title: `Completed space generation`,
                description:
                  "We have successfully generated image from Space Generator API.",
                state: "success",
              });
            } else {
              addNotification({
                title: `Failed to generate space`,
                description:
                  "Sorry, we are unable to generate image from Space Generator API.",
                state: "error",
              });
            }
            clearState();
          }
        } else {
          throw new Error("Upload to fetch space generator result");
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Polling failed:", err);
          alreadyUploaded = true;
          clearState();
          setErrorState(true);
          addNotification({
            title: `Error: ${err.message}`,
            description:
              "Sorry, we are unable to get generated image from Space Generator API.",
            state: "error",
          });
          clearRefId();
        }
      }
    };

    pollingResultImages();
    if (!alreadyUploaded) {
      interval.current = setInterval(() => {
        pollingResultImages();
      }, 5000);
    }

    return () => {
      abortController.abort();
      clearState();
    };
  }, [refId]);

  const generateButton = (
    <div className="flex items-center justify-end gap-2 pb-0.5">
      <Tooltip>
        <TooltipTrigger asChild>
          <InfoIcon className="size-4 text-gray-500" />
        </TooltipTrigger>
        <TooltipContent className="text-sm text-gray-600 max-w-60">
          <p>
            Make sure to zoom, pan, or rotate the scene to your desired angle
            before clicking "Generate from Scene" to capture a screenshot.
          </p>
        </TooltipContent>
      </Tooltip>
      <Button
        onClick={handleCapture}
        variant={poolResult?.result ? "ghost-secondary" : "default"}
        disabled={poolResult?.status === "processing"}
      >
        {poolResult?.result ? <RefreshCwIcon /> : <SparklesIcon />}
        Generate from Scene
      </Button>
    </div>
  );

  return (
    <>
      <Suspense fallback={<></>}>
        <GenerateConfirmationModal
          open={openConfirmationModal}
          setOpen={setOpenConfirmationModal}
        />
      </Suspense>
      <section className={cn("flex flex-col gap-3", className)}>
        {!poolResult?.result && !refId && generateButton}
        {refId && poolResult && (
          <section className="flex flex-col">
            <div className="flex items-end justify-between">
              <div className="flex items-end gap-2 grow">
                <div
                  className={cn(
                    "flex items-center gap-1.5 bg-primary-50 w-fit px-4 py-1",
                    hideResult ? "rounded-2xl" : "rounded-t-2xl"
                  )}
                >
                  {poolResult.status === "success" ? (
                    <>
                      <SparklesIcon className="shrink-0 size-4 text-primary-700" />
                      <div className="text-primary-600 font-semibold">
                        Result
                      </div>
                    </>
                  ) : poolResult.status === "processing" ? (
                    <div className="flex items-end gap-1">
                      <div className="text-gray-600 text-sm">
                        Loading result{" "}
                        <span className="text-xs">
                          ({poolResult.progress}%)
                        </span>
                      </div>
                      <div className="flex gap-0.5 mb-1.5">
                        <div className="h-1 w-1 bg-gray-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="h-1 w-1 bg-gray-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="h-1 w-1 bg-gray-600 rounded-full animate-bounce"></div>
                      </div>
                    </div>
                  ) : (
                    <></>
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
              </div>
              {poolResult?.status !== "processing" && generateButton}
            </div>

            <AnimatePresence>
              <motion.div
                animate={{
                  opacity: hideResult ? 0 : 1,
                  y: hideResult ? -10 : 0,
                  height: hideResult ? 0 : "auto",
                }}
                initial={false}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                style={{ overflow: "hidden" }}
                className="shrink-0"
              >
                {/* loading bar */}
                {poolResult?.status === "processing" && (
                  <div className="relative w-full h-2 bg-primary-300 overflow-hidden rounded-tr-md -mb-2">
                    <div
                      style={{ width: `${poolResult.progress}%` }}
                      className={cn(
                        "absolute h-full left-0 bg-primary-600 rounded-r-xl"
                      )}
                    ></div>
                  </div>
                )}

                <section className="overflow-auto h-35 flex flex-row gap-3 px-6 py-2 bg-primary-50 rounded-b-2xl rounded-r-2xl justify-center">
                  {poolResult?.status === "processing" && <LoaderImages />}
                  <ResultGeneratedImages
                    className={cn(poolResult?.status !== "success" && "hidden")}
                    images={poolResult.result}
                  />
                </section>
              </motion.div>
            </AnimatePresence>
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

type DisplayImageModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  images: string[];
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  className?: string;
};

const DisplayImageModal = ({
  open,
  setOpen,
  images,
  currentIndex,
  setCurrentIndex,
  className,
}: DisplayImageModalProps) => {
  const id = useId();
  const [direction, setDirection] = useState<1 | -1>(1);

  const imageUrl = images[currentIndex];

  const handlePreviousImage = () => {
    const prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      setCurrentIndex(images.length - 1);
      return;
    }
    setDirection(-1);
    setCurrentIndex(prevIndex);
  };
  const handleNextImage = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= images.length) {
      setCurrentIndex(0);
      return;
    }
    setDirection(1);
    setCurrentIndex(nextIndex);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      handleNextImage();
    } else if (e.key === "ArrowLeft") {
      handlePreviousImage();
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, open]);

  return (
    <Dialog key={id} open={open} onOpenChange={setOpen}>
      <DialogContent showCloseButton={false} className={cn(className)}>
        <DialogHeader className={cn("relative")}>
          <DialogTitle className={""}></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <DialogBody className="px-2 relative ">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={imageUrl}
              initial={{ x: direction === 1 ? 100 : -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction === 1 ? -100 : 100, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Image
                alt={`Image ${currentIndex + 1}`}
                src={imageUrl}
                width={640}
                height={640}
                className="object-contain xl:h-[640px] md:h-[600px] sm:h-[550px] h-[500px] data-[loaded=false]:animate-pulse data-[loaded=false]:bg-gray-100/10"
                data-loaded="false"
                onLoad={(event) => {
                  event.currentTarget.setAttribute("data-loaded", "true");
                }}
                placeholder="blur"
                blurDataURL="/images/placeholder_md.webp"
              />
            </motion.div>
          </AnimatePresence>
        </DialogBody>
        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <Button
              aria-label="Previous image"
              variant={"secondary"}
              onClick={handlePreviousImage}
            >
              <ChevronLeftCircleIcon />
            </Button>
            <div className="text-sm text-gray-500">
              {currentIndex + 1} of {images.length}
            </div>
            <Button
              aria-label="Next image"
              variant={"secondary"}
              onClick={handleNextImage}
              autoFocus
            >
              <ChevronRightCircleIcon />
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ResultGeneratedImages = ({
  images,
  className,
}: {
  images: string[];
  className?: string;
}) => {
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);

  const open = currentIndex !== null;

  if (images.length === 0) return null;
  return (
    <>
      {open && (
        <DisplayImageModal
          open={open}
          setOpen={(state) => {
            if (!state) setCurrentIndex(null);
          }}
          images={images}
          currentIndex={currentIndex ?? 0}
          setCurrentIndex={setCurrentIndex}
        />
      )}
      {images.map((image, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={cn("hover:cursor-zoom-in snap-center", className)}
          onClick={() => setCurrentIndex(index)}
        >
          <Image
            alt={`result-${index}`}
            src={image}
            width={200}
            height={140}
            className="h-[120px] w-auto object-contain rounded"
          />
        </motion.div>
      ))}
    </>
  );
};

export default GenerateImageSection;
