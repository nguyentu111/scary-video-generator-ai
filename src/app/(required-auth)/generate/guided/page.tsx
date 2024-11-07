"use client";
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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "~/convex/_generated/api";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z
    .string()
    .min(50, "Description at least 50 characters.")
    .max(10000, "Desciption limit is 10000 characters"),
});

const GuidedStoryCreation = () => {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
    },
  });
  const mutateCreate = useMutation(api.stories.createStory);

  const onSubmit = async (data: z.infer<typeof schema>) => {
    const storyId = await mutateCreate({
      createType: "by-ai",
      name: data.title,
      prompt: data.description,
      story: "",
    });
    router.push(`/stories/${storyId}/refine`);
  };

  return (
    <div className="container flex flex-col items-center justify-center py-12 pb-8 dark:bg-black dark:text-white">
      <h1
        className={cn("mb-4 font-nosifer text-4xl font-bold text-purple-300")}
      >
        Guided Story Creation
      </h1>
      <p className={cn("mb-8 font-special text-lg text-gray-300")}>
        Let AI guide you through creating your story
      </p>

      <div
        className={cn(
          "w-full max-w-[800px] rounded-lg border-2 border-purple-500 bg-gray-100 p-8 font-special dark:bg-gray-800",
        )}
      >
        <Form {...form}>
          {/** @ts-ignore */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter your story title"
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="tex">Story Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe your story idea, including themes, characters, and key plot points..."
                      className="min-h-[200px]"
                      required
                    />
                  </FormControl>
                  <span className="block text-xs">
                    {10000 - form.watch("description").length} characters
                    remaining
                  </span>

                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-purple-700 text-white hover:bg-purple-800"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <Loader2Icon className="h-4 w-4 animate-spin" />
              ) : (
                <span>Generate guide Story (1 credit)</span>
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default GuidedStoryCreation;
