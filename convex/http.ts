import { httpRouter } from "convex/server";
import { sendImageOptions, sendImagePost } from "./images";
import { auth } from "./auth";
import { voiceGeneratedCallback } from "./voices";
import { segmentVideoGeneratedCallback } from "./videoSegments";
import { finalVideoGeneratedCallback } from "./videos";
import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";
import { Id } from "./_generated/dataModel";
const http = httpRouter();

http.route({
  path: "/sendImage",
  method: "POST",
  handler: sendImagePost,
});
http.route({
  path: "/sendImage",
  method: "OPTIONS",
  handler: sendImageOptions,
});
// http.route({
//   path: "/updateStorageIdToSegment",
//   method: "POST",
//   handler: updateStorageIdToSegment,
// });
http.route({
  path: "/voiceGeneratedCallback",
  method: "POST",
  handler: voiceGeneratedCallback,
});
http.route({
  path: "/segmentVideoGeneratedCallback",
  method: "POST",
  handler: segmentVideoGeneratedCallback,
});
http.route({
  path: "/finalVideoGeneratedCallback",
  method: "POST",
  handler: finalVideoGeneratedCallback,
});
http.route({
  path: "/api/auth/youtube",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    if (!code || !state) {
      return new Response(null, {
        status: 403,
      });
    }
    // Decode the state parameter to get the userId
    const userId = decodeURIComponent(state) as Id<"users">;
    console.log("state", state);
    console.log("code", code);

    const { accessToken, refreshToken, expireAt } = await ctx.runAction(
      internal.youtube.processCodeAction,
      {
        code,
      },
    );
    if (!accessToken || !refreshToken || !expireAt)
      return new Response(null, { status: 403 });
    const info = await ctx.runAction(internal.youtube.getChannelInfoAction, {
      accessToken,
      refreshToken,
    });
    await ctx.runMutation(internal.channels.save, {
      channelId: info.id ?? "",
      channelTitle: info.title ?? "Unknown",
      expireAt,
      refreshToken,
      userId,
    });
    return new Response(null, {
      status: 302,
      headers: { Location: `${process.env.SITE_URL}/videos` },
    });
  }),
});

auth.addHttpRoutes(http);
export default http;
