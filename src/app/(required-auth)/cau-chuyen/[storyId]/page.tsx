"use client";
import { useModal } from "@/components/providers/modal-provider";
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
import { PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { amatic } from "@/styles/fonts";
import { Popover } from "@radix-ui/react-popover";
import { useAction, useMutation, useQuery } from "convex/react";
import {
  DownloadIcon,
  EllipsisVertical,
  ImageIcon,
  Loader,
  LoaderIcon,
  TrashIcon,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useDebounceCallback } from "usehooks-ts";
import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";
export default function Page({
  params: { storyId },
}: {
  params: { storyId: Id<"stories"> };
}) {
  const segments = useQuery(api.segments.getByStoryId, { storyId });
  const story = useQuery(api.stories.get, { id: storyId });
  return (
    <div className="h-full py-12">
      {segments?.length === 0 && (
        <div className="flex h-full items-center justify-center">
          <div className={cn(amatic.className, "text-[40px] font-bold")}>
            Đang phân tích, chờ chút
          </div>
        </div>
      )}
      {segments?.length && segments.length > 0 && (
        <>
          <h1 className="w-full text-center text-[40px]">{story?.name}</h1>
          <div className="grid grid-cols-2 gap-8 py-12">
            {segments?.map((s, i) => (
              <SegmentItem segment={s} index={i} key={s._id} />
            ))}
            <CreateVideoButton storyId={storyId} />
          </div>
        </>
      )}
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
    imageUrl?: string;
    storyId: Id<"stories">;
    text: string;
    imagePromt: string;
    imageStatus: string;
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
      imageUrl: segment.imageUrl,
    });
  }, 1000);
  const handleDownload = (imageUrl: string, fileName: string) => {
    const link = document.createElement("a");
    link.target = "blank";
    link.href = imageUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
              {segment.imageUrl && (
                <div
                  onClick={() =>
                    handleDownload(segment.imageUrl!, `doan_${index + 1}.png}`)
                  }
                  className="flex cursor-pointer items-center gap-2 rounded-t-lg border-b border-purple-500 bg-gray-900 px-4 py-2 text-sm hover:bg-black"
                >
                  <DownloadIcon className="h-4 w-4" />
                  Tải ảnh
                </div>
              )}
              <div
                onClick={() =>
                  setOpen(
                    <CustomModal title="Sửa ảnh" subheading="">
                      <ImagePromtChangeForm
                        prompt={segment.imagePromt}
                        segmentId={segment._id}
                      />
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
        {segment.imageStatus === "success" ? (
          <Image
            src={segment.imageUrl!}
            height={300}
            width={533}
            className="h-full w-full"
            alt={segment.imagePromt}
          />
        ) : segment.imageStatus === "creating" ? (
          <div className="flex h-full w-full items-center justify-center gap-2">
            <span>Ảnh đang tạo </span>
            <LoaderIcon className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span>Ảnh lỗi </span>
          </div>
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

const ImagePromtChangeForm = ({
  prompt,
  segmentId,
}: {
  prompt: string;
  segmentId: Id<"segments">;
}) => {
  const { setClose } = useModal();
  const action = useAction(api.images.regenerateImage);
  const form = useForm({
    defaultValues: { prompt },
  });
  const onSubmit = async (data: { prompt: string }) => {
    try {
      await action({
        segmentId,
        prompt: data.prompt,
      });
      toast.success("Đang tạo lại ảnh...");
    } catch (error) {
      if (error instanceof Error) {
        console.log(error);
        if (
          !error.message.includes(
            "Uncaught Error: Field name $metadata starts with a '$', which is reserved.",
          )
        )
          toast.error(error.message);
      }
    }
    setClose();
  };
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

        <Button
          type="submit"
          disabled={form.formState.isLoading || form.formState.isSubmitting}
        >
          {form.formState.isLoading || form.formState.isSubmitting ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : (
            "Tạo lại ảnh"
          )}
        </Button>
      </form>
    </Form>
  );
};
function CreateVideoButton({ storyId }: { storyId: Id<"stories"> }) {
  const mutate = useMutation(api.videos.create);
  const router = useRouter();
  const handleCreate = async () => {
    const videoId = await mutate({ storyId });
    router.push("/video-cua-toi");
  };
  return (
    <Button className="col-span-2 w-full bg-purple-500" onClick={handleCreate}>
      Tạo video
    </Button>
  );
}
