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
import { amatic } from "@/styles/fonts";

type Props = {
  title: string;
  subheading: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

const CustomModal = ({ children, defaultOpen, subheading, title }: Props) => {
  const { isOpen, setClose } = useModal();
  return (
    <Dialog open={isOpen || defaultOpen} onOpenChange={setClose}>
      <DialogContent
        className={cn(
          "h-screen overflow-auto border-2 border-purple-500 bg-card dark:bg-gray-800 md:h-fit md:max-h-[700px]",
        )}
      >
        <DialogHeader className="text-left">
          <DialogTitle
            className={cn(
              "text-4xl font-bold text-purple-400",
              amatic.className,
            )}
          >
            {title}
          </DialogTitle>
          <DialogDescription className="text-xl text-purple-400">
            {subheading}
          </DialogDescription>
        </DialogHeader>
        <div className="font-sans"> {children}</div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomModal;
