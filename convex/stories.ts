import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";
import { query } from "./_generated/server";
import { mutation } from "./_generated/server";
import { v } from "convex/values";

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
      throw new Error("Unauthenticated");
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
