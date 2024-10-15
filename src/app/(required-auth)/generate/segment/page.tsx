"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMutation } from "convex/react";
import { Monitor, Smartphone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "~/convex/_generated/api";

const Page = () => {
  const mutate = useMutation(api.stories.createStory);
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();
  const [videoFormat, setVideoFormat] = useState<"16:9" | "9:16">("16:9");
  return (
    <div className="flex flex-col items-center justify-center py-32">
      <h1
        className={cn(
          "font-nosifer mb-4 text-center text-4xl font-[700] text-purple-300",
        )}
      >
        Create Your Story
      </h1>
      <p className={cn("font-special mb-8 text-center text-lg text-gray-300")}>
        Choose your video orientation
      </p>
      <div className="font-special mx-auto gap-8 md:grid md:grid-cols-2">
        <Button
          onClick={() => {
            setVideoFormat("9:16");
          }}
          className={cn(
            videoFormat === "9:16"
              ? "border-2 border-white bg-primary"
              : "opacity-70",
            "flex h-52 w-80 flex-col items-center rounded-none bg-primary p-6 transition-colors hover:bg-primary-foreground",
          )}
        >
          <div className="mb-4 text-5xl">
            <Smartphone className="h-10 w-10" />{" "}
          </div>
          <p className="text-center font-semibold">Vertical</p>
        </Button>
        <Button
          onClick={() => {
            setVideoFormat("16:9");
          }}
          className={cn(
            videoFormat === "16:9"
              ? "border-2 border-white bg-primary"
              : "opacity-70",
            "flex h-52 w-80 flex-col items-center rounded-none bg-primary p-6 transition-colors hover:bg-primary-foreground",
          )}
        >
          <div className="mb-4 text-5xl">
            <Monitor className="h-10 w-10" />{" "}
          </div>
          <p className="text-center font-semibold">Horizontal</p>
        </Button>
        <Button
          onClick={async () => {
            const storyId = await mutate({
              createType: "by-segments",
              format: videoFormat,
              name: "Untitled",
              story: "",
              prompt: "",
            });
            router.push(`/stories/${storyId}`);
          }}
          className={cn(
            "col-span-2 w-full bg-white text-lg text-black hover:bg-gray-100",
          )}
        >
          Start writing
        </Button>
      </div>
    </div>
  );
};

export default page;
