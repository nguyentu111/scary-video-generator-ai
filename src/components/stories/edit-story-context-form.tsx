"use client";
import { useModal } from "@/components/providers/modal-provider";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { Loader2Icon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";

const contextFormSchema = z.object({
  context: z
    .string()
    .min(10, "Context must be at least 10 characters")
    .max(1000, "Context cannot exceed 1000 characters"),
});

type ContextFormValues = z.infer<typeof contextFormSchema>;

export function EditStoryContextForm({
  context,
  storyId,
}: {
  context: string | undefined;
  storyId: Id<"stories">;
}) {
  const { setClose } = useModal();
  const { toast } = useToast();
  const mutateEdit = useMutation(api.stories.editContext);

  const form = useForm<ContextFormValues>({
    resolver: zodResolver(contextFormSchema),
    defaultValues: {
      context: context ?? "",
    },
  });

  const onSubmit = async (data: ContextFormValues) => {
    try {
      await mutateEdit({
        id: storyId,
        context: data.context,
      });
      toast({
        title: "Success",
        description: "Story context updated successfully",
      });
      setClose();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          name="context"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Context</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Your story time of day, location, etc. This will be included while generating the images. Character descriptions, etc. Too much detail and your images will be too similar."
                  className="h-full min-h-[250px] w-full"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setClose()}
            disabled={form.formState.isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-purple-700 font-special text-white hover:bg-purple-800"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : (
              "Update Context"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
