import { ReactNode } from "react";
import { ThemeProvider } from "./theme-provider";
import { ModalProvider } from "./modal-provider";
import { ConvexClientProvider } from "./convex-client-provider";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
export async function Providers({ children }: { children: ReactNode }) {
  return (
    <ConvexAuthNextjsServerProvider>
      <ConvexClientProvider>
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
      </ConvexClientProvider>
    </ConvexAuthNextjsServerProvider>
  );
}
