"use client";
import { AuthLoader } from "@/components/shared/auth-loader";
import { Button } from "@/components/ui/button"; // Import Shadcn UI components
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { cn, splitStory } from "@/lib/utils";
import { nosifer, special } from "@/styles/fonts";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { Loader2Icon, Monitor, SmartphoneIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "~/convex/_generated/api";
import { useToast } from "@/components/hooks/use-toast";
const schema = z.object({
  name: z.string().min(1),
  story: z.string().min(1, "The story should be at least 200 characters long."),
});

const Page = () => {
  const [videoFormat, setvideoFormat] = useState<"16:9" | "9:16">("16:9");

  const router = useRouter();
  const mutate = useMutation(api.stories.createStory);
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      story: "",
    },
  });
  const { toast } = useToast();
  const segmentCount = splitStory(form.watch("story")).length;
  const textTokens = Math.ceil(form.watch("story").length / 1000);
  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      const id = await mutate({
        ...data,
        createType: "full-scripted",
        format: videoFormat,
      });
      router.push("/stories/" + id);
    } catch (error) {
      toast({
        title: "Uh oh!",
        description: (error as ConvexError<string>).data,
        variant: "destructive",
      });
    }
  };
  return (
    <AuthLoader authLoading={<UnauthenticatedSkeleton />}>
      <div className="container flex min-h-screen flex-col items-center justify-center py-12">
        <h1
          className={cn(
            nosifer.className,
            "mb-4 text-center font-amatic text-4xl font-[700] text-purple-300",
          )}
        >
          Create Your Story
        </h1>
        <p
          className={cn(
            "mb-8 text-center text-lg text-gray-300",
            special.className,
          )}
        >
          Transform your ideas into captivating visual narratives
        </p>

        <div
          className={cn(
            "w-full max-w-[800px] rounded-lg border-2 border-purple-500 bg-gray-100 p-8 dark:bg-gray-800",
            special.className,
          )}
        >
          <Form {...form}>
            {/** @ts-ignore */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-purple-400">Title</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        required
                        className="bg-gray-900"
                        placeholder="Enter your story title"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="story"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-purple-400">
                      Your Script
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        className="min-h-[400px] bg-gray-900 font-sans"
                        {...field}
                        placeholder="Write your script here."
                      ></Textarea>
                    </FormControl>
                    <span className="block text-xs">
                      {10000 - form.watch("story").length} characters remaining
                    </span>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <Label className="text-purple-400">Video Format</Label>
                <p className="text-sm text-gray-400">
                  Choose between vertical (TikTok/YouTube Shorts) or horizontal
                  (standard 1080p) format.
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={() => setvideoFormat("9:16")}
                    className={cn(
                      "flex w-full items-center justify-center gap-2",
                      videoFormat === "9:16" ? "bg-primary" : "!bg-gray-600",
                    )}
                  >
                    <SmartphoneIcon className="h-4 w-4" /> Vertical
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setvideoFormat("16:9")}
                    className={cn(
                      "flex w-full items-center justify-center gap-2",
                      videoFormat === "16:9" ? "bg-primary" : "!bg-gray-600",
                    )}
                  >
                    <Monitor className="h-4 w-4" /> Horizontal
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-purple-400">
                  Estimated Credit Usage:
                </Label>
                <table className="w-full">
                  <tbody>
                    <tr className="w-full border-b border-gray-700 transition-all duration-500 hover:bg-gray-900">
                      <td className="px-2 py-2 text-purple-400">Item</td>
                      <td className="px-2 py-2 text-right text-purple-400">
                        Credits
                      </td>
                    </tr>
                    <tr className="w-full border-b border-gray-700 transition-all duration-500 hover:bg-gray-900">
                      <td className="px-2 py-2">Image Generation</td>
                      <td className="px-2 py-2 text-right">
                        {segmentCount * 10}
                      </td>
                    </tr>
                    <tr className="w-full border-b border-gray-700 transition-all duration-500 hover:bg-gray-900">
                      <td className="px-2 py-2">Text Tokens</td>
                      <td className="px-2 py-2 text-right"> {textTokens}</td>
                    </tr>
                    <tr className="w-full border-b border-gray-700 transition-all duration-500 hover:bg-gray-900">
                      <td className="px-2 py-2">Total</td>
                      <td className="px-2 py-2 text-right">
                        {segmentCount * 10 + textTokens}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <Button
                className="w-full"
                type="submit"
                disabled={
                  form.formState.isSubmitting || form.formState.isLoading
                }
              >
                {form.formState.isSubmitting || form.formState.isLoading ? (
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                ) : (
                  <span>
                    Generate images and review ({segmentCount * 10 + textTokens}{" "}
                    credits)
                  </span>
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </AuthLoader>
  );
};

export default Page;
function UnauthenticatedSkeleton() {
  return (
    <div className="">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="mt-8 h-[400px] w-full" />
    </div>
  );
}
