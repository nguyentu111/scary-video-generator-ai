"use node";
import { ConvexError, v } from "convex/values";
import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";
import { action, internalAction, mutation } from "./_generated/server";
import { auth } from "./auth";
import { internal } from "./_generated/api";
import axios from "axios";
import { Readable } from "stream";
import { Id } from "./_generated/dataModel";
// export const getAuthUrl = mutation({
//   args : {}
// ,
// handler: async (ctx, {})=>{
//   await ctx.
// }})
export const getAuthUrlAction = action({
  args: {},
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }
    const state = encodeURIComponent(userId);
    const oauth2Client = new OAuth2Client(
      process.env.AUTH_GOOGLE_ID,
      process.env.AUTH_GOOGLE_SECRET,
      `${process.env.CONVEX_SITE_URL}/api/auth/youtube`,
    );
    return oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/youtube.upload",
        "https://www.googleapis.com/auth/youtube.readonly",
      ],
      state: state,
      prompt: "consent",
    });
  },
});
export const processCodeAction = internalAction({
  args: {
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const oauth2Client = new OAuth2Client(
      process.env.AUTH_GOOGLE_ID,
      process.env.AUTH_GOOGLE_SECRET,
      `${process.env.CONVEX_SITE_URL}/api/auth/youtube`, // Add redirect URI
    );
    try {
      const { tokens } = await oauth2Client.getToken(args.code);
      return {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expireAt: tokens.expiry_date,
      };
    } catch (error) {
      console.error("Error getting token:", error);
      throw error;
    }
  },
});

export const getChannelInfoAction = internalAction({
  args: {
    accessToken: v.string(),
    refreshToken: v.string(),
  },
  handler: async (ctx, args) => {
    const oauth2Client = new OAuth2Client(
      process.env.AUTH_GOOGLE_ID,
      process.env.AUTH_GOOGLE_SECRET,
      `${process.env.CONVEX_SITE_URL}/api/auth/youtube`,
    );

    oauth2Client.setCredentials({
      access_token: args.accessToken,
      refresh_token: args.refreshToken,
    });

    const youtube = google.youtube({ version: "v3", auth: oauth2Client });

    try {
      const response = await youtube.channels.list({
        part: ["snippet"],
        mine: true,
      });

      if (response.data.items && response.data.items.length > 0) {
        const channel = response.data.items[0]!;
        return {
          id: channel.id,
          title: channel.snippet?.title,
        };
      }
      {
        throw new ConvexError("No channel found for this access token");
      }
    } catch (error) {
      console.error("Error fetching channel info:", error);
      throw error;
    }
  },
});
export const uploadToYoutube = action({
  args: {
    videoId: v.id("videos"),
    channelId: v.id("channels"),
    name: v.string(),
    description: v.string(),
  },
  handler: async (ctx, { channelId, videoId, description, name }) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new ConvexError("Unauthenticated");
    const video = await ctx.runQuery(internal.videos.internalGet, {
      id: videoId,
    });
    if (!video) throw new ConvexError("Video not found");
    if (video.result.status !== "saved") throw new ConvexError("Video error");
    if (
      !(await ctx.runQuery(internal.videos.isVideoBelongToUser, {
        videoId: videoId,
        userId: userId,
      }))
    )
      throw new ConvexError("Video not found");
    const channel = await ctx.runQuery(internal.channels.internalGet, {
      id: channelId,
    });
    if (!channel) throw new ConvexError("Channel not found");
    if (userId !== channel.userId) throw new ConvexError("Forbidden");
    const oauth2Client = new OAuth2Client(
      process.env.AUTH_GOOGLE_ID,
      process.env.AUTH_GOOGLE_SECRET,
      `${process.env.NODE_ENV === "production" ? process.env.CONVEX_SITE_URL_PROD : process.env.CONVEX_SITE_URL_DEV}`,
    );
    oauth2Client.setCredentials({
      refresh_token: channel.refreshToken,
    });
    const youtube = google.youtube({ version: "v3", auth: oauth2Client });

    const response = await axios({
      url: video.result.videoUrl,
      method: "GET",
      responseType: "arraybuffer", // Get the file as binary data
    });
    const uploadUrl = await ctx.runMutation(internal.storage.generateUploadUrl);

    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": "video/mp4" },
      body: response.data,
    });
    const { storageId } = (await uploadResponse.json()) as {
      storageId: Id<"_storage">;
    };
    const file = await ctx.storage.get(storageId);
    if (!file) throw new Error("Error when save file");
    const fileStream = file.stream();
    const nodeReableStream = new Readable({
      async read(size) {
        const reader = fileStream.getReader();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              this.push(null);
              break;
            }
            this.push(Buffer.from(value));
          }
        } catch (error) {
          this.destroy(error as Error);
        }
      },
    });
    try {
      const response = await youtube.videos.insert({
        part: ["snippet", "status"],
        requestBody: {
          snippet: {
            title: name,
            description: description,
            categoryId: "22", // '22' là People & Blogs
          },
          status: {
            privacyStatus: "private",
          },
        },
        media: {
          body: nodeReableStream,
        },
      });
    } catch (error) {
    } finally {
      ctx.storage.delete(storageId);
    }
  },
});
