"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useMutation } from "convex/react";
import { CheckIcon, Monitor, Smartphone, XCircle } from "lucide-react";
import { useState } from "react";
import { useDebounceCallback } from "usehooks-ts";
import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";

export function StoryTitle({
  defaultName,
  storyId,
  format,
}: {
  defaultName: string;
  storyId: Id<"stories">;
  format: "16:9" | "9:16";
}) {
  const [name, setName] = useState(defaultName);
  const [isEditingName, setIsEdittingName] = useState(false);
  const mutateEdit = useMutation(api.stories.edit);
  const handleEditName = useDebounceCallback(async (name: string) => {
    await mutateEdit({ name, id: storyId });
  }, 500);

  const handleSave = async () => {
    await handleEditName(name);
    setIsEdittingName(false);
  };

  const handleCancel = () => {
    setName(defaultName);
    setIsEdittingName(false);
  };

  return (
    <>
      {!isEditingName ? (
        <h1
          className={"min-w-6 p-4 font-special text-[40px]"}
          onClick={() => setIsEdittingName(true)}
        >
          {name} {"  "}
          {format === "16:9" ? (
            <span className="inline-flex items-center rounded-full border bg-blue-700/50 px-2 py-1 text-xs font-semibold text-purple-200 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
              <Monitor className="mr-2 h-4 w-4" />
              Horizontal
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full border bg-purple-700/50 px-2 py-1 text-xs font-semibold text-purple-200 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
              <Smartphone className="mr-2 h-4 w-4" />
              Vertical
            </span>
          )}
        </h1>
      ) : (
        <div className="flex items-center gap-4">
          <Input
            className="my-4 w-fit min-w-6 py-8 text-[40px]"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
          />
          <Button onClick={handleSave}>
            <CheckIcon className="h-4 w-4" />
          </Button>
          <Button onClick={handleCancel}>
            <XCircle className="h-4 w-4" />
          </Button>
        </div>
      )}
    </>
  );
}
