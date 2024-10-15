import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";
const schema = defineSchema({
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    // other "users" fields...
    credits: v.number(),
  }).index("email", ["email"]),
  stories: defineTable({
    name: v.string(),
    userId: v.id("users"),
    content: v.string(),
    createType: v.union(
      v.literal("full-scripted"),
      v.literal("by-segments"),
      v.literal("by-ai"),
    ),
    AIGenerateInfo: v.optional(
      v.object({
        prompt: v.string(),
        finishedRefine: v.boolean(),
        status: v.union(
          v.object({
            state: v.literal("pending"),
          }),
          v.object({
            state: v.literal("failed"),
            reason: v.string(),
          }),
          v.object({
            state: v.literal("saved"),
          }),
        ),
      }),
    ),
    format: v.union(v.literal("16:9"), v.literal("9:16")),
    context: v.optional(
      v.union(
        v.object({
          state: v.literal("pending"),
        }),
        v.object({
          state: v.literal("failed"),
          reason: v.string(),
        }),
        v.object({
          state: v.literal("saved"),
          data: v.string(),
        }),
      ),
    ),
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
        publicId: v.string(),
        elapsedMs: v.number(),
      }),
    ),
  }).index("storyId", ["storyId"]),
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
        publicId: v.string(),
        videoUrl: v.string(),
        elapsedMs: v.number(),
      }),
    ),
  }).index("storyId", ["storyId"]),
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
        publicId: v.string(),
        voiceDuration: v.number(),
        voiceUrl: v.string(),
        voiceSrt: v.string(),
        elapsedMs: v.number(),
      }),
      v.object({
        status: v.literal("cached"),
        publicId: v.string(),
        voiceDuration: v.number(),
        voiceUrl: v.string(),
        voiceSrt: v.string(),
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
        publicId: v.string(),
        status: v.literal("saved"),
        videoUrl: v.string(),
        elapsedMs: v.number(),
      }),
      v.object({
        publicId: v.string(),
        status: v.literal("cached"),
        videoUrl: v.string(),
      }),
    ),
  }).index("videoId", ["videoId"]),

  channels: defineTable({
    refreshToken: v.string(),
    userId: v.id("users"),
    expireAt: v.number(),
    channelId: v.string(),
    channelTitle: v.string(),
  }).index("userId", ["userId"]),
});

export default schema;
