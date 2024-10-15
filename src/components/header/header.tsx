"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import {
  BookOpenText,
  FilmIcon,
  Loader2Icon,
  LogOut,
  VideoIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { api } from "~/convex/_generated/api";
import { AuthLoader } from "../shared/auth-loader";
import { MenuButton } from "./menu-button";
import { cn } from "@/lib/utils";

export function Header() {
  const user = useQuery(api.users.viewer);
  const { signIn } = useAuthActions();
  return (
    <div className="select-none border-b py-2">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-xl">
            <div className="">
              <Image width={50} height={50} alt="skull-icon" src="/skull.png" />
            </div>
          </Link>

          <div className="flex items-center gap-6">
            {user && (
              <>
                <Link
                  href={"/generate"}
                  className={cn(
                    "hidden items-center gap-2 font-amatic !text-[24px] !font-bold md:flex",
                  )}
                >
                  <VideoIcon className="h-6 w-6" /> Generate
                </Link>

                <Link
                  className={cn(
                    "hidden items-center gap-2 font-amatic !text-[24px] !font-bold md:flex",
                  )}
                  href={"/stories"}
                >
                  <BookOpenText className="h-6 w-6" /> Stories
                </Link>

                <Link
                  className={cn(
                    "hidden items-center gap-2 font-amatic !text-[24px] !font-bold md:flex",
                  )}
                  href={"/videos"}
                >
                  <FilmIcon className="h-6 w-6" /> Videos
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-5">
          {/* <ModeToggle /> */}
          <AuthLoader
            authLoading={<Loader2Icon className="animate-spin" />}
            unauthenticated={
              <>
                <button
                  className="flex items-center justify-between rounded-md border border-black px-4 py-2"
                  onClick={() => signIn("google")}
                >
                  <GoogleIcon className="mr-2 h-5 w-5 stroke-white" />
                  Sign In
                </button>
              </>
            }
          >
            <HeaderActions />
          </AuthLoader>
        </div>
      </div>
    </div>
  );
}

function ProfileAvatar() {
  const user = useQuery(api.users.viewer);

  return (
    <Avatar className="select-none focus:ring-0">
      <AvatarImage src={user?.image} />
      <AvatarFallback>
        {user?.name?.substring(0, 2).toUpperCase() ?? "AA"}
      </AvatarFallback>
    </Avatar>
  );
}

function HeaderActions() {
  const user = useQuery(api.users.viewer);

  return (
    <>
      {user?.credits && (
        <div className={"font-special"}>{user.credits + " Credits"}</div>
      )}
      <ProfileDropdown />
      <div className="md:hidden">
        <MenuButton />
      </div>
    </>
  );
}
function ProfileDropdown() {
  const user = useQuery(api.users.viewer);
  const { signOut } = useAuthActions();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Suspense
          fallback={
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-800">
              ..
            </div>
          }
        >
          <ProfileAvatar />
        </Suspense>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="space-y-2">
        <DropdownMenuLabel>{user?.name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer">
          <div className="flex w-full items-center" onClick={() => signOut()}>
            <LogOut className="mr-2 h-4 w-4" />
            Đăng xuất
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Google</title>
      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
    </svg>
  );
}
