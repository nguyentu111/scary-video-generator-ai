"use client";
import { useModal } from "@/components/providers/modal-provider";
import CustomModal from "@/components/shared/custom-modal";
import { Button } from "@/components/ui/button";
import { PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Popover } from "@radix-ui/react-popover";
import { useMutation } from "convex/react";
import {
  DownloadIcon,
  EllipsisVertical,
  ImageIcon,
  LoaderIcon,
  PlusCircleIcon,
  TrashIcon,
} from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { useDebounceCallback } from "usehooks-ts";
import { api } from "~/convex/_generated/api";
import { Doc } from "~/convex/_generated/dataModel";
import { ImagePromtChangeForm } from "./image-prompt-form";

export function SegmentItem({
  segment,
  index,
  canDelete,
}: {
  segment: Doc<"storySegments">;
  index: number;
  canDelete: boolean;
}) {
  const mutateSaveText = useMutation(api.storySegments.edit);
  const ref = useRef<HTMLDivElement | null>(null);
  const { setOpen } = useModal();
  const handleSaveText = useDebounceCallback(async () => {
    await mutateSaveText({
      id: segment._id,
      text: ref.current?.textContent ?? "",
      imagePrompt: segment.imagePrompt,
    });
  }, 1000);

  const handleDownload = (imageUrl: string, fileName: string) => {
    const link = document.createElement("a");
    link.target = "blank";
    link.href = imageUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const mutateAddSegment = useMutation(api.storySegments.insert);
  const handleAddSegment = async () => {
    await mutateAddSegment({
      imagePrompt: "",
      storyId: segment.storyId,
      text: "",
      order: segment.order + 1,
    });
  };

  const [isDeletingSegment, setIsDeletingSegment] = useState(false);
  const mutateDeleteSegment = useMutation(api.storySegments.deleteSegment);
  const mutateRegenerateImage = useMutation(api.images.regenerateImage);
  const mutateAutoGenerate = useMutation(api.storySegments.autoGenerateImage);

  return (
    <div className="relative flex flex-col rounded-xl border border-purple-500">
      <div
        onClick={() => handleAddSegment()}
        className="absolute -right-0 top-1/2 z-50 -translate-y-1/2 translate-x-1/2 transform"
      >
        <Button className="h-8 w-8 rounded-full bg-purple-600/50 !p-0">
          <PlusCircleIcon className="h-6" />
        </Button>
      </div>

      <div className="flex justify-between rounded-t-xl border-b border-purple-500 bg-gray-800 px-4 py-2">
        <span>Segment {index}</span>
        <Popover>
          <PopoverTrigger>
            <EllipsisVertical />
          </PopoverTrigger>
          <PopoverContent
            className="w-fit rounded-lg border border-purple-500 !p-0"
            align="end"
          >
            <div className="">
              {segment.imageStatus.status === "saved" ? (
                <div
                  onClick={() =>
                    handleDownload(
                      //@ts-ignore
                      segment.imageStatus.imageUrl,
                      `Segment_${index + 1}.png}`,
                    )
                  }
                  className="flex cursor-pointer items-center gap-2 rounded-t-lg border-b border-purple-500 px-4 py-2 text-sm dark:bg-gray-900 dark:hover:bg-black"
                >
                  <DownloadIcon className="h-4 w-4" />
                  Download image
                </div>
              ) : null}
              <div
                onClick={() =>
                  setOpen(
                    <CustomModal
                      title="Change prompt"
                      subheading="Modify the prompt used for generating your segment image."
                    >
                      <ImagePromtChangeForm
                        prompt={segment.imagePrompt}
                        segmentId={segment._id}
                        submitText="Regenerate"
                      />
                    </CustomModal>,
                  )
                }
                className="flex cursor-pointer items-center gap-2 border-b border-purple-500 px-4 py-2 text-sm dark:bg-gray-900 dark:hover:bg-black"
              >
                <ImageIcon className="h-4 w-4" />
                Change image prompt
              </div>
              <Button
                disabled={!canDelete}
                onClick={async () => {
                  if (!isDeletingSegment) {
                    setIsDeletingSegment(true);
                    await mutateDeleteSegment({ id: segment._id });
                  }
                }}
                className="flex cursor-pointer items-center gap-2 rounded-b-lg border-b border-purple-500 px-4 py-2 text-sm text-rose-500 dark:bg-gray-900"
              >
                <TrashIcon className="h-4 w-4" />
                {isDeletingSegment ? "Deleting..." : "Delete this segment"}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="aspect-video bg-gray-900">
        {segment.imageStatus.status === "saved" ? (
          <Image
            src={segment.imageStatus.imageUrl}
            height={300}
            width={533}
            className={cn("m-auto aspect-video h-full w-full object-contain")}
            alt={segment.imagePrompt}
          />
        ) : segment.imageStatus.status === "pending" ? (
          <div className="flex h-full w-full items-center justify-center gap-2">
            <span>Generating image </span>
            <LoaderIcon className="h-5 w-5 animate-spin" />
          </div>
        ) : segment.imageStatus.status === "failed" ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-4">
            <div className="flex items-center gap-2 text-red-500">
              <span>Error generating image: {segment.imageStatus.reason}</span>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={async () => {
                  if (segment.imagePrompt) {
                    // If we already have a prompt, just regenerate the image
                    await mutateRegenerateImage({
                      segmentId: segment._id,
                      prompt: segment.imagePrompt,
                    });
                  } else {
                    // If no prompt, generate one first then create image
                    await mutateAutoGenerate({
                      segmentId: segment._id,
                    });
                  }
                }}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                Regenerate Image
              </Button>
            </div>
          </div>
        ) : (
          <div
            className={
              "flex h-full w-full items-center justify-center gap-4 font-special"
            }
          >
            <Button
              disabled={segment.text.length < 10}
              onClick={async () => {
                await mutateAutoGenerate({
                  segmentId: segment._id,
                });
              }}
            >
              Auto generate
            </Button>
            <Button
              onClick={() =>
                setOpen(
                  <CustomModal
                    title="Generate with your prompt"
                    subheading="Modify the prompt used for generating your segment image."
                  >
                    <ImagePromtChangeForm
                      prompt={segment.imagePrompt}
                      segmentId={segment._id}
                      submitText="Generate"
                    />
                  </CustomModal>,
                )
              }
            >
              Generate with prompt
            </Button>
          </div>
        )}
      </div>

      <div
        className={cn(
          "min-h-[100px] w-full flex-1 rounded-b-xl border-t border-t-purple-500 bg-gray-900 px-4 py-2 text-sm",
        )}
        contentEditable
        ref={ref}
        onInput={() => handleSaveText()}
      >
        {segment.text}
      </div>
    </div>
  );
}
