import { httpRouter } from "convex/server";
import { sendImageOptions, sendImagePost } from "./images";

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
export default http;
