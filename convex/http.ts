import { httpRouter } from "convex/server";
import {
  sendImageOptions,
  sendImagePost,
  updateStorageIdToSegment,
  getImage,
} from "./images";
import { auth } from "./auth";
const http = httpRouter();

http.route({
  path: "/getImage",
  method: "GET",
  handler: getImage,
});
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

auth.addHttpRoutes(http);
export default http;
