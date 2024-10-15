"use client";
import { useToast } from "@/components/hooks/use-toast";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { amatic, special } from "@/styles/fonts";
import { Popover } from "@radix-ui/react-popover";
import { useAction, useMutation, useQuery } from "convex/react";
import {
  BookIcon,
  BookOpenIcon,
  CheckIcon,
  CopyIcon,
  DownloadIcon,
  EllipsisVertical,
  ImageIcon,
  Loader,
  LoaderIcon,
  PlusCircleIcon,
  PlusIcon,
  TrashIcon,
  VideoIcon,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect, useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useDebounceCallback } from "usehooks-ts";
import { api } from "~/convex/_generated/api";
import type { Doc, Id } from "~/convex/_generated/dataModel";
export default function Page({
  params: { storyId },
}: {
  params: { storyId: Id<"stories"> };
}) {
  const segments = useQuery(api.storySegments.getByStoryId, { storyId });
  const story = useQuery(api.stories.get, { id: storyId });
  const doneRefine = useMemo(
    () =>
      story?.AIGenerateInfo ? story?.AIGenerateInfo?.finishedRefine : true,
    [story?.AIGenerateInfo?.finishedRefine],
  );
  const { setOpen } = useModal();
  if (story === null) return notFound();
  return (
    <div className="container h-full py-12">
      {story && segments?.length !== undefined && (
        <>
          <div className="flex flex-col items-center justify-between md:flex-row">
            <StoryTitle defaultName={story?.name} storyId={story?._id} />
            <Button
              className={cn(special.className)}
              onClick={() =>
                setOpen(
                  <CustomModal
                    title="Edit story context"
                    subheading="Modify the overall context of your story"
                  >
                    <EditStoryContextForm
                      context={
                        story.context
                          ? (story.context as { data?: string }).data
                          : ""
                      }
                    />
                  </CustomModal>,
                )
              }
            >
              Edit story context
            </Button>
          </div>
          <div className="justify-between gap-8 md:grid md:grid-cols-2">
            {segments?.map((s, i) => (
              <SegmentItem
                segment={s}
                index={i + 1}
                key={s._id}
                canDelete={segments.length !== 1}
              />
            ))}
            {!doneRefine ? (
              <Link
                href={`/stories/${story._id}/refine`}
                className="block text-center md:col-span-2"
              >
                <div className="flex h-full items-center justify-center">
                  <div className={cn("font-amatic text-[40px] font-bold")}>
                    Continue Refine
                  </div>
                </div>
              </Link>
            ) : (
              segments?.length >= 1 && (
                <div className="col-span-2">
                  <StoryMenus
                    storyId={storyId}
                    name={story.name}
                    segments={segments}
                  />
                </div>
              )
            )}
          </div>
        </>
      )}
      {segments === undefined ||
        (segments.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <div className={cn("font-amatic text-[40px] font-bold")}>
              Loading segments ...
            </div>
          </div>
        ))}
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
          className={cn(special.className, "min-w-6 p-4 text-[40px]")}
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
  canDelete,
}: {
  segment: Doc<"storySegments">;
  index: number;
  canDelete: boolean;
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
      className="relative flex flex-col rounded-xl border border-purple-500"
    >
      <div
        onClick={() => handleAddSegment()}
        className="absolute -right-0 top-1/2 z-50 -translate-y-1/2 translate-x-1/2 transform"
      >
        <Button className="h-8 w-8 rounded-full bg-purple-600/50 !p-0">
          <PlusCircleIcon className="h-6" />
        </Button>
      </div>
      <div className="flex justify-between rounded-t-xl border-b border-purple-500 bg-gray-800 px-4 py-2">
        <span>Segment {index}</span>
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
                      `Segment_${index + 1}.png}`,
                    )
                  }
                  className="flex cursor-pointer items-center gap-2 rounded-t-lg border-b border-purple-500 px-4 py-2 text-sm dark:bg-gray-900 dark:hover:bg-black"
                >
                  <DownloadIcon className="h-4 w-4" />
                  Download image
                </div>
              ) : null}
              <div
                onClick={() =>
                  setOpen(
                    <CustomModal
                      title="Change prompt"
                      subheading="Modify the prompt used for generating your segment image."
                    >
                      <ImagePromtChangeForm
                        prompt={segment.imagePrompt}
                        segmentId={segment._id}
                        submitText="Regenerate"
                      />
                    </CustomModal>,
                  )
                }
                className="flex cursor-pointer items-center gap-2 border-b border-purple-500 px-4 py-2 text-sm dark:bg-gray-900 dark:hover:bg-black"
              >
                <ImageIcon className="h-4 w-4" />
                Change image prompt
              </div>
              <Button
                disabled={!canDelete}
                onClick={async () => {
                  if (!isDeletingSegment) {
                    setIsDeletingSegment(true);
                    await mutateDeleteSegment({ id: segment._id });
                  }
                }}
                className="flex cursor-pointer items-center gap-2 rounded-b-lg border-b border-purple-500 px-4 py-2 text-sm text-rose-500 dark:bg-gray-900"
              >
                <TrashIcon className="h-4 w-4" />
                {isDeletingSegment ? "Deleting..." : "Delete this segment"}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="aspect-video bg-gray-900">
        {segment.imageStatus.status === "saved" ? (
          <Image
            src={segment.imageStatus.imageUrl}
            height={300}
            width={533}
            className="h-full w-full object-contain"
            alt={segment.imagePrompt}
          />
        ) : segment.imageStatus.status === "pending" && segment.imagePrompt ? (
          <div className="flex h-full w-full items-center justify-center gap-2">
            <span>Generating image </span>
            <LoaderIcon className="h-5 w-5 animate-spin" />
          </div>
        ) : !segment.imagePrompt ? (
          <div
            className={cn(
              special.className,
              "flex h-full w-full items-center justify-center gap-4",
            )}
          >
            <Button disabled={segment.text.length < 10}>Auto generate</Button>
            <Button
              onClick={() =>
                setOpen(
                  <CustomModal
                    title="Generate with your prompt"
                    subheading="Modify the prompt used for generating your segment image."
                  >
                    <ImagePromtChangeForm
                      prompt={segment.imagePrompt}
                      segmentId={segment._id}
                      submitText="Generate"
                    />
                  </CustomModal>,
                )
              }
            >
              Generate with prompt
            </Button>
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span>Error generating image </span>
          </div>
        )}
      </div>
      <div
        className={cn(
          "min-h-[100px] w-full flex-1 rounded-b-xl border-t border-t-purple-500 bg-gray-900 px-4 py-2 text-sm",
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
  submitText,
}: {
  prompt: string;
  segmentId: Id<"storySegments">;
  submitText: string;
}) => {
  const { setClose } = useModal();
  const mutateRegenerate = useMutation(api.images.regenerateImage);
  const form = useForm({
    defaultValues: { prompt },
  });
  const onSubmit = async (data: { prompt: string }) => {
    try {
      await mutateRegenerate({
        segmentId,
        prompt: data.prompt,
      });
      toast.success("Generating image...");
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
              <FormLabel>Prompt</FormLabel>
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
          className={cn(special.className)}
        >
          {form.formState.isLoading || form.formState.isSubmitting ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : (
            submitText
          )}
        </Button>
      </form>
    </Form>
  );
};
function CreateVideoButton({
  name,
  storyId,
}: {
  storyId: Id<"stories">;
  name: string;
}) {
  const router = useRouter();
  const mutateCreate = useMutation(api.videos.create);
  const handleCreate = async () => {
    await mutateCreate({ storyId, name });
    router.push("/videos");
  };
  return (
    <Button className="bg-purple-500" onClick={handleCreate}>
      <VideoIcon className="mr-2 h-4 w-4" />
      Generate video
    </Button>
  );
}
function EditStoryContextForm({ context }: { context: string | undefined }) {
  const form = useForm({
    defaultValues: {
      context: context ?? "",
    },
  });
  return (
    <Form {...form}>
      <form>
        <FormField
          name="context"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Context</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Your story time of day, location, etc.  This will be included while generating the images.  Character descriptions, etc.  Too much detail and your images will be too similar."
                  className="h-full min-h-[250px] w-full"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className={cn("mt-4 w-full", special.className)}>
          Update Context
        </Button>
      </form>
    </Form>
  );
}
function StoryMenus({
  name,
  storyId,
  segments,
}: {
  name: string;
  segments: Doc<"storySegments">[];
  storyId: Id<"stories">;
}) {
  const { setClose, setOpen } = useModal();
  const { toast } = useToast();
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-4 rounded-2xl border border-gray-600 bg-gray-900 p-8",
        special.className,
      )}
    >
      <Button
        onClick={() => {
          setOpen(
            <CustomModal
              title={name}
              subheading=""
              contentClass="w-[95vw] max-w-[1000px] "
            >
              <div className="">
                <div className="max-h-[55vh] overflow-auto">
                  {segments.map((s) => (
                    <p key={s._id}>{s.text}</p>
                  ))}
                </div>
                <div className="mt-4">
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        segments.reduce(
                          (curr, acc) => (curr += acc.text + "\n"),
                          "",
                        ),
                      );
                      toast({
                        title: "Copied to clipboard.",
                        description:
                          "The full story has been copied to your clipboard.",
                        variant: "default",
                      });
                    }}
                  >
                    <CopyIcon className="mr-2 h-4 w-4" />
                    Copy to clipboard
                  </Button>
                </div>
              </div>
            </CustomModal>,
          );
        }}
      >
        <BookOpenIcon className="mr-2 h-4 w-4" />
        Read full story
      </Button>
      <CreateVideoButton name={name} storyId={storyId} />
    </div>
  );
}
