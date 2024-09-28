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
    imageId: v.optional(v.id("_storage")),
    storyId: v.id("stories"),
  }),
  logs: defineTable({
    messsage: v.string(),
    function: v.string(),
    additionals: v.optional(v.any()),
  }),
});

export default schema;
