"use node";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { internalAction } from "./_generated/server";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const chatGptResSplitToSegmentSchema = z.object({
  segments: z.array(
    z.object({
      segment: z.string(),
      image: z.string(),
    }),
  ),
});
const chatGptResStoryGenerateSchema = z.object({
  story: z.string(),
});
export const splitToSegment = internalAction({
  args: { story: v.string(), storyId: v.id("stories") },
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.logs.create, {
      message: "running split to segment",
      function: "splitToSegment",
    });

    const systemPromt: ChatCompletionMessageParam = {
      role: "system",
      content: `You are an AI that creates horror videos based on the story provided by the user. Your task is to analyze the story, divide it into smaller segments, and create image prompts for each segment to assist an API in generating realistic images.
        Requirements:
        Analyze the story: Read the story input by the user and split it into smaller segments, each with a length of 4 to 8 sentences.
        Create image prompts: Based on the content of each segment, generate a detailed image description (image prompt). This description should reflect the context, emotions, and atmosphere of that segment while being aligned with the horror theme.
        Format: For each segment, use the following format:
        Segment: [Content of the segment, keep the language of the user input's].
        Image prompt: [Detailed description for the image, including elements such as color, lighting, setting, emotions, and key objects in the scene.
        If there is people in the story, make sure to decribe to keep people's gender , age and appearance consistent over segment's image prompts.
        Ensure that the image prompts can be easily translated into real images, focusing on creating the creepy and tense atmosphere of the story.
        Keep image prompt in english.]
        Carefully ensure that no part of the story is omitted.
        Return the response as a Json array.       
        
        `,
    };
    try {
      const completion = await openai.beta.chat.completions.parse({
        model: "gpt-4o-2024-08-06",
        messages: [
          systemPromt,
          {
            role: "user",
            content: args.story,
          },
        ],
        response_format: zodResponseFormat(
          chatGptResSplitToSegmentSchema,
          "segments",
        ),
      });
      const segmentArray = completion.choices[0]?.message.parsed?.segments;
      await ctx.runMutation(internal.logs.create, {
        message: JSON.stringify(segmentArray),
        function: "splitToSegment",
      });
      if (segmentArray) {
        const segmentIds = await ctx.runMutation(
          internal.storySegments.saveSegments,
          {
            segments: segmentArray,
            storyId: args.storyId,
          },
        );
        //TODO :generate image for each segment prompt
        await Promise.all(
          segmentArray.map((s, i) =>
            ctx.scheduler.runAfter(0, internal.replicate.generateImage, {
              prompt: s.image,
              segmentId: segmentIds[i]!,
              storyId: args.storyId,
            }),
          ),
        );
        // await ctx.scheduler.runAfter(30, internal.storySegments.timeout, { submissionId });
        // await Promise.all(
        //   segmentArray.map((segment, i) =>
        //     ctx.scheduler.runAfter(
        //       0,
        //       internal.sqs.sendSqsMessageGenerateImage,
        //       {
        //         message: segment.image ?? "",
        //         attributes: {
        //           segmentId: {
        //             DataType: "String",
        //             StringValue: segmentIds[i]!,
        //           },
        //           folder: {
        //             DataType: "String",
        //             StringValue: `images/story_` + s.storyId,
        //           },
        //         },
        //       },
        //     ),
        //   ),
        // );
      } else {
        await ctx.runMutation(internal.logs.create, {
          message: "Fail to get segments array from chatgpt",
          function: "splitToSegment.error",
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        await ctx.runMutation(internal.logs.create, {
          message: error.message,
          function: "splitToSegment.error",
        });
      } else {
        await ctx.runMutation(internal.logs.create, {
          message: "Unkown error occur :<<",
          function: "splitToSegment.error",
        });
      }
    }
  },
});
export const generateStory = internalAction({
  args: { prompt: v.string(), name: v.string(), storyId: v.id("stories") },
  handler: async (ctx, args) => {
    try {
      const systemPromt: ChatCompletionMessageParam = {
        role: "system",
        content: `You are an AI that creates horror stories based on the prompt provided by the user. Your task is to generate an horror story from user prompt. 
      Give user an horror story about 6000 character in length unless user specify the length.`,
      };
      const completion = await openai.beta.chat.completions.parse({
        model: "gpt-4o-2024-08-06",
        messages: [
          systemPromt,
          {
            role: "user",
            content: args.prompt,
          },
        ],
        response_format: zodResponseFormat(
          chatGptResStoryGenerateSchema,
          "story",
        ),
      });
      const story = completion.choices[0]?.message.parsed?.story;
      await ctx.runMutation(internal.stories.internalEdit, {
        content: story,
        id: args.storyId,
        AIGenerateInfo: {
          prompt: args.prompt,
          status: { state: "saved" },
          finishedRefine: false,
        },
      });
      return story;
    } catch (error) {
      await ctx.runMutation(internal.stories.internalEdit, {
        id: args.storyId,
        AIGenerateInfo: {
          prompt: args.prompt,
          finishedRefine: false,
          status: {
            state: "failed",
            //@ts-ignore
            reason: error?.message ?? "Unknown error",
          },
        },
      });
    }
  },
});

export const refineStory = internalAction({
  args: { prompt: v.string(), storyId: v.id("stories") },
  handler: async (ctx, args) => {
    try {
      const systemPromt: ChatCompletionMessageParam = {
        role: "system",
        content: `You are an horror teller AI's. Your task is  suport user  fix the story follow the user instuction's. `,
      };
      const completion = await openai.beta.chat.completions.parse({
        model: "gpt-4o-2024-08-06",
        messages: [
          systemPromt,
          {
            role: "user",
            content: args.prompt,
          },
        ],
        response_format: zodResponseFormat(
          chatGptResStoryGenerateSchema,
          "story",
        ),
      });
      const story = completion.choices[0]?.message.parsed?.story;
      await ctx.runMutation(internal.stories.internalEdit, {
        content: story,
        id: args.storyId,
        AIGenerateInfo: {
          prompt: args.prompt,
          status: { state: "saved" },
          finishedRefine: false,
        },
      });
      return story;
    } catch (error) {
      await ctx.runMutation(internal.stories.internalEdit, {
        id: args.storyId,
        AIGenerateInfo: {
          prompt: args.prompt,
          finishedRefine: false,
          status: {
            state: "failed",
            //@ts-ignore
            reason: error?.message ?? "Unknown error",
          },
        },
      });
    }
  },
});
