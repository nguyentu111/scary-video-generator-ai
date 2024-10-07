"use client";
import { cn } from "@/lib/utils";
import { amatic } from "@/styles/fonts";
import { useMutation } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { api } from "~/convex/_generated/api";

const CreateYourStory = () => {
  const mutate = useMutation(api.stories.createStory);
  const router = useRouter();
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <h1
        className={cn(amatic.className, "mb-4 font-amatic text-5xl font-[700]")}
      >
        Tạo câu chuyện của bạn
      </h1>
      <p className="mb-8 text-lg text-gray-300">
        {/* Transform your ideas into captivating visual narratives */}
      </p>

      <div className="flex space-x-6 text-white">
        <Link
          href="/tao-video/script-da-co"
          className="flex h-52 w-52 flex-col items-center rounded-lg bg-purple-700 p-6 transition-colors hover:bg-purple-800"
        >
          <div className="mb-4 text-5xl">✏️</div>
          <p className="text-center font-semibold">Tôi đã có kịch bản</p>
        </Link>

        <div
          onClick={async () => {
            const storyId = await mutate({
              name: "Untitled",
              story: "",
              createType: "by-segments",
            });
            router.push("/cau-chuyen/" + storyId);
          }}
          className="flex h-52 w-52 cursor-pointer flex-col items-center rounded-lg bg-purple-700 p-6 transition-colors hover:bg-purple-800"
        >
          <div className="mb-4 text-5xl">📄</div>
          <p className="text-center font-semibold">
            Tôi muốn tạo kịch bản theo từng đoạn
          </p>
        </div>

        <Link
          href="/tao-video/ai-tao-script"
          className="flex h-52 w-52 flex-col items-center rounded-lg bg-purple-700 p-6 transition-colors hover:bg-purple-800"
        >
          <div className="mb-4 text-5xl">✨</div>
          <p className="text-center font-semibold">Để AI tạo kịch bản</p>
        </Link>
      </div>
    </div>
  );
};

export default CreateYourStory;
