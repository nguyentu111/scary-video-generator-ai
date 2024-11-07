import { ConvexError, v } from "convex/values";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import {
  action,
  httpAction,
  internalAction,
  mutation,
} from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import md5 from "md5";

export const sendImagePost = httpAction(async (ctx, request) => {
  // Step 1: Store the file
  const blob = await request.blob();
  const storageId = await ctx.storage.store(blob);
  // Step 2: Save the storage ID to the database via a mutation
  //   const author = new URL(request.url).searchParams.get("author");
  //   await ctx.runMutation(api.messages.sendImage, { storageId, author });

  // Step 3: Return a response with the correct CORS headers
  return new Response(JSON.stringify({ storageId }), {
    status: 200,

    // CORS headers
    headers: new Headers({
      // e.g. https://mywebsite.com, configured on your Convex dashboard
      "Access-Control-Allow-Origin": "*",
      Vary: "origin",
    }),
  });
});
export const sendImageOptions = httpAction(async (ctx, request) => {
  // Step 1: Store the file
  const blob = await request.blob();
  const storageId = await ctx.storage.store(blob);

  // Step 2: Save the storage ID to the database via a mutation
  //   const author = new URL(request.url).searchParams.get("author");
  //   await ctx.runMutation(api.messages.sendImage, { storageId, author });

  // Step 3: Return a response with the correct CORS headers
  return new Response(storageId.toString(), {
    status: 200,
    // CORS headers
    headers: new Headers({
      // e.g. https://mywebsite.com, configured on your Convex dashboard
      "Access-Control-Allow-Origin": "*",
      Vary: "origin",
    }),
  });
});

// export const updateStorageIdToSegment = httpAction(async (ctx, request) => {
//   try {
//     const data = (await request.json()) as {
//       segmentId: string;
//       imageUrl: string;
//     };
//     await ctx.runMutation(internal.logs.create, {
//       message: "updating image url: " + data.segmentId,
//       function: "updateStorageIdToSegment",
//     });
//     await ctx.runMutation(internal.storySegments.edit, {
//       id: data.segmentId as Id<"storySegments">,

//     });
//     return new Response(null, {
//       status: 200,
//       headers: new Headers({
//         "Access-Control-Allow-Origin": "*",
//         Vary: "origin",
//       }),
//     });
//   } catch (error) {
//     if (error instanceof Error) {
//       await ctx.runMutation(internal.logs.create, {
//         message: error.message,
//         function: "images.updateStorageIdToSegment.error",
//       });
//       return new Response(error.message, {
//         status: 500,
//         headers: new Headers({
//           "Access-Control-Allow-Origin": "*",
//           Vary: "origin",
//         }),
//       });
//     } else {
//       await ctx.runMutation(internal.logs.create, {
//         message: "Unkown error occur :<<",
//         function: "images.updateStorageIdToSegment.error",
//       });
//       return new Response("Unkown error occur :<<", {
//         status: 500,
//         headers: new Headers({
//           "Access-Control-Allow-Origin": "*",
//           Vary: "origin",
//         }),
//       });
//     }
//   }
// });
export const regenerateImage = mutation({
  args: { segmentId: v.id("storySegments"), prompt: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError("Unauthenticated");
    const segment = await ctx.runQuery(api.storySegments.get, {
      id: args.segmentId,
    });
    if (!segment) throw new ConvexError("Segment not found");
    const story = await ctx.runQuery(api.stories.get, { id: segment.storyId });
    if (!story || story.userId !== userId)
      throw new ConvexError("Segment not found");

    await ctx.runMutation(api.storySegments.edit, {
      imagePrompt: args.prompt,
      text: segment.text,
      id: segment._id,
      imageStatus: {
        status: "pending",
        details: "Creating image...",
      },
    });
    await ctx.scheduler.runAfter(0, internal.images.regenerateImageJob, {
      prompt: args.prompt,
      segmentId: args.segmentId,
      storyId: story._id,
      format: story.format ?? "16:9",
    });

    return "ok";
  },
});
export const regenerateImageJob = internalAction({
  args: {
    prompt: v.string(),
    segmentId: v.id("storySegments"),
    storyId: v.id("stories"),
    format: v.union(v.literal("16:9"), v.literal("9:16")),
  },
  handler: async (ctx, { format, prompt, segmentId, storyId }) => {
    const time = Date.now();
    try {
      const imageUrl = await ctx.runAction(internal.replicate.generateImage, {
        format,
        prompt,
      });
      const savedRes = await ctx.runAction(
        internal.cloudinary.uploadImageFromUrl,
        {
          folder: `scary_video/${process.env.NODE_ENV}/images/story_` + storyId,
          imageUrl,
          filename: md5(prompt),
        },
      );
      await ctx.runMutation(internal.storySegments.internalEdit, {
        id: segmentId,
        imageStatus: {
          status: "saved",
          elapsedMs: Date.now() - time,
          imageUrl: savedRes.secure_url,
          publicId: savedRes.public_id,
        },
      });
    } catch (error) {
      await ctx.runMutation(internal.storySegments.internalEdit, {
        id: segmentId,
        imageStatus: {
          status: "failed",
          elapsedMs: Date.now() - time,
          reason: (error as Error).message,
        },
      });
    }
  },
});
export const generateStoryImages = internalAction({
  args: { storyId: v.id("stories") },
  handler: async (ctx, { storyId }) => {
    const story = await ctx.runQuery(api.stories.get, { id: storyId });
    if (!story) throw new ConvexError("Story not found");
    const segments = await ctx.runQuery(api.storySegments.getByStoryId, {
      storyId,
    });
  },
});
