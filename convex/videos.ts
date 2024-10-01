import { v } from "convex/values";
import { internalQuery, mutation, query } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internalAction } from "./_generated/server";

export const create = mutation({
  args: { storyId: v.id("stories"), name: v.string() },
  async handler(ctx, args) {
    const videoId = await ctx.db.insert("videos", {
      status: "creating",
      storyId: args.storyId,
      name: args.name,
    });
    await ctx.scheduler.runAfter(0, internal.videos.createVoice, {
      storyId: args.storyId,
      videoId,
    });

    return videoId;
  },
});
export const createVoice = internalAction({
  args: { storyId: v.id("stories"), videoId: v.id("videos") },
  handler: async (ctx, args) => {
    const segments = await ctx.runQuery(api.segments.getByStoryId, {
      storyId: args.storyId,
    });
    await Promise.all(
      segments.map(
        async (s) =>
          await ctx.scheduler.runAfter(
            0,
            internal.sqs.sendSqsMessageGenerateVoice,
            {
              message: s.text,
              attributes: {
                segmentId: { DataType: "String", StringValue: s._id },
                videoId: { DataType: "String", StringValue: args.videoId },
              },
            },
          ),
      ),
    );
  },
});
export const get = query({
  args: {},
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const stories = await ctx.db
      .query("stories")
      .filter((q) => q.eq(q.field("userId"), userId))
      .order("desc")
      .collect();
    const rs = await Promise.all(
      stories.map((s) =>
        ctx.db
          .query("videos")
          .filter((q) => q.eq(q.field("storyId"), s._id))
          .order("desc")
          .collect(),
      ),
    );
    return rs.reduce((acc, curr) => {
      return [...acc, ...curr];
    }, []);
  },
});
export const isCanCreateVideo = internalQuery({
  args: { videoId: v.id("videos") },
  handler: async (ctx, args) => {
    const video = await ctx.db.get(args.videoId);
    return false;
    //TODFO check can create video
  },
});
export const checkGeneratedVoiceAndFrames = internalAction({
  args: { videoId: v.id("videos") },
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.logs.create, {
      function: "checkGeneratedVoiceAndFrames",
      message: "checking can create video on generatedFramesCallback",
    });
    const isCanCreateVideo = await ctx.runQuery(
      internal.videos.isCanCreateVideo,
      { videoId: args.videoId },
    );
    if (isCanCreateVideo) {
      //TODO
    }
  },
});
