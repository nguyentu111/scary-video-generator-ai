"use client";
import { useWindowSize } from "usehooks-ts";

export default function YoutubeFrame({}: {}) {
  const { width, height } = useWindowSize();

  return (
    <iframe
      width={width > 1000 ? 1000 : width}
      height={width > 1000 ? 500 : width * 0.5}
      src="https://www.youtube.com/embed/5f2nvcm06sY?si=rFG8RbhI37uzt-xr"
      title="YouTube video player"
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerPolicy="strict-origin-when-cross-origin"
      allowFullScreen
    ></iframe>
  );
}
