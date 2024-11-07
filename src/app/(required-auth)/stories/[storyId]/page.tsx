"use client";
import { useModal } from "@/components/providers/modal-provider";
import CustomModal from "@/components/shared/custom-modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { notFound } from "next/navigation";
import { useMemo } from "react";
import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";
import { EditStoryContextForm } from "@/components/stories/edit-story-context-form";
import { SegmentItem } from "@/components/stories/segment-item";
import { StoryMenus } from "@/components/stories/story-menus";
import { StoryTitle } from "@/components/stories/story-title";
import Link from "next/link";

export default function Page({
  params: { storyId },
}: {
  params: { storyId: Id<"stories"> };
}) {
  const segments = useQuery(api.storySegments.getByStoryId, { storyId });
  const story = useQuery(api.stories.get, { id: storyId });
  const format = story?.format;
  const { setOpen } = useModal();

  const doneRefine = useMemo(
    () =>
      story?.AIGenerateInfo ? story?.AIGenerateInfo?.finishedRefine : true,
    [story?.AIGenerateInfo?.finishedRefine],
  );

  if (story === null) return notFound();

  return (
    <div className="container h-full py-12">
      {story && segments?.length !== undefined && (
        <>
          <div className="flex flex-col items-center justify-between md:flex-row">
            <StoryTitle
              defaultName={story?.name}
              storyId={story?._id}
              format={format ?? "16:9"}
            />
            <Button
              className={"font-special"}
              onClick={() =>
                setOpen(
                  <CustomModal
                    title="Edit story context"
                    subheading="Modify the overall context of your story"
                  >
                    <EditStoryContextForm
                      context={
                        story.context
                          ? (story.context as { data?: string }).data
                          : ""
                      }
                      storyId={story._id}
                    />
                  </CustomModal>,
                )
              }
            >
              Edit story context
            </Button>
          </div>

          <div className="justify-between gap-8 md:grid md:grid-cols-2">
            {segments?.map((s, i) => (
              <SegmentItem
                segment={s}
                index={i + 1}
                key={s._id}
                canDelete={segments.length !== 1}
              />
            ))}

            {!doneRefine ? (
              <Link
                href={`/stories/${story._id}/refine`}
                className="block text-center md:col-span-2"
              >
                <div className="flex h-full items-center justify-center">
                  <div className={cn("font-amatic text-[40px] font-bold")}>
                    Continue Refine
                  </div>
                </div>
              </Link>
            ) : (
              segments?.length >= 1 && (
                <div className="col-span-2">
                  <StoryMenus
                    storyId={storyId}
                    name={story.name}
                    segments={segments}
                  />
                </div>
              )
            )}
          </div>
        </>
      )}

      {segments === undefined ||
        (segments.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <div className={cn("font-amatic text-[40px] font-bold")}>
              Loading segments ...
            </div>
          </div>
        ))}
    </div>
  );
}
