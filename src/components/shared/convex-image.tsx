import { env } from "@/env";
import Image, { ImageProps } from "next/image";
import { HTMLAttributes } from "react";

interface Props extends Omit<ImageProps, "src"> {
  storageId: string;
  alt: string;
}
export function ConvexImage({ storageId, alt, ...rest }: Props) {
  const getImageUrl = new URL(
    `${process.env.NEXT_PUBLIC_CONVEX_SITE_URL as string}/getImage`,
  );
  getImageUrl.searchParams.set("storageId", storageId);

  return <Image src={getImageUrl.href} alt={alt} {...rest} />;
}
