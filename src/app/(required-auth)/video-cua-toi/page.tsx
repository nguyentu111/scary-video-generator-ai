"use client";

import { YoutubeIcon } from "@/components/icons/youtubeIcon";
import { AuthLoader } from "@/components/shared/auth-loader";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import { useAction, useQuery } from "convex/react";
import { EllipsisVertical, Loader2Icon, LoaderIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { api } from "~/convex/_generated/api";
import { Doc, Id } from "~/convex/_generated/dataModel";
import { useForm } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";
import { channel } from "diagnostics_channel";
import { zodResolver } from "@hookform/resolvers/zod";
import { useModal } from "@/components/providers/modal-provider";
import CustomModal from "@/components/shared/custom-modal";
import { cn } from "@/lib/utils";
import { amatic } from "@/styles/fonts";
import { Textarea } from "@/components/ui/textarea";

export default function Home() {
  const videos = useQuery(api.videos.getCurrentUserVideos);
  return (
    <AuthLoader authLoading={<AuthLoadingSkeleton />}>
      <div>
        <h1 className="w-full text-center text-[40px] font-bold">
          Video của tôi
        </h1>
        <div className="float-right">
          <ConnectYoutubeButton />
        </div>
        <div className="grid grid-cols-1 gap-4 py-12 md:grid-cols-2 lg:grid-cols-3">
          {videos?.map((v) => <VideoItem video={v} key={v._id} />)}
        </div>
      </div>
    </AuthLoader>
  );
}
function VideoItem({ video }: { video: Doc<"videos"> }) {
  const videoSegments = useQuery(api.videoSegments.getByVideoId, {
    videoId: video._id,
  });
  const currentStatus = useMemo(() => {
    if (!videoSegments) return { percent: 0, message: "Loading" };
    const voiceGeneratedCount =
      videoSegments?.filter((s) => s.voiceStatus.status === "saved").length ??
      0;
    const videoGeneratedCount =
      videoSegments?.filter((s) => s.videoStatus.status === "saved").length ??
      0;
    const voiceStatus = videoSegments.reduce((acc, curr, i) => {
      return (acc += `Voice ${curr.order} : ${curr.voiceStatus.status === "failed" ? curr.voiceStatus.reason : curr.voiceStatus.status}  \n`);
    }, "");
    const videoStatus = videoSegments.reduce((acc, curr, i) => {
      return (acc += `Video ${curr.order} : ${curr.videoStatus.status === "failed" ? curr.videoStatus.reason : curr.videoStatus.status}  \n`);
    }, "");
    return {
      percent: parseFloat(
        ((0.3 * voiceGeneratedCount) / videoSegments.length).toFixed(2) +
          ((0.6 * videoGeneratedCount) / videoSegments.length).toFixed(2),
      ),
      message: `Đã tạo voice: ${voiceGeneratedCount}/${videoSegments?.length}\n
        ${voiceStatus}
        ${videoStatus}
        `,
    };
  }, [videoSegments]);
  const { setOpen } = useModal();
  return (
    <div
      className="rounded-lg border-2 border-purple-500 shadow-purple-500 transition-all hover:shadow-lg"
      key={video._id}
    >
      <div className="flex justify-between">
        <div className="p-2"> {video.name}</div>
        {/* <Popover>
          <PopoverTrigger>
            <EllipsisVertical />
          </PopoverTrigger>
          <PopoverContent className="z-10 w-fit rounded-lg border border-purple-500 bg-background p-2">
            
          </PopoverContent>
        </Popover> */}
      </div>
      <div className="aspect-video">
        {video.result.status === "saved" ? (
          <div>
            <video width="600" controls className="h-full w-full">
              <source src={video.result.videoUrl} type="video/mp4" />
              <source src={video.result.videoUrl} type="video/webm" />
              Your browser does not support the video tag.
            </video>
            <div className="grid grid-cols-2 gap-2 px-4 md:gap-2">
              <Button
                disabled={video.result.status !== "saved"}
                onClick={() => {
                  setOpen(
                    <CustomModal title="Đăng lên youtube" subheading="">
                      <UploadToYoutubeForm video={video} />
                    </CustomModal>,
                  );
                }}
                role="button"
                className={cn(
                  "flex items-center justify-center gap-4 text-sm",
                  video.result.status !== "saved"
                    ? "cursor-not-allowed opacity-50"
                    : "",
                )}
              >
                <YoutubeIcon className="h-6 w-6" /> Đăng lên youtube
              </Button>
            </div>
          </div>
        ) : video.result.status === "pending" ? (
          <div className="p-2">
            <pre className="mb-2">{currentStatus?.message}</pre>{" "}
            <Progress
              value={currentStatus?.percent ? currentStatus?.percent * 100 : 0}
              className="h-[4px] w-full"
            />
          </div>
        ) : (
          <div>Đã có lỗi xảy ra...</div>
        )}
      </div>
    </div>
  );
}
function AuthLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((a, i) => (
        <div className="h-[200px]" key={i}>
          <Skeleton className="h-full rounded-lg" />
        </div>
      ))}
    </div>
  );
}
function ConnectYoutubeButton() {
  const [isConnecting, setIsConnecting] = useState(false);
  const getUrl = useAction(api.youtube.getAuthUrlAction);

  const handleConnectYouTube = async () => {
    setIsConnecting(true);
    try {
      window.open(await getUrl());
      // setShowConnectYoutubeDialog(false);
    } catch (error) {
      console.error("Failed to get YouTube auth URL:", error);
      toast.error(
        ("Failed to connect to YouTube. Please try again." +
          (error as unknown as Error)?.message) as string,
      );
    } finally {
      setIsConnecting(false);
    }
  };
  return (
    <Button disabled={isConnecting} onClick={handleConnectYouTube}>
      {isConnecting ? "Connecting" : "Connect to youtube"}
    </Button>
  );
}
const uploadFormShema = z.object({
  name: z.string().min(20, "Tên ít nhất 20 kí tự"),
  channel: z.string().min(1, "Hãy chọn channel"),
  description: z.string().min(20, "Mô tả video ít nhất 20 kí tự"),
});
export const UploadToYoutubeForm = ({ video }: { video: Doc<"videos"> }) => {
  const channels = useQuery(api.channels.getUserChannels);
  const mutateUpload = useAction(api.youtube.uploadToYoutube);
  const [isPostingToYoutube, setIsPostingToYoutube] = useState(false);
  const form = useForm({
    defaultValues: {
      name: video.name,
      channel: "",
      description: "Video được tạo bởi scary video generator AI",
    },
    resolver: zodResolver(uploadFormShema),
  });
  const onSubmit = async (data: z.infer<typeof uploadFormShema>) => {
    try {
      setIsPostingToYoutube(true);
      const response = await mutateUpload({
        videoId: video._id,
        channelId: data.channel as Id<"channels">,
        name: data.name,
        description: data.description,
      });
      console.log(response);
      toast.success("Video scheduled for YouTube.");
    } catch (error) {
      toast.error((error as { message: string }).message);
    } finally {
      setIsPostingToYoutube(false);
    }
  };
  return (
    <Form {...form}>
      {/** @ts-ignore */}
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 font-sans"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên video</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Nhập tên câu chuyện" required />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mô tả của video</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Nhập mô tả của video"
                  className="min-h-[100px]"
                  required
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="channel"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="">Chọn channel</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Channel" />
                  </SelectTrigger>
                  <SelectContent>
                    {channels?.map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.channelTitle}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className={cn("w-full bg-purple-700 text-white hover:bg-purple-800")}
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <Loader2Icon className="h-4 w-4 animate-spin" />
          ) : (
            <span>Đăng </span>
          )}
        </Button>
      </form>
    </Form>
  );
};
