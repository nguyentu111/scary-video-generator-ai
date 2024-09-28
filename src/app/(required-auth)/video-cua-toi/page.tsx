"use client";

import { useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";

export default function Home() {
  const segments = useQuery(api.segments.get);
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {segments?.map(({ _id, text }) => <div key={_id}>{text}</div>)}
    </main>
  );
}
