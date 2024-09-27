import { FlickerText } from "@/components/shared/flicker-text";
import { Button } from "@/components/ui/button";
import { amatic } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import Link from "next/link";

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
        <Button className={cn(amatic.className, "text-[24px]")} asChild>
          <Link href="/tao-video" className="!font-bold">
            Tạo video
          </Link>
        </Button>
      </div>
    </div>
  );
}
