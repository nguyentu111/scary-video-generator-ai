import { cn } from "@/lib/utils";
import { LucideProps, SkullIcon } from "lucide-react";

export const Loader = ({ className, ...props }: LucideProps) => {
  return (
    <SkullIcon {...props} className={cn("h-4 w-4 animate-spin", className)} />
  );
};
