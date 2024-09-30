import { v } from "convex/values";
import { internalMutation, mutation } from "./_generated/server";

export const create = internalMutation({
  args: {
    message: v.string(),
    function: v.string(),
    additionals: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("logs", {
      messsage: args.message,
      function: args.function,
      additionals: args.additionals,
    });
  },
});
