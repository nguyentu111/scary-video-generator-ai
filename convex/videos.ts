import { v } from "convex/values";
import { internalAction, mutation } from "./_generated/server";
import { api, internal } from "./_generated/api";

export const create = mutation({
  args: { storyId: v.id("stories") },
  async handler(ctx, args) {
    const videoId = await ctx.db.insert("videos", {
      status: "creating",
      storyId: args.storyId,
    });
    ctx.scheduler.runAfter(0, internal.videos.createVoiceAndFrames, {
      storyId: args.storyId,
      videoId,
    });

    return videoId;
  },
});
export const createVoiceAndFrames = internalAction({
  args: { storyId: v.id("stories"), videoId: v.id("videos") },
  handler: async (ctx, args) => {
    const segments = await ctx.runQuery(api.segments.getByStoryId, {
      storyId: args.storyId,
    });
    segments.forEach((s) =>
      ctx.scheduler.runAfter(0, internal.sqs.sendSqsMessageGenerateVoice, {
        message: s.text,
        attributes: { segmentId: { DataType: "String", StringValue: s._id } },
      }),
    );

    // segments.forEach((s) =>
    //   ctx.scheduler.runAfter(0, internal.sqs.sendSqsMessageGenerateFrames, {
    //     message: s.text,
    //     attributes: {
    //       segmentId: { DataType: "String", StringValue: s._id },
    //       folderName: {
    //         DataType: "String",
    //         StringValue: `frames/video_${videoId + "/segment_" + s._id.toString()}`,
    //       },
    //       numberOfFrames: {
    //         DataType: "Number",
    //         StringValue: (s.voiceDuration! * 25 + 10).toString(),
    //       },
    //     },
    //   }),
    // );
  },
});
