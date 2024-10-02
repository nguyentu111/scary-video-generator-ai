import { ConvexError } from "convex/values";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { httpAction } from "./_generated/server";

export const voiceGeneratedCallback = httpAction(async (ctx, request) => {
  try {
    const data = (await request.json()) as {
      voiceUrl: string;
      voiceDuration: number;
      segmentId: Id<"videoSegments">;
      videoId: string;
      srt: string;
    };
    await ctx.runMutation(internal.videoSegments.editVoiceStatus, {
      id: data.segmentId,
      voiceStatus: {
        status: "saved",
        elapsedMs: 999,
        voiceDuration: data.voiceDuration,
        voiceSrt: data.srt,
        voiceUrl: data.voiceUrl,
      },
    });
    const segment = await ctx.runQuery(api.videoSegments.get, {
      id: data.segmentId,
    });
    if (!segment) {
      throw new ConvexError(
        "voices.voiceGeneratedCallback.error: segment not found!",
      );
    }
    await ctx.scheduler.runAfter(
      0,
      internal.sqs.sendSqsMessageGenerateSegmentVideo,
      {
        message: {
          imageUrl: segment.imageUrl,
          segmentId: data.segmentId,
          voiceUrl: data.voiceUrl,
          voiceDuration: data.voiceDuration,
          voiceSrt: data.srt,
        },
      },
    );
    return new Response(null, {
      status: 200,
    });
  } catch (error) {
    if (error instanceof Error) {
      await ctx.runMutation(internal.logs.create, {
        message: error.message,
        function: "voices.voiceGeneratedCallback.error",
      });
      return new Response("error from http action :" + error.message, {
        status: 500,
      });
    } else {
      await ctx.runMutation(internal.logs.create, {
        message: "Unkown error occur :<<",
        function: "voices.voiceGeneratedCallback.error",
      });
      return new Response("Unknow error from save voice httpaction", {
        status: 500,
      });
    }
  }
});
