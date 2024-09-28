import "server-only";
import { env } from "@/env";
import {
  MessageAttributeValue,
  SendMessageCommand,
  SQSClient,
} from "@aws-sdk/client-sqs";

const client = new SQSClient({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});
const SQS_QUEUE_URL = env.AWS_QUEUE_URL;
export const sendSqsMessage = async (
  message: string,
  attributes?: Record<string, MessageAttributeValue>,
) => {
  const command = new SendMessageCommand({
    QueueUrl: SQS_QUEUE_URL,
    DelaySeconds: 0,
    MessageAttributes: attributes,
    MessageBody: message,
  });

  const response = await client.send(command);
  console.log(response);
  return response;
};
