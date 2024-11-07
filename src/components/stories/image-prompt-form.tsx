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
import { useMutation } from "convex/react";
import { Loader } from "lucide-react";
import { useForm } from "react-hook-form";
import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";

export const ImagePromtChangeForm = ({
  prompt,
  segmentId,
  submitText,
}: {
  prompt: string;
  segmentId: Id<"storySegments">;
  submitText: string;
}) => {
  const { setClose } = useModal();
  const { toast } = useToast();
  const mutateRegenerate = useMutation(api.images.regenerateImage);
  const form = useForm({
    defaultValues: { prompt },
  });

  const onSubmit = async (data: { prompt: string }) => {
    try {
      await mutateRegenerate({
        segmentId,
        prompt: data.prompt,
      });
      toast({
        title: "Your image is generating...",
      });
    } catch (error) {
      if (error instanceof Error) {
        console.log(error);
        if (
          !error.message.includes(
            "Uncaught Error: Field name $metadata starts with a '$', which is reserved.",
          )
        )
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
      }
    }
    setClose();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="prompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prompt</FormLabel>
              <FormControl>
                <Textarea {...field} className="min-h-[150px]" required />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={form.formState.isLoading || form.formState.isSubmitting}
          className={"font-special"}
        >
          {form.formState.isLoading || form.formState.isSubmitting ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : (
            submitText
          )}
        </Button>
      </form>
    </Form>
  );
};
