import { getAuthUserId } from "@convex-dev/auth/server";
import { api, internal } from "./_generated/api";
import { action, internalAction, query } from "./_generated/server";
import { mutation } from "./_generated/server";
import { ConvexError, v } from "convex/values";

export const get = query({
  args: { id: v.id("stories") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Unauthenticated");
    return await ctx.db.get(args.id);
  },
});
export const getStories = query({
  args: {},
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Unauthenticated");
    }
    return await ctx.db
      .query("stories")
      .filter((q) => q.eq(q.field("userId"), userId))
      .order("desc")
      .collect();
  },
});

export const createStory = mutation({
  args: { story: v.string(), userId: v.id("users"), name: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new ConvexError("Unauthenticated");
    }
    const storyId = await ctx.db.insert("stories", {
      userId: args.userId,
      name: args.name,
      content: args.story,
    });
    await ctx.scheduler.runAfter(0, internal.chatgpt.splitToSegment, {
      story: args.story,
      storyId: storyId,
    });
    return storyId;
  },
});
export const deleteStory = mutation({
  args: { id: v.id("stories") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Unauthenticated");
    }
    const story = await ctx.runQuery(api.stories.get, { id: args.id });
    if (story?.userId !== userId)
      throw new ConvexError("You do not have permission on this story");
    const segments = await ctx.db
      .query("storySegments")
      .filter((q) => q.eq(q.field("storyId"), story._id))
      .collect();
    await Promise.all(
      segments.map((segment) =>
        ctx.runMutation(internal.storySegments.deleteStorySegment, {
          id: segment._id,
        }),
      ),
    );
    await ctx.db.delete(args.id);
  },
});
