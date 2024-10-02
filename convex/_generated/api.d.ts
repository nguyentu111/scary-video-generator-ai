/* prettier-ignore-start */

/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as chatgpt from "../chatgpt.js";
import type * as cloudinary from "../cloudinary.js";
import type * as http from "../http.js";
import type * as images from "../images.js";
import type * as logs from "../logs.js";
import type * as replicate from "../replicate.js";
import type * as sqs from "../sqs.js";
import type * as stories from "../stories.js";
import type * as storySegments from "../storySegments.js";
import type * as users from "../users.js";
import type * as videos from "../videos.js";
import type * as videoSegments from "../videoSegments.js";
import type * as voices from "../voices.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  chatgpt: typeof chatgpt;
  cloudinary: typeof cloudinary;
  http: typeof http;
  images: typeof images;
  logs: typeof logs;
  replicate: typeof replicate;
  sqs: typeof sqs;
  stories: typeof stories;
  storySegments: typeof storySegments;
  users: typeof users;
  videos: typeof videos;
  videoSegments: typeof videoSegments;
  voices: typeof voices;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

/* prettier-ignore-end */
