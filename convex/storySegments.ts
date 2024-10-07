import { ConvexError, v } from "convex/values";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api, internal } from "./_generated/api";
import { Doc } from "./_generated/dataModel";

export const get = query({
  args: { id: v.id("storySegments") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});
export const edit = mutation({
  args: {
    id: v.id("storySegments"),
    imagePrompt: v.optional(v.string()),
    text: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError("Unauthenticated");
    const segment = await ctx.runQuery(api.storySegments.get, {
      id: args.id,
    });
    if (!segment) throw new ConvexError("Segment not found");
    const story = await ctx.runQuery(api.stories.get, { id: segment.storyId });
    if (!story || story.userId !== userId)
      throw new ConvexError("Segment not found");

    await ctx.db.patch(args.id, {
      text: args.text,
      imagePrompt: args.imagePrompt,
    });
    if (segment.text !== args.text) {
      await ctx.scheduler.runAfter(
        0,
        internal.stories.concatStoryContentFromSegments,
        { storyId: story._id },
      );
    }
  },
});
export const editImageStatus = internalMutation({
  args: {
    id: v.id("storySegments"),
    imageStatus: v.union(
      v.object({
        status: v.literal("pending"),
        details: v.string(),
      }),
      v.object({
        status: v.literal("failed"),
        reason: v.string(),
        elapsedMs: v.number(),
      }),
      v.object({
        status: v.literal("saved"),
        imageUrl: v.string(),
        elapsedMs: v.number(),
        publicId: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { imageStatus: args.imageStatus });
  },
});
export const getByStoryId = query({
  args: { storyId: v.id("stories") },
  handler: async (ctx, args) => {
    const records = await ctx.db
      .query("storySegments")
      .filter((q) => q.eq(q.field("storyId"), args.storyId))
      .collect();
    return records.sort((a, b) => a.order - b.order);
  },
});
export const isSegmentBelongToStoryAndUser = internalQuery({
  args: {
    segmentId: v.id("storySegments"),
    userId: v.id("users"),
  },
  async handler(ctx, { segmentId, userId }) {
    const segment = await ctx.db.get(segmentId);
    if (!segment) return false; // Segment not found
    const story = await ctx.runQuery(api.stories.get, { id: segment.storyId });
    if (story && story.userId === userId && segment.storyId === story._id) {
      return true;
    }
    return false;
  },
});
export const insert = mutation({
  args: {
    imagePrompt: v.string(),
    text: v.string(),
    storyId: v.id("stories"),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new ConvexError("Unauthenticated");
    }
    if (
      !(await ctx.runQuery(internal.stories.isStoryBelongToUser, {
        storyId: args.storyId,
        userId,
      }))
    )
      throw new ConvexError("Forbidden");
    const segmentWithLargerOrders = await ctx.db
      .query("storySegments")
      .filter((q) => q.gte(q.field("order"), args.order))
      .collect();
    await Promise.all(
      segmentWithLargerOrders.map(async (s) => {
        await ctx.db.patch(s._id, { order: s.order + 1 });
      }),
    );
    await ctx.db.insert("storySegments", {
      imagePrompt: args.imagePrompt,
      text: args.text,
      storyId: args.storyId,
      order: args.order,
      imageStatus: {
        status: "pending",
        details: "Creating image...",
      },
    });
  },
});
export const inrternalInsert = internalMutation({
  args: {
    imagePrompt: v.string(),
    text: v.string(),
    storyId: v.id("stories"),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    ctx.db.insert("storySegments", {
      imagePrompt: args.imagePrompt,
      text: args.text,
      storyId: args.storyId,
      order: args.order,
      imageStatus: {
        status: "pending",
        details: "Creating image...",
      },
    });
  },
});
export const saveSegments = internalMutation({
  args: {
    segments: v.array(v.object({ segment: v.string(), image: v.string() })),
    storyId: v.id("stories"),
  },
  handler: async (ctx, args) => {
    return await Promise.all(
      args.segments.map((s, i) =>
        ctx.db.insert("storySegments", {
          imagePrompt: s.image,
          text: s.segment,
          storyId: args.storyId,
          order: i + 1,
          imageStatus: {
            status: "pending",
            details: "Creating image...",
          },
        }),
      ),
    );
  },
});
export const internalDeleteStorySegment = internalMutation({
  args: { id: v.id("storySegments") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    const segment = await ctx.db.get(args.id);
    if (segment)
      await ctx.scheduler.runAfter(
        0,
        internal.stories.concatStoryContentFromSegments,
        { storyId: segment.storyId },
      );
  },
});
export const deleteSegment = mutation({
  args: { id: v.id("storySegments") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Unauthenticated");
    if (
      !(await ctx.runQuery(
        internal.storySegments.isSegmentBelongToStoryAndUser,
        {
          segmentId: id,
          userId: userId,
        },
      ))
    )
      throw new ConvexError("Forbidden");
    const segment = (await ctx.db.get(id)) as NonNullable<Doc<"storySegments">>;
    await ctx.db.delete(id);
    const segmentWithLargerOrders = await ctx.db
      .query("storySegments")
      .filter((q) => q.gt(q.field("order"), segment.order))
      .collect();
    await Promise.all(
      segmentWithLargerOrders.map(async (s) => {
        await ctx.db.patch(s._id, { order: s.order - 1 });
      }),
    );
    await ctx.scheduler.runAfter(
      0,
      internal.stories.concatStoryContentFromSegments,
      { storyId: segment.storyId },
    );
  },
});
