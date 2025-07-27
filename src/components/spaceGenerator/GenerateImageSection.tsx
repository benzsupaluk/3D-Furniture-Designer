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

import { Button } from "../ui/button";
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
  DownloadIcon,
  Share2Icon,
} from "lucide-react";

const GenerateImageSection = ({ className }: { className?: string }) => {
  const [openConfirmationModal, setOpenConfirmationModal] =
    useState<boolean>(false);
  const [hideResult, setHideResult] = useState<boolean>(false);

  const searchParams = useSearchParams();
  const interval = useRef<NodeJS.Timeout | null>(null);

  const { refId, setRefId, poolResult, setPoolResult } =
    useSpaceGeneratorStore();
  const { gl, camera, scene, setImageDataUrl } = useCanvasCaptureStore();
  const { addNotification } = useNotificationStore();

  const handleCapture = async () => {
    if (!gl || !camera || !scene) return;

    console.log("click");

    const originalPos = camera.position.clone();
    const originalRot = camera.rotation.clone();
    const originalSize = gl.getSize(new Vector2());
    const originalPixelRatio = gl.getPixelRatio();

    // Force front view
    camera.position.set(0, 10, 15);
    camera.lookAt(0, 0, 0);

    gl.render(scene, camera);

    // gl.domElement.toBlob((blob) => {
    //   console.log("blob");
    //   if (blob) {
    //     const imageUrl = URL.createObjectURL(blob);
    //     console.log("imageUrl", imageUrl);
    //     setImageDataUrl(imageUrl);

    //     setOpenConfirmationModal(true);
    //   }

    //   gl.setSize(originalSize.x, originalSize.y, false);
    //   gl.setPixelRatio(originalPixelRatio);
    //   camera.position.copy(originalPos);
    //   camera.rotation.copy(originalRot);
    // }, "image/png");
    const imageData = gl.domElement.toDataURL("image/png");
    setImageDataUrl(imageData);

    // gl.setSize(originalSize.x, originalSize.y, false);
    // gl.setPixelRatio(originalPixelRatio);
    camera.position.copy(originalPos);
    camera.rotation.copy(originalRot);

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
  }, [searchParams, refId]);

  useEffect(() => {
    if (!refId) return;

    const abortController = new AbortController();

    const clearState = () => {
      // const params = new URLSearchParams(searchParams.toString());
      // params.append("status", "uploaded");
      // window.history.replaceState(null, "", `?${params.toString()}`);
      // setRefId("");

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
          console.log("status", responseData);
          if (status === "failed" || status === "success") {
            alreadyUploaded = true;
            clearState();
          }
        } else {
          console.log("eeeee");
          clearState();
        }
      } catch (err: any) {
        console.log("error");
        if (err.name !== "AbortError") {
          console.error("Polling failed:", err);
          clearState();
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

  console.log("refId", refId);

  const generateButton = (
    <Button
      className="ml-auto"
      onClick={handleCapture}
      variant={poolResult?.result ? "ghost" : "default"}
      disabled={poolResult?.status === "processing"}
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
        {refId && poolResult && (
          <section className="flex flex-col">
            <div className="flex items-end justify-between">
              <div
                className={cn(
                  "flex items-center gap-1.5 bg-primary-50 w-fit px-4 py-1",
                  hideResult ? "rounded-2xl" : "rounded-t-2xl"
                )}
              >
                {poolResult.status === "success" ? (
                  <>
                    <SparklesIcon className="shrink-0 size-4 text-primary-700" />
                    <div className="text-primary-600 font-semibold">Result</div>
                  </>
                ) : poolResult.status === "processing" ? (
                  <div className="flex items-end gap-1">
                    <div className="text-gray-600 text-sm">
                      Loading result{" "}
                      <span className="text-xs">({poolResult.progress}%)</span>
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
              {poolResult?.status !== "processing" && generateButton}
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

                  <section className="overflow-auto h-35 flex flex-row gap-3 px-6 py-2 bg-primary-50 snap-x rounded-b-2xl rounded-r-2xl justify-center">
                    {poolResult?.status === "processing" && <LoaderImages />}
                    {poolResult?.status === "success" && (
                      <ResultGeneratedImages images={poolResult.result} />
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
      // setDirection(1);
      setCurrentIndex(images.length - 1);
      return;
    }
    setDirection(-1);
    setCurrentIndex(prevIndex);
  };
  const handleNextImage = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= images.length) {
      // setDirection(-1);
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
          {/* <div className="ml-auto flex items-center gap-4">
            <Button
              aria-label="Share image"
              className="ml-auto hover:scale-110"
              variant={"link"}
              size={"sm"}
            >
              <Share2Icon className="size-4" />
            </Button>
            <Button
              aria-label="Download image"
              className="ml-auto hover:scale-110"
              variant={"link"}
              size={"sm"}
              onClick={() =>
                handleDownloadImage(
                  imageUrl,
                  `generated-image-${currentIndex}.png`
                )
              }
            >
              <DownloadIcon className="size-4" />
            </Button>
          </div> */}
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
                width={400}
                height={400}
                className="object-contain w-[calc(100svw_-_200px)] 2xl:h-[650px] xl:h-[550px] md:h-[450px] h-[300px] data-[loaded=false]:animate-pulse data-[loaded=false]:bg-gray-100/10"
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
            >
              <ChevronRightCircleIcon />
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ResultGeneratedImages = ({ images }: { images: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  // const [zoomImage, setZoomImage] = useState<string>("");
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
          initial={{ x: 10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -10, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="hover:cursor-zoom-in snap-center"
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
