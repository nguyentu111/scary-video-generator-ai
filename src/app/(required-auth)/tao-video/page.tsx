"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button"; // Import Shadcn UI components
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAssertAuth, useAuth } from "@/components/providers/auth-provider";
import { useMutation } from "convex/react";
import { api } from "~/convex/_generated/api";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().min(1),
  story: z.string().min(200, "Câu chuyện ít nhất 200 kí tự"),
});

const page = () => {
  const { user } = useAssertAuth();
  console.log({ user });
  const mutate = useMutation(api.stories.createStory);
  const form = useForm({
    resolver: zodResolver(schema),
  });
  const onSubmit = async (data: z.infer<typeof schema>) => {
    console.log(data);
    const id = await mutate({ ...data, userId: user!.id });
    toast(id);
  };

  return (
    <div>
      <Form {...form}>
        {/** @ts-ignore */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên video</FormLabel>
                <FormControl>
                  <Input {...field} required />
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
                <FormLabel>Câu chuyện</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Nhập câu chuyện kinh dị của bạn"
                  ></Textarea>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </div>
  );
};

export default page;
