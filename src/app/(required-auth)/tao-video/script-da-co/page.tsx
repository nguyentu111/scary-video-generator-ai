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
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { amatic } from "@/styles/fonts";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "~/convex/_generated/api";

const schema = z.object({
  name: z.string().min(1),
  story: z.string().min(1, "Câu chuyện ít nhất 200 kí tự"),
});

const Page = () => {
  const router = useRouter();
  const mutate = useMutation(api.stories.createStory);
  const form = useForm({
    resolver: zodResolver(schema),
  });
  const onSubmit = async (data: z.infer<typeof schema>) => {
    console.log(data);
    const id = await mutate({
      ...data,
      createType: "full-scripted",
    });
    router.push("/cau-chuyen/" + id);
  };

  return (
    <AuthLoader authLoading={<UnauthenticatedSkeleton />}>
      <div className="flex min-h-screen flex-col items-center justify-center py-8">
        <h1 className={cn("mb-4 text-5xl font-bold", amatic.className)}>
          Tạo từ câu chuyện đã có
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
                disabled={
                  form.formState.isSubmitting || form.formState.isLoading
                }
              >
                {form.formState.isSubmitting || form.formState.isLoading ? (
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                ) : (
                  <span>Submit</span>
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
