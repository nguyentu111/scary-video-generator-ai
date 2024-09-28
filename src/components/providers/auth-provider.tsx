"use client";
import { createContext, useContext } from "react";
import type { Session, sessions } from "@/server/db/schema";
import { User } from "lucia";
import { useRouter } from "next/navigation";
const authContext = createContext({
  user: null as User | null,
  session: null as Session | null,
});
interface Auth {
  session: Session | null;
  user: User | null;
  children: React.ReactNode;
}

export const AuthProvider = ({ children, session, user }: Auth) => {
  return (
    <authContext.Provider value={{ session, user }}>
      {children}
    </authContext.Provider>
  );
};
export const useAuth = () => {
  const context = useContext(authContext);
  if (!context) {
    throw new Error("useAuth must be used within the auth provider");
  }
  return context;
};
export const useAssertAuth = () => {
  const router = useRouter();
  const context = useContext(authContext);
  if (!context) {
    throw new Error("useAuth must be used within the auth provider");
  }
  if (!context.user || !context.session) router.push("/sign-in");
  return context as { user: User; session: Session };
};
