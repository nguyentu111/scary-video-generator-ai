"use node";
import { ConvexError, v } from "convex/values";
import { api, internal } from "./_generated/api";
import { internalAction } from "./_generated/server";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { splitStory } from "@/lib/utils";
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

// export const splitToSegment = internalAction({
//   args: {
//     story: v.string(),
//     storyId: v.id("stories"),
//     format: v.optional(v.union(v.literal("16:9"), v.literal("9:16"))),
//   },
//   handler: async (ctx, args) => {
//     await ctx.runMutation(internal.logs.create, {
//       message: "running split to segment",
//       function: "splitToSegment",
//     });

//     const systemPromt: ChatCompletionMessageParam = {
//       role: "system",
//       content: `You are an AI that creates horror videos based on the story provided by the user. Your task is to analyze the story, divide it into smaller segments, and create image prompts for each segment to assist an API in generating realistic images.
//         Requirements:
//         Analyze the story: Read the story input by the user and split it into smaller segments, each with a length of 4 to 8 sentences.
//         Create image prompts: Based on the content of each segment, generate a detailed image description (image prompt). This description should reflect the context, emotions, and atmosphere of that segment while being aligned with the horror theme.
//         Format: For each segment, use the following format:
//         Segment: [Content of the segment, keep the language of the user input's].
//         Image prompt: [Detailed description for the image, including elements such as color, lighting, setting, emotions, and key objects in the scene.
//         If there is people in the story, make sure to decribe to keep people's gender , age and appearance consistent over segment's image prompts.
//         Ensure that the image prompts can be easily translated into real images, focusing on creating the creepy and tense atmosphere of the story.
//         Keep image prompt in english.]
//         Carefully ensure that no part of the story is omitted.
//         Return the response as a Json array.

//         `,
//     };
//     try {
//       const completion = await openai.beta.chat.completions.parse({
//         model: "gpt-4o-2024-08-06",
//         messages: [
//           systemPromt,
//           {
//             role: "user",
//             content: args.story,
//           },
//         ],
//         response_format: zodResponseFormat(
//           chatGptResSplitToSegmentSchema,
//           "segments",
//         ),
//       });
//       const segmentArray = completion.choices[0]?.message.parsed?.segments;
//       await ctx.runMutation(internal.logs.create, {
//         message: JSON.stringify(segmentArray),
//         function: "splitToSegment",
//       });
//       if (segmentArray) {
//         const segmentIds = await ctx.runMutation(
//           internal.storySegments.saveSegments,
//           {
//             segments: segmentArray,
//             storyId: args.storyId,
//           },
//         );
//         //TODO :generate image for each segment prompt
//         await Promise.all(
//           segmentIds.map((s, i) =>
//             ctx.scheduler.runAfter(
//               0,
//               internal.replicate.generateImagesAndSave,
//               {
//                 data: [
//                   {
//                     prompt: segmentArray[i]?.image ?? "",
//                     format: args.format ?? "16:9",
//                     segmentId: s,
//                   },
//                 ],
//               },
//             ),
//           ),
//         );

