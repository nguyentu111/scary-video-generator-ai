"use client";

import { useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { AuthLoader } from "@/components/shared/auth-loader";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export default function Home() {
  const videos = useQuery(api.videos.get);
  return (
    <AuthLoader authLoading={<AuthLoadingSkeleton />}>
      <div>
        <h1>Video của tôi</h1>
        <div className="grid grid-cols-4 gap-2 py-12">
          {videos?.map(({ _id, name }) => (
            <div className="cursor-pointer rounded-lg border-2 p-4" key={_id}>
              {name}
            </div>
          ))}
        </div>
      </div>
    </AuthLoader>
  );
}
function AuthLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((a, i) => (
        <div className="h-[400px]" key={i}>
          <Skeleton className="h-full rounded-lg" />
        </div>
      ))}
    </div>
  );
}