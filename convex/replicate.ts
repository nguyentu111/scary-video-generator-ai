"use node";
import Replicate from "replicate";
import { internalAction, mutation } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import md5 from "md5";
export const generateImage = internalAction({
  args: {
    prompt: v.string(),
    format: v.union(v.literal("16:9"), v.literal("9:16")),
  },
  handler: async (ctx, args) => {
    const replicate = new Replicate({ auth: process.env.REPLICATE_API_KEY });
    const input = {
      prompt: args.prompt,
      aspect_ratio: args.format,
      output_format: "png",
    };
    const output = (await replicate.run("black-forest-labs/flux-schnell", {
      input,
    })) as string[];
    const imageUrl = output[0]!;
    return imageUrl;
  },
});
