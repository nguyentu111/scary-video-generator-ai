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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction, useQuery } from "convex/react";
import { Loader2Icon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { api } from "~/convex/_generated/api";
import type { Doc, Id } from "~/convex/_generated/dataModel";
const uploadFormShema = z.object({
  name: z.string().min(20, "Tên ít nhất 20 kí tự"),
  channel: z.string().min(1, "Hãy chọn channel"),
  description: z.string().min(20, "Mô tả video ít nhất 20 kí tự"),
});
export const UploadToYoutubeForm = ({ video }: { video: Doc<"videos"> }) => {
  const channels = useQuery(api.channels.getUserChannels);
  const mutateUpload = useAction(api.youtube.uploadToYoutube);
  const [isPostingToYoutube, setIsPostingToYoutube] = useState(false);
  const form = useForm({
    defaultValues: {
      name: video.name,
      channel: "",
      description: "This video is generated by AI",
    },
    resolver: zodResolver(uploadFormShema),
  });
  const onSubmit = async (data: z.infer<typeof uploadFormShema>) => {
    if (!isPostingToYoutube)
      try {
        setIsPostingToYoutube(true);
        const response = await mutateUpload({
          videoId: video._id,
          channelId: data.channel as Id<"channels">,
          name: data.name,
          description: data.description,
        });
        console.log(response);
        toast.success("Video scheduled for YouTube.");
      } catch (error) {
        toast.error((error as { message: string }).message);
      } finally {
        setIsPostingToYoutube(false);
      }
  };
  return (
    <Form {...form}>
      {/** @ts-ignore */}
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 font-sans"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Video name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter video name" required />
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
              <FormLabel>Video description</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Enter video description"
                  className="min-h-[100px]"
                  required
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="channel"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="">Select channel</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Channel" />
                  </SelectTrigger>
                  <SelectContent>
                    {channels?.map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.channelTitle}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className={cn("w-full bg-purple-700 text-white hover:bg-purple-800")}
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <Loader2Icon className="h-4 w-4 animate-spin" />
          ) : (
            <span>Upload to youtube</span>
          )}
        </Button>
      </form>
    </Form>
  );
};
