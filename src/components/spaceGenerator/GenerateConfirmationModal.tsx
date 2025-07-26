import { useId, useTransition } from "react";

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

import { useLoadingStore } from "@/stores/useLoadingStore";
import { useCanvasCaptureStore } from "@/stores/useCanvasCaptureStore";

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
  const { imageDataUrl } = useCanvasCaptureStore();
  const { spaceType, spaceStyle, setRefId } = useSpaceGeneratorStore();

  const [isPending, startTransition] = useTransition();

  const onClose = () => {
    setOpen(false);
  };

  const handleGenerateScene = () => {
    startTransition(async () => {
      setLoadingFullScreen(true);
      try {
        const body = {
          model: "spacely-v1",
          imageUrl: imageDataUrl,
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
          console.log(data);
          setRefId(data.data);
          const params = new URLSearchParams(searchParams.toString());
          params.set("refId", data.data);
          window.history.pushState(null, "", `?${params.toString()}`);
        }
      } catch (error) {
        console.log(error);
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
        <DialogBody>
          {/* screenshot */}
          <div className="bg-gray-50 mx-auto">
            {imageDataUrl && (
              <Image
                alt="Room simulator"
                src={imageDataUrl}
                width={400}
                height={400}
                className="object-contain h-[400px] w-auto"
                style={{ width: "auto", height: "400px" }}
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
