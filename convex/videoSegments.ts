import { ConvexError, v } from "convex/values";
import { Id } from "./_generated/dataModel";

import {
  httpAction,
  internalMutation,
  mutation,
  query,
} from "./_generated/server";
import { api, internal } from "./_generated/api";

export const segmentVideoGeneratedCallback = httpAction(
  async (ctx, request) => {
    const { segmentId, videoStatus } = (await request.json()) as {
      segmentId: Id<"videoSegments">;
      videoStatus:
        | { status: "failed"; reason: string; elapsedMs: number }
        | { status: "saved"; elapsedMs: number; videoUrl: string };
    };
    const segment = await ctx.runQuery(api.videoSegments.get, {
      id: segmentId,
    });
    if (!segment) throw new ConvexError("Segment not found");
    await ctx.runMutation(internal.videoSegments.editVideoStatus, {
      id: segmentId,
      videoStatus,
    });
    return new Response(null, { status: 200 });
  },
);
export const get = query({
  args: { id: v.id("videoSegments") },
  handler: (ctx, args) => {
    return ctx.db.get(args.id);
  },
});
// export const editImageStatus = internalMutation({
//   args: {
//     id: v.id("videoSegments"),
//     imageStatus: v.union(
//       v.object({
//         status: v.literal("pending"),
//         details: v.string(),
//       }),
//       v.object({
//         status: v.literal("failed"),
//         reason: v.string(),
//         elapsedMs: v.number(),
//       }),
//       v.object({
//         status: v.literal("saved"),
//         imageUrl: v.string(),
//         elapsedMs: v.number(),
//       }),
//     ),
//   },
//   handler: async (ctx, args) => {
//     await ctx.db.patch(args.id, { imageStatus: args.imageStatus });
//   },
// });

export const editVoiceStatus = internalMutation({
  args: {
    id: v.id("videoSegments"),
    voiceStatus: v.union(
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
        voiceDuration: v.number(),
        voiceUrl: v.string(),
        voiceSrt: v.string(),
        elapsedMs: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      voiceStatus: args.voiceStatus,
    });
  },
});
export const editVideoStatus = internalMutation({
  args: {
    id: v.id("videoSegments"),
    videoStatus: v.union(
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
        videoUrl: v.string(),
        elapsedMs: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      videoStatus: args.videoStatus,
    });
  },
});
export const edit = mutation({
  args: {
    id: v.id("videoSegments"),
    imagePrompt: v.string(),
    text: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return ctx.db.patch(args.id, {
      imagePrompt: args.imagePrompt,
      text: args.text,
    });
  },
});
