import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";

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
export const editVoiceUrlAndDuration = internalMutation({
  args: {
    id: v.id("segments"),
    voiceDuration: v.number(),
    voiceUrl: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      voiceDuration: args.voiceDuration,
      voiceUrl: args.voiceUrl,
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
