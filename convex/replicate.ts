"use node";
import { v } from "convex/values";
import Replicate from "replicate";
import { internalAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import md5 from "md5";
export const generateImage = internalAction({
  args: {
    prompt: v.string(),
    format: v.union(v.literal("16:9"), v.literal("9:16")),
  },
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.logs.create, {
      message: "Start to generate image from replicate",
      function: "generateImage.start",
    });
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
    await ctx.runMutation(internal.logs.create, {
      message: "Success to generate image from replicate:" + imageUrl,
      function: "generateImage.success",
    });
    return imageUrl;
  },
});
export const generateImagesAndSave = internalAction({
  args: {
    data: v.array(
      v.object({
        prompt: v.string(),
        format: v.union(v.literal("16:9"), v.literal("9:16")),
        segmentId: v.id("storySegments"),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const timeStart = new Date();
    await Promise.all(
      args.data.map(async (d) => {
        const image = await ctx.runAction(internal.replicate.generateImage, {
          prompt: d.prompt,
          format: d.format,
        });
        const segment = await ctx.runQuery(api.storySegments.get, {
          id: d.segmentId,
        });
        const savedRes = await ctx.runAction(
          internal.cloudinary.uploadImageFromUrl,
          {
            folder:
              `scary_video/${process.env.NODE_ENV}/images/story_` +
              segment?.storyId,
            imageUrl: image,
            filename: md5(d.prompt),
          },
        );
        const timeEnd = new Date();
        await ctx.runMutation(internal.storySegments.internalEdit, {
          id: d.segmentId,
          imageStatus: {
            status: "saved",
            imageUrl: savedRes.url,
            elapsedMs: timeEnd.getTime() - timeStart.getTime(),
            publicId: savedRes.public_id,
          },
        });
      }),
    );
  },
});
