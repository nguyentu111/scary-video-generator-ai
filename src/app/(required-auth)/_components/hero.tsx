"use client";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
gsap.registerPlugin(ScrollTrigger);
export const Hero = ({ children }: { children: React.ReactNode }) => {
  const container = useRef(null);
  const image = useRef<HTMLImageElement | null>(null); // Ensure the ref type is correct
  useLayoutEffect(() => {
    const context = gsap.context(() => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          start: "top bottom",
          end: "bottom top",
          scrub: true,
          trigger: container.current,
        },
      });
      timeline.to(image.current, { y: -400 }, 0);
    }); // Pass the container as the context
    return () => context.revert();
  }, []); // Add an empty dependency array
  return (
    <div
      ref={container}
      className="relative flex flex-col items-center py-10 md:py-24"
    >
      <Image
        src="/header-bg.jpg"
        alt="hero"
        fill
        className="h-full w-full object-cover opacity-50" // Fixed typo from "w-ful" to "w-full"
      />
      {children}
    </div>
  );
};
