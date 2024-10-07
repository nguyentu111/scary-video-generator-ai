import { ConvexError, v } from "convex/values";
import { Id } from "./_generated/dataModel";

import { getAuthUserId } from "@convex-dev/auth/server";
import { api, internal } from "./_generated/api";
import {
  httpAction,
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";

export const segmentVideoGeneratedCallback = httpAction(
  async (ctx, request) => {
    const { segmentId, videoStatus } = (await request.json()) as {
      segmentId: Id<"videoSegments">;
      videoStatus:
        | { status: "failed"; reason: string; elapsedMs: number }
        | {
            status: "saved";
            elapsedMs: number;
            videoUrl: string;
            publicId: string;
          };
    };
    const segment = await ctx.runQuery(api.videoSegments.get, {
      id: segmentId,
    });
    if (!segment) throw new ConvexError("Segment not found");
    await ctx.runMutation(internal.videoSegments.editVideoStatus, {
      id: segmentId,
      videoStatus,
    });
    //check if all videoSegment is 'saved', start the finalizng process
    await ctx.scheduler.runAfter(
      0,
      internal.videoSegments.checkCanProcessFinalVideo,
      { videoId: segment.videoId },
    );
    return new Response(null, { status: 200 });
  },
);
export const get = query({
  args: { id: v.id("videoSegments") },
  handler: (ctx, args) => {
    return ctx.db.get(args.id);
  },
});
export const internalGet = internalQuery({
  args: { id: v.id("videoSegments") },
  handler: async (ctx, args) => {
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
        publicId: v.string(),
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
        publicId: v.string(),
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
export const getByVideoId = query({
  args: { videoId: v.id("videos") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Unauthenticated");
    if (
      await ctx.runQuery(internal.videos.isVideoBelongToUser, {
        userId: userId,
        videoId: args.videoId,
      })
    ) {
      const rs = await ctx.db
        .query("videoSegments")
        .filter((q) => q.eq(q.field("videoId"), args.videoId))
        .collect();
      return rs.sort((a, b) => a.order - b.order);
    } else return null;
  },
});
export const internalGetByVideoId = internalQuery({
  args: { videoId: v.id("videos") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("videoSegments")
      .filter((q) => q.eq(q.field("videoId"), args.videoId))
      .collect();
  },
});
export const checkCanProcessFinalVideo = internalAction({
  args: { videoId: v.id("videos") },
  handler: async (ctx, args) => {
    const canProcessFinalVideo = await ctx.runQuery(
      internal.videos.isCanCreateVideo,
      {
        videoId: args.videoId,
      },
    );

    if (canProcessFinalVideo) {
      const segments = await ctx.runQuery(
        internal.videoSegments.internalGetByVideoId,
        {
          videoId: args.videoId,
        },
      );
      const orderedSegment = segments.sort((a, b) => a.order - b.order);
      const segmentUrls = orderedSegment.map((s) => {
        if (s.videoStatus.status === "saved") return s.videoStatus.videoUrl;
        else throw new ConvexError("Segment video is not generated");
      });
      await ctx.runAction(internal.sqs.sendSqsMessageGenerateFinalVideo, {
        message: { segmentUrls: segmentUrls, videoId: args.videoId },
      });
      return true;
    }
    return false;
  },
});
