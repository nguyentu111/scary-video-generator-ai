"use client";

import { useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { AuthLoader } from "@/components/shared/auth-loader";
import { Skeleton } from "@/components/ui/skeleton";
import { Doc, Id } from "~/convex/_generated/dataModel";
import { useMemo, useState } from "react";
import { Progress } from "@/components/ui/progress";

export default function Home() {
  const videos = useQuery(api.videos.getCurrentUserVideos);
  return (
    <AuthLoader authLoading={<AuthLoadingSkeleton />}>
      <div>
        <h1 className="w-full text-center text-[40px] font-bold">
          Video của tôi
        </h1>
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
    if (!videoSegments || videoSegments.length === 0) return null;

    const voiceGeneratedCount = videoSegments?.filter(
      (v) => v.voiceStatus.status === "saved",
    ).length;
    if (voiceGeneratedCount < videoSegments?.length) {
      return {
        percent: parseFloat(
          ((0.3 * voiceGeneratedCount) / videoSegments.length).toFixed(2),
        ),
        message: `Đang tạo voice cho các đoạn: ${voiceGeneratedCount}/${videoSegments?.length}`,
      };
    }

    const videoGeneratedCount = videoSegments?.filter(
      (v) => v.videoStatus.status === "saved",
    ).length;
    if (videoGeneratedCount < videoSegments?.length) {
      console.log(
        parseFloat(
          0.3 + ((0.6 * videoGeneratedCount) / videoSegments.length).toFixed(2),
        ),
      );
      return {
        percent:
          0.3 +
          parseFloat(
            ((0.6 * videoGeneratedCount) / videoSegments.length).toFixed(2),
          ),
        message: `Đang tạo video cho các đoạn: ${videoGeneratedCount}/${videoSegments?.length}`,
      };
    } else if (video.result.status === "saved") {
      return {
        percent: 1,
        message: "Đã xong, đang load video của bạn...",
      };
    }

    return {
      percent: 0.9,
      message: "Đang xử lí gộp video...",
    };
  }, [videoSegments]);
  return (
    <div
      className="rounded-lg border-2 border-purple-500 shadow-purple-500 transition-all hover:shadow-lg"
      key={video._id}
    >
      <div className="p-2"> {video.name}</div>
      <div className="aspect-video">
        {video.result.status === "saved" ? (
          <video width="600" controls className="h-full w-full">
            <source src={video.result.videoUrl} type="video/mp4" />
            <source src={video.result.videoUrl} type="video/webm" />
            Your browser does not support the video tag.
          </video>
        ) : video.result.status === "pending" ? (
          <div className="p-2">
            <div className="mb-2">{currentStatus?.message}</div>{" "}
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
