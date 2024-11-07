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
import { useQuery } from "convex/react";
import { WandSparkles } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "~/convex/_generated/api";
import { RefineContentForm } from "@/components/stories/refine/refine-form";
import { VideoFormatPopup } from "@/components/stories/refine/video-format-popup";
import { Id } from "~/convex/_generated/dataModel";

const schema = z.object({
  content: z
    .string()
    .min(1000, "Story must be at least 1000 characters")
    .max(10000, "Story cannot exceed 10000 characters"),
});

export default function RefinePage() {
  const params = useParams();
  const story = useQuery(api.stories.get, {
    id: params.storyId as Id<"stories">,
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
            <form className="space-y-4">
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
                  Generate segments and images
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
}
