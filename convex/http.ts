import { httpRouter } from "convex/server";
import {
  sendImageOptions,
  sendImagePost,
  updateStorageIdToSegment,
} from "./images";
import { auth } from "./auth";
import { voiceGeneratedCallback } from "./voices";
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
http.route({
  path: "/updateStorageIdToSegment",
  method: "POST",
  handler: updateStorageIdToSegment,
});
http.route({
  path: "/voiceGeneratedCallback",
  method: "POST",
  handler: voiceGeneratedCallback,
});
auth.addHttpRoutes(http);
export default http;
