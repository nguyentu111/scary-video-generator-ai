import { useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";

export const VideoDetails = ({ videoId }: { videoId: Id<"stories"> }) => {
  const segments = useQuery(api.segments.getByStoryId, { storyId: videoId });
  return (
    <div>
      <div className="flex flex-col gap-2">
        {segments?.map((s) => (
          <div className="p-2">
            <div>text: {s.text}</div>
            <div>imgPromt: {s.imagePromt}</div>
            <div>imgId: {s.imageId}</div>
          </div>
        ))}
        {segments?.length === 0 && "Segments đang được tạo"}
      </div>
    </div>
  );
};
