import { ReactNode } from "react";
import { ThemeProvider } from "./theme-provider";
import { ModalProvider } from "./modal-provider";
import { TRPCReactProvider } from "@/trpc/react";
import { env } from "@/env";
import { ConvexClientProvider } from "./convex-client-provider";
import { AuthProvider } from "./auth-provider";
import { auth } from "@/lib/auth";
export async function Providers({ children }: { children: ReactNode }) {
  const { user, session } = await auth();
  return (
    <AuthProvider user={user} session={session}>
      <TRPCReactProvider>
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
      </TRPCReactProvider>
    </AuthProvider>
  );
}
