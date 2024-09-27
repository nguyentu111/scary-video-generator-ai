import "server-only";
import { cookies } from "next/headers";
import { lucia } from "@/lib/auth";
import { auth } from "@/lib/auth";
import { cache } from "react";
import { AuthenticationError } from "@/server/use-cases/errors";
import { User } from "lucia";

export const getCurrentUser = cache(async () => {
  const session = await auth();
  if (!session.user) {
    return undefined;
  }
  return session.user;
});

export const assertAuthenticated = async () => {
  const user = await getCurrentUser();
  if (!user) {
    throw new AuthenticationError();
  }
  return user;
};

export async function setSession(userId: User["id"]) {
  const session = await lucia.createSession(userId, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );
}
