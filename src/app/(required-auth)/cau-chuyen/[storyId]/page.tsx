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
import { Input } from "@/components/ui/input";
import { PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { amatic } from "@/styles/fonts";
import { Popover } from "@radix-ui/react-popover";
import { useAction, useMutation, useQuery } from "convex/react";
import {
  CheckIcon,
  DownloadIcon,
  EllipsisVertical,
  ImageIcon,
  Loader,
  LoaderIcon,
  PlusIcon,
  TrashIcon,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useDebounceCallback } from "usehooks-ts";
import { api } from "~/convex/_generated/api";
import { Doc, Id } from "~/convex/_generated/dataModel";
export default function Page({
  params: { storyId },
}: {
  params: { storyId: Id<"stories"> };
}) {
  const segments = useQuery(api.storySegments.getByStoryId, { storyId });
  const story = useQuery(api.stories.get, { id: storyId });

  return (
    <div className="h-full py-12">
      {story && segments?.length !== undefined && (
        <>
          <StoryTitle defaultName={story?.name} storyId={story?._id} />
          <div className="justify-between gap-8 md:grid md:grid-cols-2">
            {segments?.map((s, i) => (
              <SegmentItem segment={s} index={i + 1} key={s._id} />
            ))}
            {story.AIGenerateInfo &&
            story.AIGenerateInfo.finishedRefine === false ? (
              <Link href={`/cau-chuyen/${story._id}/chinh-sua`}>
                Tiếp tục chỉnh sửa
              </Link>
            ) : (
              <CreateVideoButton storyId={storyId} name={story.name} />
            )}
          </div>
        </>
      )}
      {segments?.length === 0 && story?.createType === "full-scripted" && (
        <div className="flex h-full items-center justify-center">
          <div className={cn(amatic.className, "text-[40px] font-bold")}>
            Đang phân tích, chờ chút
          </div>
        </div>
      )}
    </div>
  );
}
function StoryTitle({
  defaultName,
  storyId,
}: {
  defaultName: string;
  storyId: Id<"stories">;
}) {
  const [name, setName] = useState(defaultName);
  const [isEditingName, setIsEdittingName] = useState(false);
  const mutateEdit = useMutation(api.stories.edit);
  const handleEditName = useDebounceCallback(async (name: string) => {
    await mutateEdit({ name, id: storyId });
  }, 500);

  const handleSave = async () => {
    await handleEditName(name);
    setIsEdittingName(false);
  };

  const handleCancel = () => {
    setName(defaultName);
    setIsEdittingName(false);
  };

  return (
    <>
      {!isEditingName ? (
        <h1
          className="min-w-6 p-4 text-[40px]"
          onClick={() => setIsEdittingName(true)}
        >
          {name}
        </h1>
      ) : (
        <div className="flex items-center gap-4">
          <Input
            className="my-4 w-fit min-w-6 py-8 text-[40px]"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
          />
          <Button onClick={handleSave}>
            <CheckIcon className="h-4 w-4" /> {/* Add Check Icon */}
          </Button>
          <Button onClick={handleCancel}>
            <XCircle className="h-4 w-4" /> {/* Add Cancel Icon */}
          </Button>
        </div>
      )}
    </>
  );
}
function SegmentItem({
  segment,
  index,
}: {
  segment: Doc<"storySegments">;
  index: number;
}) {
  const mutateSaveText = useMutation(api.storySegments.edit);
  const ref = useRef<HTMLDivElement | null>(null);
  const { setOpen } = useModal();
  const handleSaveText = useDebounceCallback(async () => {
    await mutateSaveText({
      id: segment._id,
      text: ref.current?.textContent ?? "",
      imagePrompt: segment.imagePrompt,
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
  const mutateAddSegment = useMutation(api.storySegments.insert);
  const handleAddSegment = async () => {
    await mutateAddSegment({
      imagePrompt: "",
      storyId: segment.storyId,
      text: "",
      order: segment.order + 1,
    });
  };
  const [isDeletingSegment, setIsDeletingSegment] = useState(false);
  const mutateDeleteSegment = useMutation(api.storySegments.deleteSegment);
  return (
    <div
      key={segment._id}
      className="relative rounded-xl border border-purple-500"
    >
      <div
        onClick={() => handleAddSegment()}
        className="absolute right-0 top-1/2 translate-x-1/2 cursor-pointer rounded-full border-2 border-purple-500 bg-white p-1 dark:bg-black"
      >
        <PlusIcon className="h-4 w-4" />
      </div>
      <div className="flex justify-between border-b border-purple-500 px-4 py-2">
        <span>Đoạn {index}</span>
        <Popover>
          <PopoverTrigger>
            <EllipsisVertical />
          </PopoverTrigger>
          <PopoverContent
            className="w-fit rounded-lg border border-purple-500 !p-0"
            align="end"
          >
            <div className="">
              {segment.imageStatus.status === "saved" ? (
                <div
                  onClick={() =>
                    handleDownload(
                      //@ts-ignore
                      segment.imageStatus.imageUrl,
                      `doan_${index + 1}.png}`,
                    )
                  }
                  className="flex cursor-pointer items-center gap-2 rounded-t-lg border-b border-purple-500 px-4 py-2 text-sm dark:bg-gray-900 dark:hover:bg-black"
                >
                  <DownloadIcon className="h-4 w-4" />
                  Tải ảnh
                </div>
              ) : null}
              <div
                onClick={() =>
                  setOpen(
                    <CustomModal title="Sửa ảnh" subheading="">
                      <ImagePromtChangeForm
                        prompt={segment.imagePrompt}
                        segmentId={segment._id}
                      />
                    </CustomModal>,
                  )
                }
                className="flex cursor-pointer items-center gap-2 border-b border-purple-500 px-4 py-2 text-sm dark:bg-gray-900 dark:hover:bg-black"
              >
                <ImageIcon className="h-4 w-4" />
                Sửa prompt hình ảnh
              </div>
              <div
                onClick={async () => {
                  if (!isDeletingSegment) {
                    setIsDeletingSegment(true);
                    await mutateDeleteSegment({ id: segment._id });
                  }
                }}
                className="flex cursor-pointer items-center gap-2 rounded-b-lg border-b border-purple-500 px-4 py-2 text-sm text-rose-500 dark:bg-gray-900"
              >
                <TrashIcon className="h-4 w-4" />
                {isDeletingSegment ? "Đang xóa..." : "Xóa đoạn này"}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="aspect-video">
        {segment.imageStatus.status === "saved" ? (
          <Image
            src={segment.imageStatus.imageUrl}
            height={300}
            width={533}
            className="h-full w-full"
            alt={segment.imagePrompt}
          />
        ) : segment.imageStatus.status === "pending" && segment.imagePrompt ? (
          <div className="flex h-full w-full items-center justify-center gap-2">
            <span>Ảnh đang tạo </span>
            <LoaderIcon className="h-5 w-5 animate-spin" />
          </div>
        ) : !segment.imagePrompt ? (
          <div className="flex h-full w-full items-center justify-center">
            <span>Hãy tạo prompt cho ảnh</span>
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span>Ảnh lỗi </span>
          </div>
        )}
      </div>
      <div
        className={cn(
          "min-h-[100px] w-full border-t border-t-purple-500 px-4 py-2 text-sm",
        )}
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
  segmentId: Id<"storySegments">;
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
function CreateVideoButton({
  storyId,
  name,
}: {
  storyId: Id<"stories">;
  name: string;
}) {
  const mutate = useMutation(api.videos.create);
  const router = useRouter();
  const handleCreate = async () => {
    router.push("/video-cua-toi");
  };
  return (
    <Button className="col-span-2 w-full bg-purple-500" onClick={handleCreate}>
      Tạo video
    </Button>
  );
}
