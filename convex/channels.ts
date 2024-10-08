import { ConvexError, v } from "convex/values";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

export const internalGet = internalQuery({
  args: { id: v.id("channels") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});
export const getUserChannels = query({
  args: {},
  handler: async (ctx, {}) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Unauthenticated");
    return await ctx.db
      .query("channels")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const save = internalMutation({
  args: {
    refreshToken: v.string(),
    userId: v.id("users"),
    expireAt: v.number(),
    channelId: v.string(),
    channelTitle: v.string(),
  },
  handler: async (
    ctx,
    { channelId, channelTitle, expireAt, refreshToken, userId },
  ) => {
    return await ctx.db.insert("channels", {
      channelId,
      channelTitle,
      expireAt,
      refreshToken,
      userId,
    });
  },
});
export const deleteChannel = mutation({
  args: { id: v.id("channels") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Unauthenticated");
    const channel = await ctx.runQuery(internal.channels.internalGet, {
      id: args.id,
    });
    if (!channel) throw new ConvexError("Channel not found");
    if (channel.userId !== userId) throw new ConvexError("Forbidden");
    await ctx.db.delete(args.id);
  },
});
