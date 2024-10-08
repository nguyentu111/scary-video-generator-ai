"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BookOpenText, FilmIcon, MenuIcon, VideoIcon } from "lucide-react";
import Link from "next/link";

export function MenuButton() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <MenuIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="space-y-2">
        <DropdownMenuItem asChild>
          <Link
            href="/tao-video"
            className="flex cursor-pointer items-center gap-2"
          >
            <VideoIcon className="h-4 w-4" /> Tạo video
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="/cau-chuyen"
            className="flex cursor-pointer items-center gap-2"
          >
            <BookOpenText className="h-4 w-4" /> Câu chuyện
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="/video-cua-toi"
            className="flex cursor-pointer items-center gap-2"
          >
            <FilmIcon className="h-4 w-4" /> Video của tôi
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
