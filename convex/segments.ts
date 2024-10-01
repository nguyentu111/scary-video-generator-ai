import { ConvexError, v } from "convex/values";
import {
  httpAction,
  internalMutation,
  mutation,
  query,
} from "./_generated/server";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("segments").collect();
  },
});
export const getOne = query({
  args: { id: v.id("segments") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});
export const edit = mutation({
  args: {
    id: v.id("segments"),
    imagePromt: v.optional(v.string()),
    text: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      text: args.text,
      imagePromt: args.imagePromt,
      imageUrl: args.imageUrl,
    });
  },
});
export const editFramesStatus = mutation({
  args: {
    id: v.id("segments"),
    isFramesGenerated: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      isFramesGenerated: args.isFramesGenerated,
    });
  },
});
export const editImageId = mutation({
  args: {
    id: v.id("segments"),
    imageUrl: v.optional(v.string()),
    status: v.union(
      v.literal("success"),
      v.literal("error"),
      v.literal("none"),
      v.literal("creating"),
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      imageUrl: args.imageUrl,
      imageStatus: args.status,
    });
  },
});
export const editVoice = internalMutation({
  args: {
    id: v.id("segments"),
    voiceDuration: v.number(),
    voiceUrl: v.string(),
    voiceSrt: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      voiceDuration: args.voiceDuration,
      voiceUrl: args.voiceUrl,
      voiceSrt: args.voiceSrt,
    });
  },
});
export const editVideoUrlAndStatus = internalMutation({
  args: {
    id: v.id("segments"),
    videoStatus: v.optional(
      v.union(v.literal("success"), v.literal("error"), v.literal("creating")),
    ),
    videoUrl: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      videoStatus: args.videoStatus,
      videoUrl: args.videoUrl,
    });
  },
});
export const getByStoryId = query({
  args: { storyId: v.id("stories") },
  handler: async (ctx, args) => {
    // const user = await getAuthUserId(ctx);
    // if (!user) throw new Error("Unauthenticated");
    const records = await ctx.db
      .query("segments")
      .filter((q) => q.eq(q.field("storyId"), args.storyId))
      .collect();
    return records.sort((a, b) => a.order - b.order);
  },
});
export const saveSegments = internalMutation({
  args: {
    segments: v.array(v.object({ segment: v.string(), image: v.string() })),
    storyId: v.id("stories"),
  },
  handler: async (ctx, args) => {
    await Promise.all(
      args.segments.map((s, i) =>
        ctx.db.insert("segments", {
          imagePromt: s.image,
          text: s.segment,
          storyId: args.storyId,
          order: i + 1,
          imageStatus: "creating",
        }),
      ),
    );
  },
});
export const deleteSegment = internalMutation({
  args: { id: v.id("segments") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
export const segmentVideoGeneratedCallback = httpAction(
  async (ctx, request) => {
    const { segmentId, videoUrl } = (await request.json()) as {
      segmentId: Id<"segments">;
      videoUrl: string;
    };
    const segment = await ctx.runQuery(api.segments.getOne, {
      id: segmentId,
    });
    if (!segment) throw new ConvexError("Segment not found");
    await ctx.runMutation(internal.segments.editVideoUrlAndStatus, {
      id: segmentId,
      videoUrl: videoUrl,
      videoStatus: "success",
    });
    return new Response(null, { status: 200 });
  },
);
