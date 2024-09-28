import { z } from "zod";

import { env } from "@/env";
import { authProcedure, createTRPCRouter } from "@/server/api/trpc";
import axios from "axios";
const API_URL = "https://api.openai.com/v1/chat/completions";
export const chatgptRouter = createTRPCRouter({
  splitContentToSegments: authProcedure
    .input(z.object({ text: z.string() }))
    .mutation(async ({ input }) => {
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
      const response = await axios.post(
        API_URL,
        {
          model: "gpt-3.5-turbo",
          messages: [systemPromt, { role: "user", content: input.text }],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.OPENAI_API_KEY}`,
          },
        },
      );

      const reply = response.data.choices[0].message.content as string;
      const regex = /(\[.*\])/s; // Matches the JSON array
      const match = reply.match(regex);
      let jsonArray: string = "";
      if (match) {
        jsonArray = match[1] as string; // The first captured group contains the array
        console.log(JSON.parse(jsonArray));
      } else {
        console.log("No match found");
      }
      return JSON.parse(jsonArray) as Array<{ segment: string; image: string }>;
    }),
});
