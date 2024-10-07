"use node";
import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { MessageAttributeValue } from "@aws-sdk/client-sqs";
const client = new SQSClient({
  region: process.env.AWS_REGION as string,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});
const AWS_QUEUE_GENERATE_IMAGE = process.env.AWS_QUEUE_GENERATE_IMAGE as string;
const AWS_QUEUE_GENERATE_VOICE = process.env.AWS_QUEUE_GENERATE_VOICE as string;
const AWS_QUEUE_GENERATE_SEGMENT_VIDEO = process.env
  .AWS_QUEUE_GENERATE_SEGMENT_VIDEO as string;
const AWS_QUEUE_GENERATE_FINAL_VIDEO = process.env
  .AWS_QUEUE_GENERATE_FINAL_VIDEO as string;
const a: MessageAttributeValue = { DataType: "String", StringValue: "asd" };
export const sendSqsMessageGenerateImage = internalAction({
  args: {
    attributes: v.object({
      segmentId: v.object({
        DataType: v.literal("String"),
        StringValue: v.string(),
      }),
      folder: v.object({
        DataType: v.literal("String"),
        StringValue: v.string(),
      }),
    }),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      await ctx.runMutation(internal.logs.create, {
        message: "sending to sqs generate image",
        function: "sendSqsMessageGenerateImage",
      });

      const command = new SendMessageCommand({
        QueueUrl: AWS_QUEUE_GENERATE_IMAGE,
        DelaySeconds: 0,
        MessageAttributes: {
          ...args.attributes,
          nodeEnv: {
            DataType: "String",
            StringValue: process.env.NODE_ENV,
          },
        },
        MessageBody: "Realistic picture, " + args.message,
      });

      const response = await client.send(command);
      return response;
    } catch (error) {
      if (error instanceof Error) {
        await ctx.runMutation(internal.logs.create, {
          message: error.message,
          function: "sendSqsMessageGenerateImage.error",
        });
      } else {
        await ctx.runMutation(internal.logs.create, {
          message: "Unkown error occur :<<",
          function: "sendSqsMessageGenerateImage.error",
        });
      }
    }
  },
});
export const sendSqsMessageGenerateVoice = internalAction({
  args: {
    attributes: v.object({
      segmentId: v.object({
        DataType: v.literal("String"),
        StringValue: v.string(),
      }),
      videoId: v.object({
        DataType: v.literal("String"),
        StringValue: v.string(),
      }),
    }),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      await ctx.runMutation(internal.logs.create, {
        message: "sending to sqs generate voice",
        function: "sendSqsMessageGenerateVoice",
      });

      const command = new SendMessageCommand({
        QueueUrl: AWS_QUEUE_GENERATE_VOICE,
        DelaySeconds: 0,
        MessageAttributes: {
          ...args.attributes,
          convexNodeEnv: {
            DataType: "String",
            StringValue: process.env.NODE_ENV,
          },
        },
        MessageBody: args.message,
      });

      const response = await client.send(command);
      return response;
    } catch (error) {
      if (error instanceof Error) {
        await ctx.runMutation(internal.logs.create, {
          message: error.message,
          function: "sendSqsMessageGenerateVoice.error",
        });
      } else {
        await ctx.runMutation(internal.logs.create, {
          message: "Unkown error occur :<<",
          function: "sendSqsMessageGenerateVoice.error",
        });
      }
    }
  },
});
// export const sendSqsMessageGenerateFrames = internalAction({
//   args: {
//     attributes: v.object({
//       segmentId: v.object({
//         DataType: v.literal("String"),
//         StringValue: v.string(),
//       }),
//       folderName: v.object({
//         DataType: v.literal("String"),
//         StringValue: v.string(),
//       }),
//       numberOfFrames: v.object({
//         DataType: v.literal("Number"),
//         StringValue: v.string(),
//       }),
//       videoId: v.object({
//         DataType: v.literal("String"),
//         StringValue: v.string(),
//       }),
//     }),
//     message: v.string(),
//   },
//   handler: async (ctx, args) => {
//     try {
//       await ctx.runMutation(internal.logs.create, {
//         message: "sending to sqs generate frames",
//         function: "sendSqsMessageGenerateFrames",
//       });

//       const command = new SendMessageCommand({
//         QueueUrl: AWS_QUEUE_GENERATE_FRAMES,
//         DelaySeconds: 0,
//         MessageAttributes: args.attributes,
//         MessageBody: args.message,
//       });

//       const response = await client.send(command);
//       return response;
//     } catch (error) {
//       if (error instanceof Error) {
//         await ctx.runMutation(internal.logs.create, {
//           message: error.message,
//           function: "sendSqsMessageGenerateVoice.error",
//         });
//       } else {
//         await ctx.runMutation(internal.logs.create, {
//           message: "Unkown error occur :<<",
//           function: "sendSqsMessageGenerateVoice.error",
//         });
//       }
//     }
//   },
// });
export const sendSqsMessageGenerateSegmentVideo = internalAction({
  args: {
    message: v.object({
      voiceUrl: v.string(),
      segmentId: v.string(),
      imageUrl: v.string(),
      voiceDuration: v.number(),
      voiceSrt: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    try {
      await ctx.runMutation(internal.logs.create, {
        message: "sending to sqs generate segment video",
        function: "sendSqsMessageGenerateSegmentVideo",
      });

      const command = new SendMessageCommand({
        QueueUrl: AWS_QUEUE_GENERATE_SEGMENT_VIDEO,
        DelaySeconds: 0,
        MessageBody: JSON.stringify(args.message),
        MessageAttributes: {
          convexNodeEnv: {
            DataType: "String",
            StringValue: process.env.NODE_ENV,
          },
        },
      });

      const response = await client.send(command);
      return response;
    } catch (error) {
      if (error instanceof Error) {
        await ctx.runMutation(internal.logs.create, {
          message: error.message,
          function: "sendSqsMessageGenerateVoice.error",
        });
      } else {
        await ctx.runMutation(internal.logs.create, {
          message: "Unkown error occur :<<",
          function: "sendSqsMessageGenerateVoice.error",
        });
      }
    }
  },
});
export const sendSqsMessageGenerateFinalVideo = internalAction({
  args: {
    message: v.object({
      segmentUrls: v.array(v.string()),
      videoId: v.id("videos"),
    }),
  },
  handler: async (ctx, args) => {
    try {
      await ctx.runMutation(internal.logs.create, {
        message: "sending to sqs generate final video",
        function: "sendSqsMessageGenerateFinalVideo",
      });

      const command = new SendMessageCommand({
        QueueUrl: AWS_QUEUE_GENERATE_FINAL_VIDEO,
        DelaySeconds: 0,
        MessageBody: JSON.stringify(args.message),
        MessageAttributes: {
          convexNodeEnv: {
            DataType: "String",
            StringValue: process.env.NODE_ENV,
          },
        },
      });

      const response = await client.send(command);
      return response;
    } catch (error) {
      if (error instanceof Error) {
        await ctx.runMutation(internal.logs.create, {
          message: error.message,
          function: "sendSqsMessageGenerateFinalVideo.error",
        });
      } else {
        await ctx.runMutation(internal.logs.create, {
          message: "Unkown error occur :<<",
          function: "sendSqsMessageGenerateFinalVideo.error",
        });
      }
    }
  },
});
