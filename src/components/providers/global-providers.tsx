import { ReactNode } from "react";
import { ThemeProvider } from "./theme-provider";
import { ModalProvider } from "./modal-provider";
import { TRPCReactProvider } from "@/trpc/react";
import { env } from "@/env";
export async function Providers({ children }: { children: ReactNode }) {
  return (
    <TRPCReactProvider>
      <ModalProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </ModalProvider>
    </TRPCReactProvider>
  );
}
