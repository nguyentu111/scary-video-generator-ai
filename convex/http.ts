import { httpRouter } from "convex/server";
import { sendImageOptions, sendImagePost } from "./images";
import { auth } from "./auth";
import { voiceGeneratedCallback } from "./voices";
import { segmentVideoGeneratedCallback } from "./videoSegments";
import { finalVideoGeneratedCallback } from "./videos";
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
auth.addHttpRoutes(http);
export default http;
