"use client";
import { useModal } from "@/components/providers/modal-provider";
import { ConvexImage } from "@/components/shared/convex-image";
import CustomModal from "@/components/shared/custom-modal";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { amatic } from "@/styles/fonts";
import { Popover } from "@radix-ui/react-popover";
import { useMutation, useQuery } from "convex/react";
import { EllipsisVertical, ImageIcon, PenIcon, TrashIcon } from "lucide-react";
import { FormEvent, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useDebounceCallback } from "usehooks-ts";
import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";
export default function Page({
  params: { storyId },
}: {
  params: { storyId: Id<"stories"> };
}) {
  const segments = useQuery(api.segments.getByStoryId, { storyId });
  return (
    <div className="h-full">
      {segments?.length === 0 && (
        <div className="flex h-full items-center justify-center">
          <div className={cn(amatic.className, "text-[40px] font-bold")}>
            Đang phân tích, chờ chút
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 gap-8 py-12">
        {segments?.map((s, i) => (
          <SegmentItem segment={s} index={i} key={s._id} />
        ))}
      </div>
    </div>
  );
}

function SegmentItem({
  segment,
  index,
}: {
  segment: {
    _id: Id<"segments">;
    _creationTime: number;
    imageId?: Id<"_storage"> | undefined;
    storyId: Id<"stories">;
    text: string;
    imagePromt: string;
  };
  index: number;
}) {
  const mutate = useMutation(api.segments.edit);
  const ref = useRef<HTMLDivElement | null>(null);
  const { setOpen } = useModal();
  const handleSaveText = useDebounceCallback(async () => {
    await mutate({
      text: ref.current?.textContent ?? "",
      id: segment._id,
      imagePromt: segment.imagePromt,
      imageId: segment.imageId,
    });
  }, 1000);
  return (
    <div key={segment._id} className="rounded-xl border border-purple-500">
      <div className="flex justify-between border-b border-purple-500 px-4 py-2">
        <span>Đoạn {index + 1}</span>
        <Popover>
          <PopoverTrigger>
            <EllipsisVertical />
          </PopoverTrigger>
          <PopoverContent
            className="w-fit rounded-lg border border-purple-500 !p-0"
            align="end"
          >
            <div className="">
              <div className="flex cursor-pointer items-center gap-2 rounded-t-lg border-b border-purple-500 bg-gray-900 px-4 py-2 text-sm hover:bg-black">
                <PenIcon className="h-4 w-4" />
                Sửa nội dung
              </div>
              <div
                onClick={() =>
                  setOpen(
                    <CustomModal title="Sửa ảnh" subheading="">
                      <ImagePromtChangeForm prompt={segment.imagePromt} />
                    </CustomModal>,
                  )
                }
                className="flex cursor-pointer items-center gap-2 border-b border-purple-500 bg-gray-900 px-4 py-2 text-sm hover:bg-black"
              >
                <ImageIcon className="h-4 w-4" />
                Sửa prompt hình ảnh
              </div>
              <div className="flex cursor-pointer items-center gap-2 rounded-b-lg border-b border-purple-500 bg-gray-900 px-4 py-2 text-sm text-rose-500 hover:bg-black">
                <TrashIcon className="h-4 w-4" />
                Xóa đoạn này
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="aspect-video">
        {segment.imageId ? (
          <ConvexImage
            height={300}
            width={533}
            className="h-full w-full"
            storageId={segment.imageId}
            alt={segment.imagePromt}
          />
        ) : (
          <div>Ảnh đang tạo</div>
        )}
      </div>
      <div
        className="w-full px-4 py-2 text-sm"
        contentEditable
        ref={ref}
        onInput={() => handleSaveText()}
      >
        {segment.text}
      </div>
    </div>
  );
}

export const ImagePromtChangeForm = ({ prompt }: { prompt: string }) => {
  const form = useForm({
    defaultValues: { prompt },
  });
  const onSubmit = () => {};
  return (
    <Form {...form}>
      {/** @ts-ignore */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="prompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prompt tạo ảnh</FormLabel>
              <FormControl>
                <Textarea {...field} className="min-h-[150px]" required />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Tạo lại ảnh</Button>
      </form>
    </Form>
  );
};
