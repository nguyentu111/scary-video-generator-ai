"use client";
import { useModal } from "@/components/providers/modal-provider";
import CustomModal from "@/components/shared/custom-modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMutation } from "convex/react";
import { Loader2Icon, Monitor, SmartphoneIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";

export const VideoFormatPopup = ({
  credits,
  content,
}: {
  credits: number;
  content: string;
}) => {
  const params = useParams();
  const [videoFormat, setVideoFormat] = useState<"16:9" | "9:16">("9:16");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setClose } = useModal();
  const router = useRouter();
  const mutateGenerate = useMutation(api.stories.onDoneRefine);

  const handleGenerate = async () => {
    setIsSubmitting(true);
    await mutateGenerate({
      id: params.storyId as Id<"stories">,
      format: videoFormat,
      content,
    });
    setIsSubmitting(false);
    setClose();
    router.push("/stories/" + params.storyId);
  };

  return (
    <CustomModal
      title="Choose Video Orientation"
      subheading="Choose between vertical (TikTok/YouTube Shorts) or horizontal (standard 1080p) format."
    >
      <div className="font-special text-sm text-purple-100">
        <p>
          Vertical videos are ideal for platforms like TikTok and Instagram
          Reels.
        </p>
        <p className="mt-1">
          Horizontal videos are better suited for YouTube and traditional video
          players.
          <p className="mt-2 font-bold">
            Note: Once set, the orientation cannot be changed without
            regenerating all images, so choose carefully!
          </p>
        </p>
        <div className="mt-4 flex gap-2">
          <Button
            type="button"
            onClick={() => setVideoFormat("9:16")}
            className={cn(
              "flex w-full items-center justify-center gap-2 font-special",
              videoFormat === "9:16" ? "bg-primary" : "!bg-gray-600",
            )}
          >
            <SmartphoneIcon className="h-4 w-4" /> Vertical
          </Button>
          <Button
            type="button"
            onClick={() => setVideoFormat("16:9")}
            className={cn(
              "flex w-full items-center justify-center gap-2 font-special",
              videoFormat === "16:9" ? "bg-primary" : "!bg-gray-600",
            )}
          >
            <Monitor className="h-4 w-4" /> Horizontal
          </Button>
        </div>
        <div className="mt-8 flex justify-end gap-2">
          <Button
            type="button"
            onClick={() => setClose()}
            variant="outline"
            className="font-special"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleGenerate}
            className="font-special"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : (
              <>Generate ({credits} credits)</>
            )}
          </Button>
        </div>
      </div>
    </CustomModal>
  );
};
