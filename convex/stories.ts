import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { api, internal } from "./_generated/api";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { Doc } from "./_generated/dataModel";
import { scheduler } from "timers/promises";

export const isStoryBelongToUser = internalQuery({
  args: { storyId: v.string(), userId: v.id("users") },
  handler: async (ctx, { storyId, userId }) => {
    const story = await ctx.db
      .query("stories")
      .filter((q) => q.eq(q.field("userId"), userId))
      .order("desc")
      .first();
    if (story?.userId !== userId) return false;
    return true;
  },
});
export const get = query({
  args: { id: v.id("stories") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Unauthenticated");
    return await ctx.db.get(args.id);
  },
});
export const getStories = query({
  args: {},
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Unauthenticated");
    }
    return await ctx.db
      .query("stories")
      .filter((q) => q.eq(q.field("userId"), userId))
      .order("desc")
      .collect();
  },
});
export const edit = mutation({
  args: {
    name: v.optional(v.string()),
    id: v.id("stories"),
    content: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new ConvexError("Unauthenticated");
    }
    if (
      !(await ctx.runQuery(internal.stories.isStoryBelongToUser, {
        storyId: args.id,
        userId,
      }))
    )
      throw new ConvexError("Forbidden");
    const story = await ctx.db.get(args.id);
    if (!story) throw new ConvexError("Story not found");
    return await ctx.db.patch(args.id, {
      name: args.name ? args.name : story.name,
      content: args.content ? args.content : story.content,
    });
  },
});
export const internalEdit = internalMutation({
  args: {
    name: v.optional(v.string()),
    id: v.id("stories"),
    content: v.optional(v.string()),
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
  },
  handler: async (ctx, args) => {
    const story = await ctx.db.get(args.id);
    if (!story) throw new ConvexError("Story not found");
    return await ctx.db.patch(args.id, {
      name: args.name ? args.name : story.name,
      content: args.content ? args.content : story.content,
      AIGenerateInfo: args.AIGenerateInfo,
    });
  },
});
export const createStory = mutation({
  args: {
    story: v.string(),
    name: v.string(),
    createType: v.union(
      v.literal("full-scripted"),
      v.literal("by-segments"),
      v.literal("by-ai"),
    ),
    prompt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new ConvexError("Unauthenticated");
    }
    const storyId = await ctx.db.insert("stories", {
      userId,
      name: args.name,
      content: args.story,
      createType: args.createType,
      AIGenerateInfo:
        args.createType === "by-ai"
          ? {
              prompt: args.prompt!,
              status: { state: "pending" },
              finishedRefine: false,
            }
          : undefined,
    });
    if (args.createType === "full-scripted")
      await ctx.scheduler.runAfter(0, internal.chatgpt.splitToSegment, {
        story: args.story,
        storyId: storyId,
      });

    if (args.createType === "by-segments") {
      await ctx.runMutation(internal.storySegments.inrternalInsert, {
        imagePrompt: "",
        order: 1,
        storyId,
        text: "",
      });
    }
    if (args.createType === "by-ai") {
      await ctx.scheduler.runAfter(0, internal.chatgpt.generateStory, {
        prompt: args.prompt!,
        name: args.name,
        storyId,
      });
    }
    return storyId;
  },
});
export const deleteStory = mutation({
  args: { id: v.id("stories") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Unauthenticated");
    }
    const story = await ctx.runQuery(api.stories.get, { id: args.id });
    if (story?.userId !== userId)
      throw new ConvexError("You do not have permission on this story");
    const segments = await ctx.db
      .query("storySegments")
      .filter((q) => q.eq(q.field("storyId"), story._id))
      .collect();
    await Promise.all(
      segments.map((segment) =>
        ctx.runMutation(internal.storySegments.internalDeleteStorySegment, {
          id: segment._id,
        }),
      ),
    );
    await ctx.db.delete(args.id);
  },
});
export const concatStoryContentFromSegments = internalMutation({
  args: { storyId: v.id("stories") },
  handler: async (ctx, { storyId }) => {
    const segments = await ctx.db
      .query("storySegments")
      .filter((q) => q.eq(q.field("storyId"), storyId))
      .collect();
    const storyContent = segments.reduce((acc, curr) => {
      return (acc += "\n" + curr.text);
    }, "");
    await ctx.db.patch(storyId, {
      content: storyContent,
    });
  },
});
export const editAiStory = mutation({
  args: {
    id: v.id("stories"),
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new ConvexError("Unauthenticated");
    }
    if (
      !(await ctx.runQuery(internal.stories.isStoryBelongToUser, {
        storyId: args.id,
        userId,
      }))
    ) {
      throw new ConvexError("Forbidden");
    }
    const story = (await ctx.db.get(args.id)) as Doc<"stories">;
    if (!story.AIGenerateInfo)
      throw new ConvexError("This story is not generated by AI");
    await ctx.db.patch(story._id, {
      AIGenerateInfo: {
        status: { state: "pending" },
        prompt: story.AIGenerateInfo?.prompt!,
        finishedRefine: false,
      },
    });
    await ctx.scheduler.runAfter(0, internal.chatgpt.refineStory, {
      prompt: `Fix this horror story satisfy the instruction : 
      Story : ${story.content},
      Instruction : ${args.prompt}
      `,
      storyId: story._id,
    });
  },
});
export const onDoneRefine = mutation({
  args: {
    id: v.id("stories"),
  },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new ConvexError("Unauthenticated");
    }
    if (
      !(await ctx.runQuery(internal.stories.isStoryBelongToUser, {
        storyId: id,
        userId,
      }))
    ) {
      throw new ConvexError("Forbidden");
    }
    const story = await ctx.db.get(id);
    if (!story) throw new ConvexError("Story not found");
    if (!story.AIGenerateInfo)
      throw new ConvexError("This story not generated by AI");
    await ctx.db.patch(id, {
      AIGenerateInfo: {
        ...story.AIGenerateInfo,
        finishedRefine: true,
      },
    });
    await ctx.scheduler.runAfter(0, internal.chatgpt.splitToSegment, {
      story: story.content,
      storyId: story._id,
    });
  },
});
