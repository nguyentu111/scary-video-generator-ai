"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { cn } from "@/lib/utils";
import { amatic } from "@/styles/fonts";
import { useMutation } from "convex/react";
import { api } from "~/convex/_generated/api";
import { useRouter } from "next/navigation";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(50, "Mô tả ít nhất 50 kí tự"),
});

const GuidedStoryCreation = () => {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(schema),
  });
  const mutateCreate = useMutation(api.stories.createStory);

  const onSubmit = async (data: z.infer<typeof schema>) => {
    // Submit the form data or handle API requests
    console.log(data);
    const storyId = await mutateCreate({
      createType: "by-ai",
      name: data.title,
      prompt: data.description,
      story: "",
    });
    router.push(`/cau-chuyen/${storyId}/chinh-sua`);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center pb-8 dark:bg-black dark:text-white">
      <h1 className={cn("mb-4 text-5xl font-bold", amatic.className)}>
        Để AI tạo kịch bản cho bạn
      </h1>
      <p className="mb-8 text-lg text-gray-300">
        {/* Let AI guide you through creating your story */}
      </p>

      <div className="w-full max-w-[1000px] rounded-lg border-2 border-purple-500 bg-gray-100 p-8 dark:bg-gray-800">
        <Form {...form}>
          {/** @ts-ignore */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên câu chuyện</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Nhập tên câu chuyện"
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
                <FormItem>
                  <FormLabel className="tex">Mô tả nội dung</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Mô tả ý tưởng của bạn, bao gồm bầu không khí, nhân vật, điểm chính của câu chuyện..."
                      className="min-h-[200px]"
                      required
                    />
                  </FormControl>
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
                <span>Tạo </span>
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default GuidedStoryCreation;
