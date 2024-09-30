"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button"; // Import Shadcn UI components
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
import { useMutation, useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { AuthLoader } from "@/components/shared/auth-loader";
import { useRouter } from "next/navigation";
import { Loader2Icon } from "lucide-react";

const schema = z.object({
  name: z.string().min(1),
  story: z.string().min(1, "Câu chuyện ít nhất 200 kí tự"),
});

const page = () => {
  const user = useQuery(api.users.viewer);
  const router = useRouter();
  console.log({ user });
  const mutate = useMutation(api.stories.createStory);
  const form = useForm({
    resolver: zodResolver(schema),
  });
  const onSubmit = async (data: z.infer<typeof schema>) => {
    console.log(data);
    const id = await mutate({ ...data, userId: user!._id });
    router.push("/cau-chuyen/" + id);
  };

  return (
    <AuthLoader authLoading={<UnauthenticatedSkeleton />}>
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
                    className="min-h-[400px]"
                    {...field}
                    placeholder="Nhập câu chuyện kinh dị của bạn"
                  ></Textarea>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={form.formState.isSubmitting || form.formState.isLoading}
          >
            {form.formState.isSubmitting || form.formState.isLoading ? (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : (
              <span>Submit</span>
            )}
          </Button>
        </form>
      </Form>
    </AuthLoader>
  );
};

export default page;
function UnauthenticatedSkeleton() {
  return (
    <div className="">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="mt-8 h-[400px] w-full" />
    </div>
  );
}
