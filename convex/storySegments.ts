import { ConvexError, v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";

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
export const deleteStorySegment = internalMutation({
  args: { id: v.id("storySegments") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
