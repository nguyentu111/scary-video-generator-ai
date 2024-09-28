"use node";
import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

const client = new SQSClient({
  region: process.env.AWS_REGION as string,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});
const SQS_QUEUE_URL = process.env.AWS_QUEUE_URL as string;
export const sendSqsMessage = internalAction({
  args: { attributes: v.any(), message: v.string() },
  handler: async (ctx, args) => {
    try {
      await ctx.runMutation(internal.logs.create, {
        message: "sending to sqs",
        function: "sendSqsMessage",
      });

      const command = new SendMessageCommand({
        QueueUrl: SQS_QUEUE_URL,
        DelaySeconds: 0,
        MessageAttributes: args.attributes,
        MessageBody: args.message,
      });

      const response = await client.send(command);
      return response;
    } catch (error) {
      if (error instanceof Error) {
        await ctx.runMutation(internal.logs.create, {
          message: error.message,
          function: "sendSqsMessage.error",
        });
      } else {
        await ctx.runMutation(internal.logs.create, {
          message: "Unkown error occur :<<",
          function: "sendSqsMessage.error",
        });
      }
    }
  },
});
