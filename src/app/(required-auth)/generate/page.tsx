"use client";
import { cn } from "@/lib/utils";
import { AlignJustifyIcon, PenIcon, SparklesIcon } from "lucide-react";
import Link from "next/link";

const CreateYourStory = () => {
  return (
    <div className="py-32">
      <h1
        className={cn(
          "mb-4 text-center font-nosifer text-4xl font-[700] text-purple-300",
        )}
      >
        Create Your Story
      </h1>
      <p className={cn("mb-8 text-center font-special text-lg text-gray-300")}>
        Transform your ideas into captivating visual narratives
      </p>

      <div
        className={cn(
          "mx-auto flex flex-col items-center justify-center gap-8 font-special text-white md:flex-row",
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
        <Link
          href="/generate/guided"
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