//         // await ctx.scheduler.runAfter(30, internal.storySegments.timeout, { submissionId });
//       } else {
//         await ctx.runMutation(internal.logs.create, {
//           message: "Fail to get segments array from chatgpt",
//           function: "splitToSegment.error",
//         });
//       }
//     } catch (error) {
//       if (error instanceof Error) {
//         await ctx.runMutation(internal.logs.create, {
//           message: error.message,
//           function: "splitToSegment.error",
//         });
//       } else {
//         await ctx.runMutation(internal.logs.create, {
//           message: "Unkown error occur :<<",
//           function: "splitToSegment.error",
//         });
//       }
//     }
//   },
// });

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
            reason: (error as Error).message,
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
            reason: (error as Error).message,
          },
        },
      });
    }
  },
});
export const generateContext = internalAction({
  args: {
    story: v.string(),
    storyId: v.id("stories"),
  },
  handler: async (ctx, args) => {
    try {
      const systemPromt: ChatCompletionMessageParam = {
        role: "system",
        content: `You are a AI teller horror stories.Each time user give you a horror story , return a short sumary  that captures the mood, setting, 
        and key elements of the story, similar to this example : 
        Example story :
        My mother was terminally ill and spent her last few days in a hospital bed. I would work throughout the week as usual, 
        but over the weekend I would stay with her. Day and night.
        It became a routine and the nurse in charge of my mother would leave a pillow and blanket ready for me before I arrive.
        Claire was her name.
        She was the only real company I had left. I distanced myself from the outside world, the hospital and work were all I
        knew. When my mother lost her ability to speak, Claire was the only voice I heard since.
        The lights in the hospital were faulty. They flickered on and off. Some lights just gave out leaving many hallways in
        the dark.
        Example result : Set in a dimly lit hospital during the late evening, the scene is characterized by a weary, 
        somber mood as the narrator, weary yet devoted, navigates the sterile environment in simple, worn clothing, while Claire,
        the compassionate nurse, appears in her scrubs, embodying a quiet strength amidst the despair; 
        told from a reflective first-person perspective, the atmosphere is heavy with unspoken grief and solitude.
        `,
      };
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
          z.object({ result: z.string() }),
          "result",
        ),
      });
      const context = completion.choices[0]?.message.parsed?.result;
      if (!context)
        throw new ConvexError("Unknow error when generating story context.");
      return context;
    } catch (error) {
      await ctx.runMutation(internal.logs.create, {
        message: (error as Error).message,
        function: "chatpgt.generateContext.error",
      });
      await ctx.runMutation(internal.stories.internalEdit, {
        id: args.storyId,
        context: {
          state: "failed",
          reason: (error as Error).message,
        },
      });
    }
  },
});
export const generateImagePrompt = internalAction({
  args: {
    storyId: v.id("stories"),
    context: v.string(),
    story: v.string(),
    segment: v.string(),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    try {
      const systemPromt: ChatCompletionMessageParam = {
        role: "system",
        content: `Each time the user give use an horror story, a context of that story and a segment of that story, 
        generate an image prompt that capture the mood, setting, and key elements of the segment that fit best in the story and context input.
        Include a brief description of the age, appearance, and key characteristics of characters 
        introduced in the context and segment. Ensure these descriptions are consistent across all image prompts.
        Capture the atmosphere of the setting (lighting, weather, landscape details) and ensure environmental elements 
        are consistent from segment to segment, updating only as dictated by the story’s progression.
        Focus on ensuring that character actions and emotions are highlighted in the composition, with emphasis on creating 
        a sense of horror and suspense appropriate to the tone of the segment.
        Technical details should enhance the mood and tension, such as using lighting, shadows, and textures that complement
          the scene.
        Example Context: The setting is a dimly lit evening in an old, creaky house filled with a musty smell
          and an unsettling atmosphere, where David, an ordinary man in a worn shirt and slacks, feels a heavy dread 
          in the air as he confronts his sister Lily, a pale figure with wild hair and a manic gleam in her eyes; the 
          mood is tense and foreboding, capturing the despair of a brother grappling with the darkness within himself,
          all conveyed through a third-person perspective.
        Example Segment : David always considered himself an ordinary man living in an ordinary town. He had a steady job, a few close friends, and a comfortable apartment with a view of the local park. But all of that was a fragile facade, one that could shatter with the slightest touch. The catalyst for this potential disaster was his sister, Lily.
        Corresponding image prompt for segment: A shadowy confrontation between a weary man and his eccentric sister in a dimly lit, neglected old house. The framing captures their tense expressions as David, wearing a worn shirt and slacks, stands with a look of dread on his face, while Lily, a pale figure with wild hair and a manic gleam in her eyes, looms in the foreground. Flickering candlelight casts eerie shadows on the cracked walls, creating a haunting atmosphere. The color palette features deep greens and grays to evoke decay and foreboding. The mood is heavy with tension and despair, as the composition conveys the lingering darkness within their relationship and David’s internal struggle. The image focuses on the intricate details of the house's creaking wood and the unsettling air, hinting at the horrors lurking just beneath the surface.
          `,
      };
      const completion = await openai.beta.chat.completions.parse({
        model: "gpt-4o-2024-08-06",
        messages: [
          systemPromt,
          {
            role: "user",
            content: `
            Story : ${args.story},
            Context : ${args.context},
            Segment : ${args.segment},
            `,
          },
        ],
        response_format: zodResponseFormat(
          z.object({ imagePrompt: z.string() }),
          "image_prompt",
        ),
      });
      const result = completion.choices[0]?.message.parsed;
      await ctx.runMutation(internal.logs.create, {
        message: JSON.stringify(result),
        function: "generateImagePrompt.imagePrompts",
      });
      if (!result)
        throw new ConvexError("Unknow error when generating image prompts.");
      return result.imagePrompt;
    } catch (error) {
      await ctx.runMutation(internal.logs.create, {
        message: (error as Error).message,
        function: "generateImagePrompt.imagePrompts",
      });
      await ctx.runMutation(internal.stories.internalEdit, {
        id: args.storyId,
        context: {
          state: "failed",
          reason: (error as Error).message,
        },
      });
    }
  },
});
