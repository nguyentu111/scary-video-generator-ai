import "@/styles/globals.css";

import { type Metadata } from "next";

import type { ReactNode } from "react";
import { amatic, jolly, nosifer, special } from "@/styles/fonts";
import { Providers } from "../components/providers/global-providers";
import NextTopLoader from "nextjs-toploader";
import { cn } from "@/lib/utils";
import { Header } from "../components/header/header";
import { Footer } from "@/components/shared/footer";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: "Scary video generator AI",
  icons: [
    { rel: "icon", type: "image/png", sizes: "48x48", url: "/favicon.ico" },
  ],
  keywords: [
    "Scary story generator",
    "Scary story generator",
    "Scary video ai",
  ],
  description:
    "Experience the power of AI-generated scary stories with captivating visuals, haunting voiceovers, and engaging captions - perfect for YouTube, TikTok, and beyond!",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background antialiased",
          amatic.variable,
          jolly.variable,
          nosifer.variable,
          special.variable,
        )}
      >
        <Providers>
          <NextTopLoader />
          <TooltipProvider>
            <div className="flex h-screen w-screen flex-col overflow-hidden">
              <Header />
              <div className="h-full w-full flex-1 overflow-auto">
                <main className="min-h-[calc(100vh-100px)]">{children}</main>
                <Footer />
              </div>
            </div>
          </TooltipProvider>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
