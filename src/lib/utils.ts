import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const splitStory = (story: string) => {
  return story.replace(/\n+$/, "").replace(/\n+/g, "\n").split("\n");
};
