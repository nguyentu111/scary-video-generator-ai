"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import React from "react";
import { jolly } from "@/styles/fonts";
import { api } from "~/convex/_generated/api";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";

type Props = {};

export const StartCraptingButton = (props: Props) => {
  const user = useQuery(api.users.viewer);
  const router = useRouter();
  const { signIn } = useAuthActions();

  return (
    <Button
      variant={"destructive"}
      className={cn(jolly.className, "text-[24px]")}
      onClick={async () => {
        if (user) router.push("/generate");
        else await signIn("google");
      }}
    >
      Start crafting your scary story
    </Button>
  );
};
