import { useId, useTransition, useEffect } from "react";

import Image from "next/image";
import { useSearchParams } from "next/navigation";

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import TextDropdown from "@/components/common/TextDropdown";

import { useLoadingStore } from "@/stores/useLoadingStore";
import { useCanvasCaptureStore } from "@/stores/useCanvasCaptureStore";
import { useNotificationStore } from "@/stores/useNotificationStore";

import { cn } from "@/lib/utils";

import { SparklesIcon } from "lucide-react";
import { useSpaceGeneratorStore } from "@/stores/useSpaceGeneratorStore";

type GenerateConfirmationModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  className?: string;
};

const GenerateConfirmationModal = ({
  open,
  setOpen,
  className,
}: GenerateConfirmationModalProps) => {
  const dialogId = useId();
  const searchParams = useSearchParams();

  const { loadingFullScreen, setLoadingFullScreen } = useLoadingStore();
  const { imageDataUrl, clearImageDataUrl } = useCanvasCaptureStore();
  const {
    spaceType,
    setSpaceType,
    spaceTypeOptions,
    spaceStyleOptions,
    spaceStyle,
    setSpaceStyle,
    setRefId,
  } = useSpaceGeneratorStore();
  const { addNotification } = useNotificationStore();

  const [isPending, startTransition] = useTransition();

  const spaceTypeNameList = spaceTypeOptions.map((type) => type.name);
  const selectedTypeName = spaceTypeOptions.find(
    (type) => type.key === spaceType
  )?.name;
  const spaceStyleNameList = spaceStyleOptions.map((style) => style.name);
  const selectedStyleName = spaceStyleOptions.find(
    (style) => style.key === spaceStyle
  )?.name;

  const onClose = () => {
    clearImageDataUrl();
    setOpen(false);
  };

  const handleGenerateScene = () => {
    if (!imageDataUrl) return;

    startTransition(async () => {
      setLoadingFullScreen(true);
      // Upload image to R2
      let uploadedImageUrl = "";
      try {
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            base64: imageDataUrl,
          }),
        });
        const data = await uploadResponse.json();
        if (uploadResponse.ok) {
          uploadedImageUrl = data.url;
        } else {
          throw new Error(data.error || "Upload to R2 failed");
        }

        const body = {
          model: "spacely-v1",
          imageUrl: uploadedImageUrl,
          spaceType: spaceType,
          spaceStyle: spaceStyle,
          renovateType: "residential",
        };
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/v1/generate/standard`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-API-KEY": process.env.NEXT_PUBLIC_API_KEY || "",
            },
            body: JSON.stringify(body),
          }
        );
        if (response.ok) {
          const data = await response.json();

          setRefId(data.data);
          const params = new URLSearchParams(searchParams.toString());
          params.set("refId", data.data);
          window.history.pushState(null, "", `?${params.toString()}`);
        } else {
          throw new Error(data.error || "Upload to space generator failed");
        }
      } catch (error) {
        console.error(error);
        addNotification({
          title: `Error`,
          description:
            "Sorry, we are unable to generate image from canvas. Please try again.",
          state: "error",
        });
      } finally {
        setLoadingFullScreen(false);
        onClose();
      }
    });
  };

  return (
    <Dialog key={dialogId} open={open} onOpenChange={setOpen}>
      <DialogContent
        className={cn(className)}
        style={loadingFullScreen ? { zIndex: 0 } : {}}
      >
        <DialogHeader className={cn("relative")}>
          <DialogTitle className={"text-gray-900"}>
            Confirm Image Generation
          </DialogTitle>
          <DialogDescription>
            Send the screenshot to generate a styled version
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-4">
          {/* Options */}
          <div className="flex flex-row w-full items-end gap-4 pt-1">
            {/* Space type selection */}
            <TextDropdown
              items={spaceTypeNameList}
              selectedItem={selectedTypeName || ""}
              handleSetSelectedItem={(_, index) => {
                setSpaceType(spaceTypeOptions[index].key);
              }}
              label="Space Type:"
              placeholder="Select space type"
              className="flex flex-row items-center gap-3 text-sm"
            />
            <div className="h-10 w-px bg-gray-300"></div>
            {/* Space style selection */}
            <TextDropdown
              items={spaceStyleNameList}
              selectedItem={selectedStyleName || ""}
              handleSetSelectedItem={(_, index) => {
                setSpaceStyle(spaceStyleOptions[index].key);
              }}
              label="Space Style:"
              placeholder="Select space style"
              className="flex flex-row items-center gap-3 text-sm"
            />
          </div>
          {/* Screenshot */}
          <div className="bg-gray-50 mx-auto flex overflow-auto">
            {imageDataUrl && (
              <Image
                alt="Room simulator"
                src={imageDataUrl}
                width={400}
                height={400}
                className="object-contain h-[600px] max-h-[100svh_-_64px] w-[600px]"
              />
            )}
          </div>
        </DialogBody>
        <DialogFooter className="flex items-center gap-3">
          <Button
            variant={`secondary`}
            className="grow basis-0"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            autoFocus
            className="grow basis-0"
            onClick={handleGenerateScene}
            disabled={isPending}
          >
            <SparklesIcon />
            Generate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GenerateConfirmationModal;
