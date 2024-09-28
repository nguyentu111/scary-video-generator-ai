import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("segments").collect();
  },
});
export const edit = mutation({
  args: {
    id: v.id("segments"),
    imagePromt: v.optional(v.string()),
    text: v.optional(v.string()),
    imageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      text: args.text,
      imagePromt: args.imagePromt,
      imageId: args.imageId,
    });
  },
});
export const editImageId = mutation({
  args: {
    id: v.id("segments"),
    imageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      imageId: args.imageId,
    });
  },
});
export const getByStoryId = query({
  args: { storyId: v.id("stories") },
  handler: async (ctx, args) => {
    // const user = await getAuthUserId(ctx);
    // if (!user) throw new Error("Unauthenticated");
    return await ctx.db
      .query("segments")
      .filter((q) => q.eq(q.field("storyId"), args.storyId))
      .collect();
  },
});
export const saveSegments = internalMutation({
  args: {
    segments: v.array(v.object({ segment: v.string(), image: v.string() })),
    storyId: v.id("stories"),
  },
  handler: async (ctx, args) => {
    await Promise.all(
      args.segments.map((s) =>
        ctx.db.insert("segments", {
          imagePromt: s.image,
          text: s.segment,
          storyId: args.storyId,
        }),
      ),
    );
  },
});
