"use node";
import axios from "axios";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { internalAction } from "./_generated/server";
const API_URL = "https://api.openai.com/v1/chat/completions";
export const splitToSegment = internalAction({
  args: { story: v.string(), storyId: v.id("stories") },
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.logs.create, {
      message: "running split to segment",
      function: "splitToSegment",
    });

    const systemPromt = {
      role: "system",
      content: `You are an story teller ai assisant. Split the story user give you into small segmnents,
             each segment will fit with an image that descibe the context of that segment .Return 
            the answer as a JSON array contain objects of segment and image, image value is a prompt describe the context of that segment 
            , example response: 
            [{
              segment : 'I was 8 years old when I last saw my mother. 
                We lived in a somewhat big house out in the countryside. A decent drive from the nearest towns and cities.',
              image : 'A countryside house standing isolated, surrounded by dark, overgrown fields under a twilight sky. The air feels heavy with mystery, the house appears large yet eerily quiet.'
          },...].Each images wont have the context of previous segments and images, so made it easy to understand like a completely separate prompt.
             Please return full story segments, don't lose anything.`,
    };
    try {
      const response = await axios.post(
        API_URL,
        {
          model: "gpt-3.5-turbo",
          messages: [systemPromt, { role: "user", content: args.story }],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
        },
      );

      const reply = response.data.choices[0].message.content as string;
      const regex = /(\[.*\])/s; // Matches the JSON array
      const match = reply.match(regex);
      let jsonArray: string = "";
      if (match) {
        jsonArray = match[1] as string; // The first captured group contains the array
        await ctx.runMutation(internal.logs.create, {
          message: JSON.stringify(jsonArray),
          function: "splitToSegment",
        });
      } else {
        await ctx.runMutation(internal.logs.create, {
          message: "not has array in response " + JSON.stringify(jsonArray),
          function: "splitToSegment",
          additionals: "storyId:" + args.storyId,
        });
      }
      const segmentsArray = JSON.parse(jsonArray) as Array<{
        segment: string;
        image: string;
      }>;
      await ctx.runMutation(internal.segments.saveSegments, {
        segments: segmentsArray,
        storyId: args.storyId,
      });
      const segments = await ctx.runQuery(api.segments.getByStoryId, {
        storyId: args.storyId,
      });
      await ctx.runMutation(internal.logs.create, {
        message: "calling sendSqsMessage..",
        function: "splitToSegment",
      });
      await Promise.all(
        segments.map((s) =>
          ctx.runAction(internal.sqs.sendSqsMessage, {
            message: s.imagePromt ?? "",
            attributes: {
              segmentId: {
                DataType: "String",
                StringValue: s._id.toString(),
              },
            },
          }),
        ),
      );
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
