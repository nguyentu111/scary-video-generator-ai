import { ConvexError, v } from "convex/values";
import { internalMutation } from "./_generated/server";

export const updateCredit = internalMutation({
  args: { reduceCredit: v.number(), userId: v.id("users") },
  handler: async (ctx, { reduceCredit, userId }) => {
    const user = await ctx.db.get(userId);
    if (!user) throw new ConvexError("User not found");
    const currentCredits = user.credits;
    if (currentCredits < reduceCredit)
      throw new ConvexError("You don't have enough credit.");
    await ctx.db.patch(userId, {
      credits: currentCredits - reduceCredit,
    });
  },
});
