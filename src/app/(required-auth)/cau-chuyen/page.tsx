"use client";
import { Button } from "@/components/ui/button";
import { PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { amatic } from "@/styles/fonts";
import { Popover } from "@radix-ui/react-popover";
import { useQuery } from "convex/react";
import { EllipsisVertical, PenIcon, TrashIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";

export default function Page({
  params: { storyId },
}: {
  params: { storyId: Id<"stories"> };
}) {
  const stories = useQuery(api.stories.getStories);
  const router = useRouter();
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
      <div className="grid grid-cols-2 gap-8 py-12">
        {stories?.map((s, i) => (
          <div key={s._id} className="rounded-xl border border-purple-500">
            <div className="flex justify-between border-b border-purple-500 px-4 py-2">
              <span className="font-bold"> {s.name}</span>
              <Popover>
                <PopoverTrigger>
                  <EllipsisVertical />
                </PopoverTrigger>
                <PopoverContent
                  className="w-fit rounded-lg border border-purple-500 !p-0"
                  align="end"
                >
                  <div className="">
                    <div className="flex cursor-pointer items-center gap-2 rounded-b-lg border-b border-purple-500 bg-gray-900 px-4 py-2 text-sm text-rose-500 hover:bg-black">
                      <TrashIcon className="h-4 w-4" />
                      Xóa
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className="p-4 text-sm">{s.content}</div>
            <div className="p-4">
              <Button
                className="bg-purple-500"
                onClick={() => router.push(`/cau-chuyen/${s._id}`)}
              >
                Tạo video
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
