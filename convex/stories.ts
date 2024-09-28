import { query } from "./_generated/server";
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const getStories = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("stories")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .order("desc")
      .collect();
  },
});

export const createStory = mutation({
  args: { story: v.string(), userId: v.string(), name: v.string() },
  handler: async (ctx, args) => {
    const newTaskId = await ctx.db.insert("stories", {
      story: args.story,
      userId: args.userId,
      name: args.name,
    });
    return newTaskId;
  },
});
