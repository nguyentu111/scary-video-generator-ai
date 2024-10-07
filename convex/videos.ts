import { ConvexError, v } from "convex/values";
import {
  httpAction,
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { api, internal } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Doc, Id } from "./_generated/dataModel";
import { filter } from "convex-helpers/server/filter";
export const get = query({
  args: { id: v.id("videos") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Unauthenticated");
    const video = await ctx.db.get(args.id);
    if (!video) throw new ConvexError("Video not found");
    if (
      await ctx.runQuery(internal.videos.isVideoBelongToUser, {
        videoId: video?._id,
        userId: userId,
      })
    ) {
      return video;
    } else throw new ConvexError("Video not found");
  },
});
export const internalGet = internalQuery({
  args: { id: v.id("videos") },
  handler: async (ctx, args) => {
    const video = await ctx.db.get(args.id);
    if (!video) throw new ConvexError("Video not found");
    return await ctx.db.get(args.id);
  },
});
export const isVideoBelongToUser = internalQuery({
  args: { videoId: v.id("videos"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const video = await ctx.db.get(args.videoId);
    if (!video) throw new ConvexError("Video not found");
    const story = await ctx.db.get(video.storyId);
    return story?.userId === args.userId;
  },
});
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
    if (storySegment.some((s) => s.imageStatus.status !== "saved"))
      throw new ConvexError(`Some image of story is not saved`);
    await Promise.all(
      storySegment.map(async (s) => {
        if (s.imageStatus.status === "saved") {
          //check if the voice is created
          const otherVideosFromThisStory = await ctx.db
            .query("videos")
            .filter((q) => q.eq(q.field("storyId"), story._id))
            .collect();
          const otherVideoSegmentsWithSameText = await filter(
            ctx.db.query("videoSegments"),
            (segment) => {
              return (
                otherVideosFromThisStory
                  .map((a) => a._id)
                  .includes(segment.videoId) &&
                segment.voiceStatus.status === "saved"
              );
            },
          )
            .filter((q) => q.eq(q.field("text"), s.text))
            .collect();
          if (
            otherVideoSegmentsWithSameText.length > 0 &&
            process.env.CACHE_GENERATE_VOICE === "true"
          ) {
            const segmentWithSameTextAndImage =
              otherVideoSegmentsWithSameText.find(
                (os) =>
                  s.imageStatus.status === "saved" &&
                  os.imageUrl === s.imageStatus.imageUrl,
              );
            type videoSegmentWithVoiceSaved = Doc<"videoSegments"> & {
              voiceStatus: {
                status: "saved";
                elapsedMs: number;
                publicId: string;
                voiceDuration: number;
                voiceUrl: string;
                voiceSrt: string;
              };
            };
            const choosingSegmentToCopy = (segmentWithSameTextAndImage ??
              otherVideoSegmentsWithSameText[0]) as videoSegmentWithVoiceSaved;
            //copy to new videoSegment
            const videoSegmentId = await ctx.db.insert("videoSegments", {
              videoId,
              order: s.order,
              videoStatus: {
                status: "pending",
                details: "Creating ...",
              },
              voiceStatus: {
                status: "cached",
                publicId: (
                  choosingSegmentToCopy.voiceStatus as { publicId: string }
                ).publicId,
                voiceDuration: (
                  choosingSegmentToCopy.voiceStatus as { voiceDuration: number }
                ).voiceDuration,
                voiceUrl: (
                  choosingSegmentToCopy.voiceStatus as { voiceUrl: string }
                ).voiceUrl,
                voiceSrt: (
                  choosingSegmentToCopy.voiceStatus as { voiceSrt: string }
                ).voiceSrt,
              },
              text: s.text,
              imagePrompt: s.imagePrompt,
              imageUrl: s.imageStatus.imageUrl,
            });
            //directly call generateSegmentVideo
            //chheck if new segment image  === some
            if (
              segmentWithSameTextAndImage &&
              process.env.CACHE_GENERATE_SEGMENT_VIDEO === "true"
            ) {
              await ctx.db.patch(videoSegmentId, {
                videoStatus: {
                  status: "cached",
                  publicId: (
                    segmentWithSameTextAndImage.videoStatus as {
                      publicId: string;
                    }
                  ).publicId,
                  videoUrl: (
                    segmentWithSameTextAndImage.videoStatus as {
                      videoUrl: string;
                    }
                  ).videoUrl,
                },
              });
            } else
              await ctx.scheduler.runAfter(
                0,
                internal.sqs.sendSqsMessageGenerateSegmentVideo,
                {
                  message: {
                    imageUrl: s.imageStatus.imageUrl,
                    segmentId: videoSegmentId,
                    voiceUrl: choosingSegmentToCopy.voiceStatus.voiceUrl,
                    voiceDuration:
                      choosingSegmentToCopy.voiceStatus.voiceDuration,
                    voiceSrt: choosingSegmentToCopy.voiceStatus.voiceSrt,
                  },
                },
              );
          } else {
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
            // await ctx.scheduler.runAfter(
            //   0,
            //   internal.sqs.sendSqsMessageGenerateVoice,
            //   {
            //     attributes: {
            //       segmentId: {
            //         DataType: "String",
            //         StringValue: videoSegmentId,
            //       },
            //       videoId: { DataType: "String", StringValue: videoId },
            //     },
            //     message: s.text,
            //   },
            // );
          }
        } else
          throw new ConvexError(
            `ImageUrl of storySegment with id ${s._id} is empty `,
          );
      }),
    );

    return 123;
  },
});

