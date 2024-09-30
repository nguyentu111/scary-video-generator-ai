import { ConvexError } from "convex/values";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { httpAction } from "./_generated/server";

export const voiceGeneratedCallback = httpAction(async (ctx, request) => {
  try {
    const data = (await request.json()) as {
      voiceUrl: string;
      voiceDuration: number;
      segmentId: string;
    };
    await ctx.runMutation(internal.segments.editVoiceUrlAndDuration, {
      id: data.segmentId as Id<"segments">,
      voiceDuration: data.voiceDuration,
      voiceUrl: data.voiceUrl,
    });
    const segment = await ctx.runQuery(api.segments.getOne, {
      id: data.segmentId as Id<"segments">,
    });
    if (!segment) {
      await ctx.runMutation(internal.logs.create, {
        message: "segment not found!",
        function: "voices.voiceGeneratedCallback.error",
      });
      throw new ConvexError(
        "voices.voiceGeneratedCallback.error: segment not found!",
      );
    }
    ctx.scheduler.runAfter(0, internal.sqs.sendSqsMessageGenerateFrames, {
      message: segment.text,
      attributes: {
        segmentId: { DataType: "String", StringValue: data.segmentId },
        folderName: {
          DataType: "String",
          StringValue: `frames/segment_${data.segmentId}`,
        },
        numberOfFrames: {
          DataType: "Number",
          StringValue: (segment.voiceDuration! * 25 + 10).toString(),
        },
      },
    });
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
