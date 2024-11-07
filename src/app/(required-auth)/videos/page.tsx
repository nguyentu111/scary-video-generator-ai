"use client";
import { AuthLoader } from "@/components/shared/auth-loader";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { PlusIcon } from "lucide-react";
import { api } from "~/convex/_generated/api";
import { ChannelItem } from "@/components/videos/channel-item";
import { ConnectYoutubeButton } from "@/components/videos/connect-youtube-button";
import { VideoItem } from "@/components/videos/video-item";
import { Skeleton } from "@/components/ui/skeleton";

function AuthLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div className="h-[200px]" key={i}>
          <Skeleton className="h-full rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export default function MyVideos() {
  const videos = useQuery(api.videos.getCurrentUserVideos);
  const channels = useQuery(api.channels.getUserChannels);

  return (
    <AuthLoader authLoading={<AuthLoadingSkeleton />}>
      <div className="container h-full py-12">
        <h1
          className={cn(
            "w-full text-center font-nosifer text-[40px] font-bold text-purple-300",
          )}
        >
          Your Videos
        </h1>
        <p className={cn("w-full py-4 text-center font-special text-lg")}>
          Here are the videos you've generated.
        </p>
        {videos?.length !== undefined && videos?.length > 0 && (
          <div>
            <div className="float-right max-w-full">
              {channels?.length && channels?.length > 0 ? (
                <div>
                  Connected channels:{" "}
                  <div className="flex flex-col gap-2">
                    {channels.map((c) => (
                      <ChannelItem key={c._id} channel={c} />
                    ))}
                  </div>
                </div>
              ) : (
                <ConnectYoutubeButton variant={"link"}>
                  {({ isConnecting }) => (
                    <div>
                      {isConnecting ? (
                        "Getting connection link"
                      ) : (
                        <div className="flex items-center gap-2">
                          <PlusIcon className="h-4 w-4" /> Connect youtube
                        </div>
                      )}
                    </div>
                  )}
                </ConnectYoutubeButton>
              )}
            </div>
            <div className="grid w-full grid-cols-1 gap-4 py-12 md:grid-cols-2 lg:grid-cols-3">
              {videos?.map((v) => <VideoItem video={v} key={v._id} />)}
            </div>
          </div>
        )}
        {videos !== undefined && videos.length === 0 && (
          <p
            className={cn(
              "my-12 text-center font-amatic text-[40px] font-bold",
            )}
          >
            You don't have any videos.
          </p>
        )}
        {videos === undefined && (
          <div className="flex h-full w-full items-center justify-center">
            <div className={cn("font-amatic text-[40px] font-bold")}>
              Loading videos...
            </div>
          </div>
        )}
      </div>
    </AuthLoader>
  );
}