export const getCurrentUserVideos = query({
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
    const videoSegments = await ctx.db
      .query("videoSegments")
      .filter((q) => q.eq(q.field("videoId"), video?._id))
      .collect();
    return (
      videoSegments.length > 1 &&
      videoSegments.every(
        (v) => v.videoStatus.status === "saved" && v.videoStatus.videoUrl,
      )
    );
  },
});
// export const checkGeneratedVoiceAndFrames = internalAction({
//   args: { videoId: v.id("videos") },
//   handler: async (ctx, args) => {
//     await ctx.runMutation(internal.logs.create, {
//       function: "checkGeneratedVoiceAndFrames",
//       message: "checking can create video on generatedFramesCallback",
//     });
//     const isCanCreateVideo = await ctx.runQuery(
//       internal.videos.isCanCreateVideo,
//       { videoId: args.videoId },
//     );
//     if (isCanCreateVideo) {
//       //TODO
//     }
//   },
// });

export const editVideoResult = internalMutation({
  args: {
    id: v.id("videos"),
    result: v.union(
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
  async handler(ctx, args) {
    return await ctx.db.patch(args.id, {
      result: args.result,
    });
  },
});
export const finalVideoGeneratedCallback = httpAction(async (ctx, request) => {
  const data = (await request.json()) as {
    id: Id<"videos">;
    result:
      | {
          status: "failed";
          reason: string;
          elapsedMs: number;
        }
      | {
          status: "saved";
          elapsedMs: number;
          videoUrl: string;
          publicId: string;
        };
  };
  await ctx.runMutation(internal.videos.editVideoResult, {
    id: data.id,
    result: data.result,
  });
  return new Response(null, { status: 200 });
});
export const deleteVideo = mutation({
  args: { id: v.id("videos") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Unauthenticated");
    const video = await ctx.runQuery(api.videos.get, { id: args.id });
    if (!video) throw new ConvexError("Video not found");
    // if (video.result.status !== "saved") throw new ConvexError("Video error");
    if (
      !(await ctx.runQuery(internal.videos.isVideoBelongToUser, {
        videoId: args.id,
        userId: userId,
      }))
    )
      throw new ConvexError("Video not found");
    await ctx.db.delete(args.id);
    const videoSegments = await ctx.db
      .query("videoSegments")
      .filter((q) => q.eq(q.field("videoId"), args.id))
      .collect();
    const publicIds = videoSegments
      .filter((v) => v.videoStatus.status === "saved")
      .map((v) => (v.videoStatus as { publicId: string }).publicId);
    await Promise.all(
      videoSegments.map(async (s) => {
        await ctx.db.delete(s._id);
      }),
    );
    await ctx.scheduler.runAfter(0, internal.cloudinary.deleteFiles, {
      publicIds,
    });
    return 1;
  },
});
