import { internalMutation, mutation } from "./_generated/server";

export const generateUploadUrl = internalMutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});
