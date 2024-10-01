import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { httpAction } from "./_generated/server";

export const framesGeneratedCallback = httpAction(async (ctx, request) => {
  const data = (await request.json()) as { segmentId: string; videoId: string };
  await ctx.runMutation(api.segments.editFramesStatus, {
    id: data.segmentId as Id<"segments">,
    isFramesGenerated: true,
  });
  await ctx.scheduler.runAfter(
    0,
    internal.videos.checkGeneratedVoiceAndFrames,
    {
      videoId: data.videoId as Id<"videos">,
    },
  );
  return new Response(null, { status: 200 });
});
