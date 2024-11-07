"use client";
import { Button } from "@/components/ui/button";
import { PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Popover } from "@radix-ui/react-popover";
import { useMutation, useQuery } from "convex/react";
import {
  EllipsisVertical,
  Monitor,
  Phone,
  PhoneIcon,
  PlusIcon,
  Smartphone,
  TrashIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { api } from "~/convex/_generated/api";
import type { Doc, Id } from "~/convex/_generated/dataModel";

export default function Page({
  params: { storyId },
}: {
  params: { storyId: Id<"stories"> };
}) {
  const stories = useQuery(api.stories.getStories);

  return (
    <div className="container h-full py-12">
      <h1
        className={cn(
          "w-full text-center font-nosifer text-[40px] font-bold text-purple-300",
        )}
      >
        Your Stories
      </h1>

      {stories?.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-4 py-12">
          <p className={cn("font-amatic text-[40px] font-bold")}>
            You don&apos;t have any story.
          </p>
          <Button className={cn("font-amatic text-[24px]")} asChild>
            <Link href="/generate" className="!font-bold">
              Generate
            </Link>
          </Button>
        </div>
      ) : (
        <p className={cn("py-4 text-center font-special text-lg")}>
          Here are the stories you've generated.
        </p>
      )}
      <div className="grid grid-cols-1 gap-8 py-12 md:grid-cols-3">
        {stories?.map((s) => <StoryItem key={s._id} story={s} />)}
        {stories !== undefined && stories.length > 0 && (
          <Link
            href="/generate"
            className={cn(
              "flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-xl border-2 border-purple-500 text-purple-500 hover:border-purple-300",
            )}
          >
            <div>
              <PlusIcon className="h-10 w-10" />
            </div>
            <div>Create New Story</div>
          </Link>
        )}
      </div>
      {stories === undefined && (
        <div className="flex h-full items-center justify-center">
          <div className={cn("font-amatic text-[40px] font-bold")}>
            Loading stories ...
          </div>
        </div>
      )}
    </div>
  );
}
function StoryItem({ story }: { story: Doc<"stories"> }) {
  const router = useRouter();
  const mutateDelete = useMutation(api.stories.deleteStory);
  const segments = useQuery(api.storySegments.getByStoryId, {
    storyId: story._id,
  });
  const isDoneRefine = useMemo(
    () =>
      story?.AIGenerateInfo ? story?.AIGenerateInfo?.finishedRefine : true,
    [story?.AIGenerateInfo?.finishedRefine],
  );
  const handleDelete = async (id: Id<"stories">) => {
    await mutateDelete({ id });
  };
  return (
    <div
      key={story._id}
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border-2 border-purple-500 font-special hover:border-purple-300",
      )}
    >
      <div className="flex justify-between bg-gray-800 px-4 py-2">
        <div className="mr-2 flex flex-1 items-center space-x-2">
          <h3 className="line-clamp-1 overflow-hidden text-sm font-medium tracking-tight text-purple-200">
            {story.name}
          </h3>
          {story.format === "16:9" ? (
            <div className="inline-flex items-center rounded-full border bg-blue-700/50 px-2 py-1 text-xs font-semibold text-purple-200 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
              <Monitor className="mr-2 h-4 w-4" />
              Horizontal
            </div>
          ) : (
            <div className="inline-flex items-center rounded-full border bg-purple-700/50 px-2 py-1 text-xs font-semibold text-purple-200 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
              <Smartphone className="mr-2 h-4 w-4" />
              Vertical
            </div>
          )}
        </div>

        <Popover>
          <PopoverTrigger>
            <EllipsisVertical />
          </PopoverTrigger>
          <PopoverContent
            className="w-fit rounded-lg border border-purple-500 !p-0"
            align="end"
          >
            <div
              onClick={() => handleDelete(story._id)}
              className="flex cursor-pointer items-center gap-2 rounded-lg border-b border-purple-500 px-4 py-2 text-sm text-rose-500 dark:bg-gray-900 dark:hover:bg-black"
            >
              <TrashIcon className="h-4 w-4" />
              Delete
            </div>
          </PopoverContent>
        </Popover>
      </div>
      {isDoneRefine ? (
        <div className="flex flex-1 flex-col justify-between bg-gray-900">
          <div>
            <div className="relative aspect-video w-full">
              {segments &&
                segments[0] &&
                segments[0].imageStatus.status === "saved" && (
                  <Image
                    src={segments[0].imageStatus.imageUrl}
                    className="object-contain"
                    fill
                    alt={story.name}
                  />
                )}
            </div>
            <div className="p-4">
              <div className="line-clamp-4 overflow-hidden font-sans text-sm">
                {story.content}
              </div>
            </div>
          </div>
          <div className="p-4">
            <Button className="bg-purple-500" asChild>
              <Link href={`/stories/${story._id}`}>View Story</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex h-full flex-1 items-center justify-center">
          <Link
            href={`/stories/${story._id}/refine`}
            className="m-auto block w-fit bg-gray-500 px-4 py-2 text-white"
          >
            Finish refining
          </Link>
        </div>
      )}
    </div>
  );
}
