"use client";
import { useModal } from "@/components/providers/modal-provider";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  subheading: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  contentClass?: string;
};

const CustomModal = ({
  children,
  defaultOpen,
  subheading,
  title,
  contentClass,
}: Props) => {
  const { isOpen, setClose } = useModal();
  return (
    <Dialog open={isOpen || defaultOpen} onOpenChange={setClose}>
      <DialogContent
        className={cn(
          contentClass,
          "!max-h-[80vh] overflow-auto !rounded-none border border-purple-500 bg-card dark:bg-gray-800",
        )}
      >
        <DialogHeader className="text-left">
          <DialogTitle className={cn("font-amatic text-4xl font-bold")}>
            {title}
          </DialogTitle>
          <DialogDescription className={cn("font-special text-md")}>
            {subheading}
          </DialogDescription>
        </DialogHeader>
        <div className="font-sans"> {children}</div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomModal;
