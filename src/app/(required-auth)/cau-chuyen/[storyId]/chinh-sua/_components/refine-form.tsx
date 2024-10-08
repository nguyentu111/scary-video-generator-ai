import { useModal } from "@/components/providers/modal-provider";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useMutation } from "convex/react";
import { Button } from "@/components/ui/button";
import { Loader2Icon } from "lucide-react";
import { cn } from "@/lib/utils";
const refineStorySchema = z.object({
  prompt: z.string().min(10, "Ít nhất 10 kí tự"),
});
export const RefineContentForm = ({ storyId }: { storyId: Id<"stories"> }) => {
  const { setClose } = useModal();
  const form = useForm({
    resolver: zodResolver(refineStorySchema),
    defaultValues: { prompt: "" },
  });
  const mutateUpdate = useMutation(api.stories.editAiStory);
  const onSubmit = async (data: z.infer<typeof refineStorySchema>) => {
    await mutateUpdate({ prompt: data.prompt, id: storyId });
    setClose();
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn("space-y-4")}>
        <FormField
          control={form.control}
          name="prompt"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  className="rounded-none border-2 border-purple-100 bg-gray-800 font-sans text-purple-100 focus-visible:ring-0"
                  required
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="float-right flex gap-4">
          <Button
            onClick={setClose}
            type="button"
            className="w-fit rounded-none bg-primary text-xl font-bold"
            disabled={form.formState.isSubmitting}
          >
            <span>Hủy</span>
          </Button>

          <Button
            type="submit"
            className="w-fit rounded-none bg-purple-700 text-xl font-bold text-white hover:bg-purple-800"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : (
              <span>Chỉnh sửa</span>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
