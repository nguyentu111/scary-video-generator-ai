import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";
const schema = defineSchema({
  ...authTables,
  stories: defineTable({
    name: v.string(),
    userId: v.id("users"),
    content: v.string(),
  }),
  storySegments: defineTable({
    text: v.string(),
    imagePrompt: v.string(),
    storyId: v.id("stories"),
    order: v.number(),
    imageStatus: v.union(
      v.object({
        status: v.literal("pending"),
        details: v.string(),
      }),
      v.object({
        status: v.literal("failed"),
        reason: v.string(),
        elapsedMs: v.number(),
      }),
      v.object({
        status: v.literal("saved"),
        imageUrl: v.string(),
        elapsedMs: v.number(),
      }),
    ),
  }),
  logs: defineTable({
    messsage: v.string(),
    function: v.string(),
    additionals: v.optional(v.any()),
  }),
  videos: defineTable({
    storyId: v.id("stories"),
    name: v.string(),
    result: v.union(
      v.object({
        status: v.literal("pending"),
        details: v.string(),
      }),
      v.object({
        status: v.literal("failed"),
        reason: v.string(),
        elapsedMs: v.number(),
      }),
      v.object({
        status: v.literal("saved"),
        videoUrl: v.string(),
        elapsedMs: v.number(),
      }),
    ),
  }),
  videoSegments: defineTable({
    videoId: v.id("videos"),
    text: v.string(),
    imagePrompt: v.string(),
    imageUrl: v.string(),
    order: v.number(),
    voiceStatus: v.union(
      v.object({
        status: v.literal("pending"),
        details: v.string(),
      }),
      v.object({
        status: v.literal("failed"),
        reason: v.string(),
        elapsedMs: v.number(),
      }),
      v.object({
        status: v.literal("saved"),
        voiceDuration: v.number(),
        voiceUrl: v.string(),
        voiceSrt: v.string(),
        elapsedMs: v.number(),
      }),
    ),

    videoStatus: v.union(
      v.object({
        status: v.literal("pending"),
        details: v.string(),
      }),
      v.object({
        status: v.literal("failed"),
        reason: v.string(),
        elapsedMs: v.number(),
      }),
      v.object({
        status: v.literal("saved"),
        videoUrl: v.string(),
        elapsedMs: v.number(),
      }),
    ),
  }),
});

export default schema;
