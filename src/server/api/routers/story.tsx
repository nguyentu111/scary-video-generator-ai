import { z } from "zod";
import { authProcedure, createTRPCRouter } from "../trpc";
import { api } from "@/trpc/server";
import { sendSqsMessage } from "@/lib/sqs";

export const storyRouter = createTRPCRouter({
  createStory: authProcedure
    .input(
      z.object({ name: z.string(), story: z.string(), storyId: z.string() }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const segments = await api.chatgpt.splitContentToSegments({
        text: input.story,
      });
      await Promise.all(
        segments.forEach(
          async (s) =>
            await sendSqsMessage(s.image, {
              userId,
              storyId : {
                DataType : "String",
                StringValue : input.storyId.
              }
            }),
        ),
      );
    }),
});
