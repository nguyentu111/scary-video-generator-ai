"use node";
import { v2 as cloudinary } from "cloudinary";
import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});
export const uploadImageFromUrl = internalAction({
  args: { folder: v.string(), imageUrl: v.string(), filename: v.string() },
  handler: async (ctx, args) => {
    const result = await cloudinary.uploader.upload(args.imageUrl, {
      resource_type: "image",
      folder: args.folder,
      public_id: args.filename,
    });
    return result;
  },
});
export const deleteFiles = internalAction({
  args: { publicIds: v.array(v.string()) },
  handler: async (ctx, args) => {
    await Promise.all(
      args.publicIds.map(async (id) => {
        try {
          await cloudinary.uploader.destroy(id);
        } catch (error) {
          await ctx.runMutation(internal.logs.create, {
            message:
              "Error when delete file from cloudinary: " +
              (error as Error).message,
            function: "deleteFiles.error",
          });
        }
      }),
    );
  },
});
