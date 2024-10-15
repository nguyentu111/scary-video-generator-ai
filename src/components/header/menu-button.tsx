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
            href="/generate"
            className="flex cursor-pointer items-center gap-2"
          >
            <VideoIcon className="h-4 w-4" /> Generate
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="/stories"
            className="flex cursor-pointer items-center gap-2"
          >
            <BookOpenText className="h-4 w-4" /> Stories
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="/videos"
            className="flex cursor-pointer items-center gap-2"
          >
            <FilmIcon className="h-4 w-4" /> My videos
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
