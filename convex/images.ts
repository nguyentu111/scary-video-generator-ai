import { ConvexError, v } from "convex/values";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { action, httpAction, internalAction } from "./_generated/server";

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

export const updateStorageIdToSegment = httpAction(async (ctx, request) => {
  try {
    const data = (await request.json()) as {
      segmentId: string;
      imageUrl: string;
    };
    await ctx.runMutation(internal.logs.create, {
      message: "updating image url: " + data.segmentId,
      function: "updateStorageIdToSegment",
    });
    await ctx.runMutation(api.segments.editImageId, {
      id: data.segmentId as Id<"segments">,
      imageUrl: data.imageUrl,
      status: "success",
    });
    return new Response(null, {
      status: 200,
      headers: new Headers({
        "Access-Control-Allow-Origin": "*",
        Vary: "origin",
      }),
    });
  } catch (error) {
    if (error instanceof Error) {
      await ctx.runMutation(internal.logs.create, {
        message: error.message,
        function: "images.updateStorageIdToSegment.error",
      });
      return new Response(error.message, {
        status: 500,
        headers: new Headers({
          "Access-Control-Allow-Origin": "*",
          Vary: "origin",
        }),
      });
    } else {
      await ctx.runMutation(internal.logs.create, {
        message: "Unkown error occur :<<",
        function: "images.updateStorageIdToSegment.error",
      });
      return new Response("Unkown error occur :<<", {
        status: 500,
        headers: new Headers({
          "Access-Control-Allow-Origin": "*",
          Vary: "origin",
        }),
      });
    }
  }
});
export const regenerateImage = action({
  args: { segmentId: v.id("segments"), prompt: v.string() },
  handler: async (ctx, args) => {
    const segment = await ctx.runQuery(api.segments.getOne, {
      id: args.segmentId,
    });
    if (!segment) throw new ConvexError("Segment not found");
    await ctx.runMutation(api.segments.editImageId, {
      id: args.segmentId,
      imageUrl: undefined,
      status: "creating",
    });
    await ctx.runAction(internal.sqs.sendSqsMessageGenerateImage, {
      message: args.prompt,
      attributes: {
        segmentId: {
          DataType: "String",
          StringValue: args.segmentId.toString(),
        },
        folder: {
          DataType: "String",
          StringValue: "images/story_" + segment.storyId,
        },
      },
    });
    return "ok";
  },
});
