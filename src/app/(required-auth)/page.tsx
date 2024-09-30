import { FlickerText } from "@/components/shared/flicker-text";
import { Button } from "@/components/ui/button";
import { amatic } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { LoaderIcon } from "lucide-react";
import { AuthLoader } from "@/components/shared/auth-loader";
export default async function HomePage() {
  return (
    <div>
      <FlickerText
        text="Mang Tới Bạn Nỗi Khiếp Sợ Với AI"
        className={cn(
          "my-12 mt-24 select-none text-[80px] font-bold",
          amatic.className,
        )}
      />
      <div className="flex items-center justify-center">
        <AuthLoader authLoading={<LoaderIcon className="animate-spin" />}>
          <Button className={cn(amatic.className, "text-[24px]")} asChild>
            <Link href="/tao-video" className="!font-bold">
              Tạo video
            </Link>
          </Button>
        </AuthLoader>
      </div>
    </div>
  );
}
