"use client";
import { cn } from "@/lib/utils";
import { amatic, nosifer, special } from "@/styles/fonts";
import { useMutation } from "convex/react";
import {
  AlignJustifyIcon,
  PaperclipIcon,
  PenIcon,
  Sparkle,
  SparkleIcon,
  SparklesIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "~/convex/_generated/api";

const CreateYourStory = () => {
  const mutate = useMutation(api.stories.createStory);
  const router = useRouter();
  return (
    <div className="py-32">
      <h1
        className={cn(
          nosifer.className,
          "mb-4 text-center font-amatic text-4xl font-[700] text-purple-300",
        )}
      >
        Create Your Story
      </h1>
      <p
        className={cn(
          "mb-8 text-center text-lg text-gray-300",
          special.className,
        )}
      >
        Transform your ideas into captivating visual narratives
      </p>

      <div
        className={cn(
          "mx-auto flex flex-col items-center justify-center gap-8 text-white md:flex-row",
          special.className,
        )}
      >
        <Link
          href="/generate/script"
          className="flex h-52 w-52 flex-col items-center justify-center rounded-lg bg-primary p-6 transition-colors hover:bg-primary-foreground"
        >
          <div className="mb-4 text-5xl">
            <PenIcon className="h-14 w-14" />
          </div>
          <p className="text-center font-semibold">I have a script ready</p>
        </Link>
        <Link
          href="/generate/segment"
          className="flex h-52 w-52 flex-col items-center justify-center rounded-lg bg-primary p-6 transition-colors hover:bg-primary-foreground"
        >
          <div className="mb-4 text-5xl">
            <AlignJustifyIcon className="h-14 w-14" />
          </div>
          <p className="text-center font-semibold">
            I want to create my story segment by segment
          </p>
        </Link>
        {/* <div
          onClick={async () => {
            const storyId = await mutate({
              name: "Untitled",
              story: "",
              createType: "by-segments",
              format: "16:9",
            });
            router.push("/stories/" + storyId);
          }}
          className="flex h-52 w-52 cursor-pointer flex-col items-center rounded-lg bg-primary p-6 transition-colors hover:bg-primary-foreground"
        >
          <div className="mb-4 text-5xl">📄</div>
          <p className="text-center font-semibold">
            I want to create my story segment by segment
          </p>
        </div> */}

        <Link
          href="/generate/guide"
          className="flex h-52 w-52 flex-col items-center justify-center rounded-lg bg-primary p-6 transition-colors hover:bg-primary-foreground"
        >
          <div className="mb-4 text-5xl">
            <SparklesIcon className="h-14 w-14" />
          </div>
          <p className="text-center font-semibold">
            Guide me through story creation
          </p>
        </Link>
      </div>
    </div>
  );
};

export default CreateYourStory;
