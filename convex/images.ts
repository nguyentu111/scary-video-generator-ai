import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { httpAction } from "./_generated/server";

export const getImage = httpAction(async (ctx, request) => {
  const { searchParams } = new URL(request.url);
  const storageId = searchParams.get("storageId")! as Id<"_storage">;
  const blob = await ctx.storage.get(storageId);
  if (blob === null) {
    return new Response("Image not found", {
      status: 404,
    });
  }
  return new Response(blob);
});
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
  await ctx.runMutation(internal.logs.create, {
    message: "updating storage id",
    function: "updateStorageIdToSegment",
  });
  const data = (await request.json()) as {
    segmentId: string;
    storageId: string;
  };
  await ctx.runMutation(api.segments.editImageId, {
    id: data.segmentId as Id<"segments">,
    imageId: data.storageId as Id<"_storage">,
  });
  return new Response(null, {
    status: 200,
    headers: new Headers({
      "Access-Control-Allow-Origin": "*",
      Vary: "origin",
    }),
  });
});
