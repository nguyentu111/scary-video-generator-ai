import { ConvexError, v } from "convex/values";
import { internalQuery, mutation, query } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internalAction } from "./_generated/server";

export const create = mutation({
  args: { storyId: v.id("stories"), name: v.string() },
  async handler(ctx, args) {
    const userId = await getAuthUserId(ctx);

    const story = await ctx.runQuery(api.stories.get, { id: args.storyId });
    if (story?.userId !== userId) throw new ConvexError("Story not found");
    const videoId = await ctx.db.insert("videos", {
      storyId: args.storyId,
      name: args.name,
      result: { status: "pending", details: "Creating video ..." },
    });
    // clone all story segment to video segment
    const storySegment = await ctx.db
      .query("storySegments")
      .filter((q) => q.eq(q.field("storyId"), story._id))
      .collect();
    await Promise.all(
      storySegment.map(async (s) => {
        if (s.imageStatus.status === "saved") {
          const videoSegmentId = await ctx.db.insert("videoSegments", {
            imagePrompt: s.imagePrompt,
            imageUrl: s.imageStatus.imageUrl,
            order: s.order,
            text: s.text,
            videoId,
            videoStatus: {
              status: "pending",
              details: "Waiting for voice ...",
            },
            voiceStatus: { status: "pending", details: "Creating voice ..." },
          });
          await ctx.scheduler.runAfter(
            0,
            internal.sqs.sendSqsMessageGenerateVoice,
            {
              attributes: {
                segmentId: { DataType: "String", StringValue: videoSegmentId },
                videoId: { DataType: "String", StringValue: videoId },
              },
              message: s.text,
            },
          );
        } else
          throw new ConvexError(
            `ImageUrl of storySegment with id ${s._id} is empty `,
          );
      }),
    );

    return 123;
  },
});
// export const createVoice = internalAction({
//   args: {
//     storyId: v.id("stories"),
//     videoId: v.id("videos"),
//     jobId: v.id("jobVideos"),
//   },
//   handler: async (ctx, args) => {
//     const segments = await ctx.runQuery(internal.videoSegments.get, {
//       storyId: args.storyId,
//     });
//     await Promise.all(
//       segments.map(
//         async (s) =>
//           await ctx.scheduler.runAfter(
//             0,
//             internal.sqs.sendSqsMessageGenerateVoice,
//             {
//               message: s.text,
//               attributes: {
//                 segmentId: { DataType: "String", StringValue: s._id },
//                 videoId: { DataType: "String", StringValue: args.videoId },
//               },
//             },
//           ),
//       ),
//     );
//   },
// });
export const get = query({
  args: {},
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const stories = await ctx.db
      .query("stories")
      .filter((q) => q.eq(q.field("userId"), userId))
      .order("desc")
      .collect();
    const rs = await Promise.all(
      stories.map((s) =>
        ctx.db
          .query("videos")
          .filter((q) => q.eq(q.field("storyId"), s._id))
          .order("desc")
          .collect(),
      ),
    );
    return rs.reduce((acc, curr) => {
      return [...acc, ...curr];
    }, []);
  },
});
export const isCanCreateVideo = internalQuery({
  args: { videoId: v.id("videos") },
  handler: async (ctx, args) => {
    const video = await ctx.db.get(args.videoId);
    return false;
    //TODFO check can create video
  },
});
export const checkGeneratedVoiceAndFrames = internalAction({
  args: { videoId: v.id("videos") },
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.logs.create, {
      function: "checkGeneratedVoiceAndFrames",
      message: "checking can create video on generatedFramesCallback",
    });
    const isCanCreateVideo = await ctx.runQuery(
      internal.videos.isCanCreateVideo,
      { videoId: args.videoId },
    );
    if (isCanCreateVideo) {
      //TODO
    }
  },
});
