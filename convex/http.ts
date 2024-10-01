import { httpRouter } from "convex/server";
import {
  sendImageOptions,
  sendImagePost,
  updateStorageIdToSegment,
} from "./images";
import { auth } from "./auth";
import { voiceGeneratedCallback } from "./voices";
import { framesGeneratedCallback } from "./frames";
import { segmentVideoGeneratedCallback } from "./segments";
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
http.route({
  path: "/framesGeneratedCallback",
  method: "POST",
  handler: framesGeneratedCallback,
});
http.route({
  path: "/segmentVideoGeneratedCallback",
  method: "POST",
  handler: segmentVideoGeneratedCallback,
});
auth.addHttpRoutes(http);
export default http;
