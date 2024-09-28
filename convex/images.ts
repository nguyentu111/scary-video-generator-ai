import { httpAction } from "./_generated/server";

export const sendImagePost = httpAction(async (ctx, request) => {
  // Step 1: Store the file
  const blob = await request.blob();
  const storageId = await ctx.storage.store(blob);
  // Step 2: Save the storage ID to the database via a mutation
  //   const author = new URL(request.url).searchParams.get("author");
  //   await ctx.runMutation(api.messages.sendImage, { storageId, author });

  // Step 3: Return a response with the correct CORS headers
  return new Response(null, {
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
  return new Response(null, {
    status: 200,
    // CORS headers
    headers: new Headers({
      // e.g. https://mywebsite.com, configured on your Convex dashboard
      "Access-Control-Allow-Origin": "*",
      Vary: "origin",
    }),
  });
});
