"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ChevronDownIcon, CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type TextDropdownProps = {
  items: string[];
  selectedItem: string;
  handleSetSelectedItem: (item: string, index: number) => void;
  placeholder?: string;
  label?: string;
  requiredLabel?: boolean;
  className?: string;
  dropdownClassName?: string;
  isItemsFullWidth?: boolean;
  getFormatText?: (item: string) => string;
};

const TextDropdown = ({
  items,
  selectedItem,
  handleSetSelectedItem,
  placeholder = "เลือก",
  label,
  requiredLabel,
  className,
  dropdownClassName,
  isItemsFullWidth,
  getFormatText,
}: TextDropdownProps) => {
  const inputId = useId();
  const containerRef = useRef<HTMLButtonElement>(null);

  const [containerWidth, setContainerWidth] = useState<number>(0);
  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current?.offsetWidth);
    }
  }, [containerRef.current]);

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label htmlFor={inputId} className="whitespace-nowrap">
          {label}
          {requiredLabel ? (
            <span className="text-error-600 inline font-medium">*</span>
          ) : (
            ""
          )}
        </label>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger
          ref={containerRef}
          className={cn(
            "w-full cursor-pointer hover:bg-gray-50 data-[state=open]:ring-4 ring-primary-shadow flex items-center justify-between gap-2 border border-gray-300 shadow-xs bg-white rounded-lg py-2.5 px-3.5",
            dropdownClassName
          )}
        >
          {getFormatText
            ? getFormatText(selectedItem)
            : selectedItem ?? (
                <span className="text-gray-500">{placeholder}</span>
              )}
          <ChevronDownIcon className="data-[state=open]:rotate-180 text-gray-500 size-5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          style={
            containerWidth
              ? {
                  maxWidth: containerWidth,
                  width: isItemsFullWidth ? containerWidth : "100%",
                }
              : {
                  maxWidth: `calc(100svw - 32px)`,
                }
          }
          className={cn("sm:min-w-[240px]")}
        >
          {items.map((item, index) => {
            const isSelected = selectedItem === item;
            return (
              <DropdownMenuItem
                key={index}
                className="flex items-start justify-between"
                onClick={() => {
                  handleSetSelectedItem(item, index);
                }}
              >
                <span>{getFormatText ? getFormatText(item) : item}</span>
                {isSelected && (
                  <CheckIcon className="size-4 text-primary-600 shrink-0 mt-0.5" />
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default TextDropdown;
