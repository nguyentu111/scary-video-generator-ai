"use node";
import Replicate from "replicate";
import { internalAction, mutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import md5 from "md5";
export const generateImage = internalAction({
  args: {
    prompt: v.string(),
    segmentId: v.id("storySegments"),
    storyId: v.id("stories"),
  },
  handler: async (ctx, args) => {
    const time = Date.now();
    const replicate = new Replicate({ auth: process.env.REPLICATE_API_KEY });
    const input = {
      prompt: args.prompt,
      aspect_ratio: "16:9",
      output_format: "png",
    };
    const output = (await replicate.run("black-forest-labs/flux-schnell", {
      input,
    })) as string[];
    const imageUrl = output[0]!;
    const savedUrl = await ctx.runAction(
      internal.cloudinary.uploadImageFromUrl,
      {
        folder: "images/story_" + args.storyId,
        imageUrl,
        filename: md5(args.prompt),
      },
    );
    await ctx.runMutation(internal.storySegments.editImageStatus, {
      id: args.segmentId,
      imageStatus: {
        status: "saved",
        imageUrl: savedUrl,
        elapsedMs: Date.now() - time,
      },
    });
  },
});
