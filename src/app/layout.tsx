import "@/styles/globals.css";

import { type Metadata } from "next";

import { ReactNode } from "react";
import { Archivo, Libre_Franklin } from "next/font/google";
import { Providers } from "../components/providers/global-providers";
import NextTopLoader from "nextjs-toploader";
import { cn } from "@/lib/utils";
import { Header } from "../components/header/header";
import { Toaster } from "@/components/ui/sonner";
const archivo = Archivo({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-archivo",
});
const libre_franklin = Libre_Franklin({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-libre_franklin",
});

export const metadata: Metadata = {
  title: "Tạo video kinh dị với AI",
  icons: [
    { rel: "icon", type: "image/png", sizes: "48x48", url: "/favicon.ico" },
  ],
  keywords: [
    "Scary story generator",
    "Scary story generator",
    "Scary video ai",
  ],
  description: "Tạo video kinh dị với AI",
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
          archivo.variable + " " + libre_franklin.variable,
        )}
      >
        <Providers>
          <NextTopLoader />
          <div className="flex h-screen w-screen flex-col overflow-hidden">
            <Header />
            <div className="h-full w-full flex-1 overflow-auto py-4">
              <main className="container h-full">{children}</main>
            </div>
          </div>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
