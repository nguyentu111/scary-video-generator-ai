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
import type * as http from "../http.js";
import type * as images from "../images.js";
import type * as logs from "../logs.js";
import type * as segments from "../segments.js";
import type * as sqs from "../sqs.js";
import type * as stories from "../stories.js";
import type * as users from "../users.js";

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
  http: typeof http;
  images: typeof images;
  logs: typeof logs;
  segments: typeof segments;
  sqs: typeof sqs;
  stories: typeof stories;
  users: typeof users;
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
