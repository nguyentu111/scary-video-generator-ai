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
  segments: defineTable({
    text: v.string(),
    imagePromt: v.string(),
    imageUrl: v.optional(v.string()),
    imageStatus: v.union(
      v.literal("none"),
      v.literal("creating"),
      v.literal("error"),
      v.literal("success"),
    ),
    storyId: v.id("stories"),
    order: v.number(),
    voiceUrl: v.optional(v.string()),
    voiceDuration: v.optional(v.number()),
  }),
  logs: defineTable({
    messsage: v.string(),
    function: v.string(),
    additionals: v.optional(v.any()),
  }),
  videos: defineTable({
    storyId: v.id("stories"),
    videoUrl: v.optional(v.string()),
    status: v.union(
      v.literal("creating"),
      v.literal("success"),
      v.literal("error"),
    ),
  }),
});

export default schema;
