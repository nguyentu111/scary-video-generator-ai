"use client";
import { useModal } from "@/components/providers/modal-provider";
import CustomModal from "@/components/shared/custom-modal";
import { Loader } from "@/components/shared/loader";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { cn, splitStory } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import {
  Loader2Icon,
  Monitor,
  SmartphoneIcon,
  WandSparkles,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { z } from "zod";
import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";
import { RefineContentForm } from "./_components/refine-form";
import { useForm } from "react-hook-form";

const schema = z.object({
  content: z
    .string()
    .min(1000, "Câu chuyện ít nhất 1000 kí tự")
    .max(10000, "Câu chuyện không vượt quá 10000 kí tự"),
});

const FixStory = ({
  params,
}: {
  params: { storyId: Id<"stories">; name: string };
}) => {
  const story = useQuery(api.stories.get, {
    id: params.storyId,
  });
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      content: story?.content ?? "",
    },
  });

  const { setOpen } = useModal();
  const segmentCount = splitStory(form.watch("content")).length;

  useEffect(() => {
    if (story?.content) form.setValue("content", story.content);
  }, [story?.content]);
  if (!story)
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader className="h-20 w-20" />
      </div>
    );
  return (
    <div className="flex flex-col items-center justify-center py-12 text-white">
      <h1
        className={cn(
          "w-full text-center font-nosifer text-[40px] font-bold text-purple-300",
        )}
      >
        Refine story
      </h1>

      <div className="mt-8 w-full max-w-[1000px] rounded-lg border-2 border-purple-500 bg-gray-800 p-8">
        <h2
          className={cn(
            "mb-4 w-full text-center font-amatic text-4xl font-bold text-purple-500",
          )}
        >
          {story?.name}
        </h2>
        <div className="relative">
          <Form {...form}>
            {/** @ts-ignore */}
            <form onSubmit={form.handleSubmit()} className="space-y-4">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        {...field}
                        className="min-h-[300px] rounded-none bg-gray-800 text-purple-100"
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <span className="my-2 block text-sm text-purple-100">
                {form.watch("content").length} / 10000 characters
              </span>
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <Button
                  onClick={() =>
                    setOpen(
                      <CustomModal
                        title="Refine story"
                        subheading="Enter your refinement instructions. This will cost 1 credit."
                      >
                        <RefineContentForm storyId={story._id} />
                      </CustomModal>,
                    )
                  }
                  type="button"
                  className="w-full rounded-none bg-purple-700 font-special text-white hover:bg-purple-800"
                  disabled={form.formState.isSubmitting}
                >
                  <WandSparkles className="mr-4 h-4 w-4" /> Refine with AI
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setOpen(
                      <VideoFormatPopup
                        credits={segmentCount * 10}
                        content={form.watch("content")}
                      />,
                    );
                  }}
                  className="w-full rounded-none bg-purple-700 font-special text-white hover:bg-purple-800"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <Loader2Icon className="h-4 w-4 animate-spin" />
                  ) : (
                    <span>Generate segment and images</span>
                  )}
                </Button>
              </div>
            </form>
          </Form>
          {story?.AIGenerateInfo &&
            story.AIGenerateInfo.status.state === "pending" && (
              <div className="absolute inset-0 z-10 bg-black/30">
                <div className="flex h-full w-full flex-col items-center justify-center">
                  <Loader className="h-10 w-10" />
                  <p className="text-purple-100">Please wait...</p>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};
export default FixStory;

const VideoFormatPopup = ({
  credits,
  content,
}: {
  credits: number;
  content: string;
}) => {
  const params = useParams();
  const [videoFormat, setVideoFormat] = useState<"16:9" | "9:16">("9:16");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setClose } = useModal();
  const router = useRouter();
  const mutateGenerate = useMutation(api.stories.onDoneRefine);
  const handleGenerate = async () => {
    setIsSubmitting(true);
    await mutateGenerate({
      id: params.storyId as Id<"stories">,
      format: videoFormat,
      content,
    });
    setIsSubmitting(false);
    setClose();
    router.push("/stories/" + params.storyId);
  };
  return (
    <CustomModal
      title="Choose Video Orientation"
      subheading="Choose between vertical (TikTok/YouTube Shorts) or horizontal (standard 1080p) format."
    >
      <div className="font-special text-sm text-purple-100">
        <p>
          Vertical videos are ideal for platforms like TikTok and Instagram
          Reels.
        </p>
        <p className="mt-1">
          Horizontal videos are better suited for YouTube and traditional video
          players.
          <p className="mt-2 font-bold">
            Note: Once set, the orientation cannot be changed without
            regenerating all images, so choose carefully!
          </p>
        </p>
        <div className="mt-4 flex gap-2">
          <Button
            type="button"
            onClick={() => setVideoFormat("9:16")}
            className={cn(
              "flex w-full items-center justify-center gap-2 font-special",
              videoFormat === "9:16" ? "bg-primary" : "!bg-gray-600",
            )}
          >
            <SmartphoneIcon className="h-4 w-4" /> Vertical
          </Button>
          <Button
            type="button"
            onClick={() => setVideoFormat("16:9")}
            className={cn(
              "flex w-full items-center justify-center gap-2 font-special",
              videoFormat === "16:9" ? "bg-primary" : "!bg-gray-600",
            )}
          >
            <Monitor className="h-4 w-4" /> Horizontal
          </Button>
        </div>
        <div className="mt-8 flex justify-end gap-2">
          <Button
            type="button"
            onClick={() => setClose()}
            variant="outline"
            className="font-special"
          >
            Cancle
          </Button>
          <Button
            type="button"
            onClick={handleGenerate}
            className="font-special"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : (
              <>Generate ({credits} credits)</>
            )}
          </Button>
        </div>
      </div>
    </CustomModal>
  );
};
