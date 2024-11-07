"use client";
import { useModal } from "@/components/providers/modal-provider";
import CustomModal from "@/components/shared/custom-modal";
import { Button } from "@/components/ui/button";
import { PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { Popover } from "@radix-ui/react-popover";
import { useMutation, useQuery } from "convex/react";
import { Eye, EllipsisVertical, Trash2, LoaderIcon } from "lucide-react";
import { useState, useMemo } from "react";
import { api } from "~/convex/_generated/api";
import { Doc } from "~/convex/_generated/dataModel";
import { UploadToYoutubeForm } from "./upload-youtube-form";
import { YoutubeIcon } from "../icons/youtubeIcon";

export function VideoItem({ video }: { video: Doc<"videos"> }) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const channels = useQuery(api.channels.getUserChannels);
  const mutateDelete = useMutation(api.videos.deleteVideo);
  const videoSegments = useQuery(api.videoSegments.getByVideoId, {
    videoId: video._id,
  });

  const currentStatus = useMemo(() => {
    if (!videoSegments) return { percent: 0, message: "Loading" };
    const voiceGeneratedCount =
      videoSegments?.filter(
        (s) =>
          s.voiceStatus.status === "saved" || s.voiceStatus.status === "cached",
      ).length ?? 0;
    const videoGeneratedCount =
      videoSegments?.filter(
        (s) =>
          s.videoStatus.status === "saved" || s.videoStatus.status === "cached",
      ).length ?? 0;
    const voiceStatus = videoSegments.reduce((acc, curr) => {
      return (acc +=
        "Voice " +
        curr.order +
        ": " +
        (curr.voiceStatus.status === "failed"
          ? curr.voiceStatus.reason
          : curr.voiceStatus.status) +
        "\n");
    }, "");
    const videoStatus = videoSegments.reduce((acc, curr) => {
      return (acc +=
        "Video " +
        curr.order +
        ": " +
        (curr.videoStatus.status === "failed"
          ? curr.videoStatus.reason
          : curr.videoStatus.status) +
        "  \n");
    }, "");
    const percent =
      parseFloat(
        ((0.3 * voiceGeneratedCount) / videoSegments.length).toFixed(2),
      ) +
      parseFloat(
        ((0.6 * videoGeneratedCount) / videoSegments.length).toFixed(2),
      );
    return {
      percent,
      message:
        voiceStatus +
        "\n" +
        videoStatus +
        (videoGeneratedCount === videoSegments.length ? "Merging video" : ""),
    };
  }, [videoSegments]);

  const { setOpen, setClose } = useModal();

  const handleDelete = async () => {
    setIsDeleting(true);
    await mutateDelete({ id: video._id });
    toast({
      title: "Success",
      description: "Delete video successfully",
    });
    setClose();
  };

  return (
    <div className="rounded-lg border-2 border-purple-500 shadow-purple-500 transition-all hover:shadow-lg">
      <div className="flex justify-between">
        <div className="p-2"> {video.name}</div>
        {video.result.status !== "pending" && (
          <Popover>
            <PopoverTrigger>
              <EllipsisVertical />
            </PopoverTrigger>
            <PopoverContent className="z-10 flex w-fit flex-col overflow-hidden rounded-lg border border-purple-500 bg-background !p-0">
              {process.env.NODE_ENV === "development" && (
                <Button
                  size={"sm"}
                  variant={"ghost"}
                  className="!py-0"
                  onClick={() => {
                    setOpen(
                      <CustomModal title="Video status" subheading="">
                        <pre className="mb-2 whitespace-pre-wrap">
                          {currentStatus?.message}
                        </pre>
                      </CustomModal>,
                    );
                  }}
                >
                  <Eye className="mr-2 h-4 w-4" /> Status
                </Button>
              )}
              <Button
                variant={"destructive"}
                size={"sm"}
                className="!py-0 font-special"
                onClick={() => {
                  setOpen(
                    <CustomModal title="Delete video" subheading="">
                      <div>
                        Do you want to delete this video? This action cannot be
                        undone.
                      </div>
                      <div className="ml-auto mt-8 flex w-fit gap-2">
                        <Button onClick={() => setClose()} variant={"outline"}>
                          Cancel
                        </Button>
                        <Button
                          variant={"destructive"}
                          onClick={handleDelete}
                          disabled={isDeleting}
                        >
                          {isDeleting ? "Deleting..." : "Delete"}
                        </Button>
                      </div>
                    </CustomModal>,
                  );
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </PopoverContent>
          </Popover>
        )}
      </div>
      <div className="">
        {video.result.status === "saved" ? (
          <div className="aspect-video">
            <video width="600" controls className="h-full w-full">
              <source src={video.result.videoUrl} type="video/mp4" />
              <source src={video.result.videoUrl} type="video/webm" />
              Your browser does not support the video tag.
            </video>
            <div className="grid grid-cols-2 gap-2 px-2 py-2 md:gap-2">
              <Button
                variant={"ghost"}
                disabled={
                  video.result.status !== "saved" ||
                  !channels ||
                  channels.length === 0
                }
                onClick={() => {
                  setOpen(
                    <CustomModal title="Upload to youtube" subheading="">
                      <UploadToYoutubeForm video={video} />
                    </CustomModal>,
                  );
                }}
                role="button"
                className={`flex items-center justify-center gap-4 !px-0 text-sm ${
                  video.result.status !== "saved" ||
                  !channels ||
                  channels.length == 0
                    ? "!cursor-not-allowed opacity-50"
                    : ""
                }`}
              >
                <YoutubeIcon className="h-6 w-6" /> Upload to youtube
              </Button>
            </div>
          </div>
        ) : video.result.status === "pending" ? (
          <div className="p-2">
            <div className="mb-2">
              Your video is being generated...{" "}
              <LoaderIcon className="inline-block h-4 w-4 animate-spin" />
            </div>
            <Progress
              value={currentStatus?.percent ? currentStatus?.percent * 100 : 0}
              className="h-[4px] w-full"
            />
          </div>
        ) : (
          <div>An error occurred...</div>
        )}
      </div>
    </div>
  );
}
