"use node";
import { v2 as cloudinary } from "cloudinary";
import { internalAction } from "./_generated/server";
import { v } from "convex/values";
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
    return result.url;
  },
});
