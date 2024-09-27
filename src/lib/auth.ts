import { GitHub, Google } from "arctic";
import { Lucia } from "lucia";
import { db } from "@/server/db";
import { cookies } from "next/headers";
import { User } from "lucia";
import { sessions, users, User as UserType } from "@/server/db/schema";
import { Session } from "lucia";
import { env } from "@/env";
import { DrizzleMySQLAdapter } from "@lucia-auth/adapter-drizzle";
const adapter = new DrizzleMySQLAdapter(db, sessions, users);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    expires: false,
    attributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },
  getUserAttributes: (attributes) => {
    return {
      id: attributes.id,
    };
  },
});

export const auth = async (): Promise<
  { user: User; session: Session } | { user: null; session: null }
> => {
  const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
  if (!sessionId) {
    return {
      user: null,
      session: null,
    };
  }

  const result = await lucia.validateSession(sessionId);

  // next.js throws when you attempt to set cookie when rendering page
  try {
    if (result.session && result.session.fresh) {
      const sessionCookie = lucia.createSessionCookie(result.session.id);
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );
    }
    if (!result.session) {
      const sessionCookie = lucia.createBlankSessionCookie();
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );
    }
  } catch {}
  return result;
};

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: {
      id: UserType["id"];
    };
    UserId: UserType["id"];
  }
}

export const github = new GitHub(
  env.GITHUB_CLIENT_ID,
  env.GITHUB_CLIENT_SECRET,
);

export const googleAuth = new Google(
  env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  `${env.HOST_NAME}/api/login/google/callback`,
);
//https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?response_type=code&
//client_id=393841475025-3tj2j3ltke9nolrkjmvpqbkv97aa56ot.apps.googleusercontent.com&state=fzsaw_q6XSjahoULn95qnpVOg9m3poJu4CTtqWrU2h4&scope=profile%20email%20openid&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Flogin%2Fgoogle%2Fcallback&code_challenge=r6-8tB_7D3VvxOL3gMhIBtt6i5JSmPbbpkckM6eYgic&code_challenge_method=S256&service=lso&o2v=2&ddm=0&flowName=GeneralOAuthFlow
