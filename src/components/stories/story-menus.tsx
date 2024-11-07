"use client";
import { useModal } from "@/components/providers/modal-provider";
import CustomModal from "@/components/shared/custom-modal";
import { Button } from "@/components/ui/button";
import { BookOpenIcon, CopyIcon } from "lucide-react";
import { Doc, Id } from "~/convex/_generated/dataModel";
import { useToast } from "../ui/use-toast";
import { CreateVideoButton } from "./create-video-button";

export function StoryMenus({
  storyId,
  name,
  segments,
}: {
  storyId: Id<"stories">;
  name: string;
  segments: Doc<"storySegments">[];
}) {
  const { setOpen } = useModal();
  const { toast } = useToast();

  const storyText = segments.reduce(
    (acc, segment) => acc + segment.text + " ",
    "",
  );

  return (
    <div
      className={
        "flex flex-col items-center justify-center gap-4 rounded-2xl border border-gray-600 bg-gray-900 p-8 font-special md:flex-row"
      }
    >
      <Button
        onClick={() => {
          setOpen(
            <CustomModal
              title={name}
              subheading=""
              contentClass="w-[95vw] max-w-[1000px]"
            >
              <div className="">
                <div className="max-h-[55vh] overflow-auto">
                  {segments.map((s) => (
                    <p key={s._id}>{s.text}</p>
                  ))}
                </div>
                <div className="mt-4">
                  <Button
                    onClick={async () => {
                      await navigator.clipboard.writeText(
                        segments.reduce(
                          (curr, acc) => (curr += acc.text + "\n"),
                          "",
                        ),
                      );
                      toast({
                        title: "Copied to clipboard.",
                        description:
                          "The full story has been copied to your clipboard.",
                      });
                    }}
                  >
                    <CopyIcon className="mr-2 h-4 w-4" />
                    Copy to clipboard
                  </Button>
                </div>
              </div>
            </CustomModal>,
          );
        }}
      >
        <BookOpenIcon className="mr-2 h-4 w-4" />
        Read full story
      </Button>
      <CreateVideoButton
        name={name}
        storyId={storyId}
        segments={segments}
        storyText={storyText}
      />
    </div>
  );
}
