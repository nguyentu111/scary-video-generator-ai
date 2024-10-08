"use client";
import { Button } from "@/components/ui/button";
import { PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { amatic } from "@/styles/fonts";
import { Popover } from "@radix-ui/react-popover";
import { useMutation, useQuery } from "convex/react";
import { EllipsisVertical, TrashIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "~/convex/_generated/api";
import type { Doc, Id } from "~/convex/_generated/dataModel";

export default function Page({
  params: { storyId },
}: {
  params: { storyId: Id<"stories"> };
}) {
  const stories = useQuery(api.stories.getStories);

  return (
    <div className="h-full">
      {stories?.length === 0 && (
        <div className="flex h-full flex-col items-center justify-center gap-4">
          <div className={cn(amatic.className, "text-[40px] font-bold")}>
            Bạn chưa có câu chuyện nào
          </div>
          <Button className={cn(amatic.className, "text-[24px]")} asChild>
            <Link href="/tao-video" className="!font-bold">
              Tạo ngay
            </Link>
          </Button>
        </div>
      )}
      <div className="grid grid-cols-1 gap-8 py-12 md:grid-cols-2">
        {stories?.map((s) => <StoryItem key={s._id} story={s} />)}
      </div>
    </div>
  );
}
function StoryItem({ story }: { story: Doc<"stories"> }) {
  const router = useRouter();
  const mutateDelete = useMutation(api.stories.deleteStory);
  const handleDelete = async (id: Id<"stories">) => {
    await mutateDelete({ id });
  };
  return (
    <div key={story._id} className="rounded-xl border border-purple-500">
      <div className="flex justify-between border-b border-purple-500 px-4 py-2">
        <span className="font-bold"> {story.name}</span>
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
              Xóa
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="p-4">
        <div className="line-clamp-4 overflow-hidden text-sm">
          {story.content}
        </div>
      </div>
      <div className="p-4">
        <Button
          className="bg-purple-500"
          onClick={() => router.push(`/cau-chuyen/${story._id}`)}
        >
          Tạo video
        </Button>
      </div>
    </div>
  );
}
