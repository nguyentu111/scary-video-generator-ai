"use client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { calculateVideoCredits } from "@/lib/calculate-credits";
import { useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { VideoIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";

export function CreateVideoButton({
  name,
  storyId,
  segments,
  storyText,
}: {
  storyId: Id<"stories">;
  name: string;
  segments: { text: string }[];
  storyText: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const mutateCreate = useMutation(api.videos.create);
  const user = useQuery(api.users.viewer);

  const credits = calculateVideoCredits(storyText, segments.length);

  const handleCreate = async () => {
    try {
      if (!user?.credits || user.credits < credits.totalCredits) {
        toast({
          title: "Not enough credits",
          description: `You need ${credits.totalCredits} credits to create this video. You currently have ${user?.credits || 0} credits.`,
          variant: "destructive",
        });
        return;
      }

      await mutateCreate({ storyId, name });
      router.push("/videos");
    } catch (error) {
      toast({
        title: "Uh oh.",
        description:
          error instanceof ConvexError
            ? (error as ConvexError<string>).data
            : "Something went wrong, try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button className="bg-purple-500" onClick={handleCreate}>
      <VideoIcon className="mr-2 h-4 w-4" />
      Generate video ({credits.totalCredits} credits)
    </Button>
  );
}
