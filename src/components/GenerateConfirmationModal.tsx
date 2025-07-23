import { useId, useTransition } from "react";

import Image from "next/image";

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

import { useSimulatorStore } from "@/stores/useSimulatorStore";

import { cn } from "@/lib/utils";

import { SparklesIcon } from "lucide-react";

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
  const { loadingFullScreen, setLoadingFullScreen } = useSimulatorStore();
  const [isPending, startTransition] = useTransition();

  const onClose = () => {
    setOpen(false);
  };

  const handleGenerateScene = () => {
    startTransition(async () => {
      try {
        setLoadingFullScreen(true);

        await new Promise((r) => setTimeout(r, 2000));
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
          <div className="w-40 h-40 bg-gray-50 mx-auto"></div>
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
