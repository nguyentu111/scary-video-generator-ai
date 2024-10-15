import { convexAuth } from "@convex-dev/auth/server";
import GitHub from "@auth/core/providers/github";
import Google, { GoogleProfile } from "@auth/core/providers/google";
export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    GitHub({
      profile(githubProfile) {
        return {
          id: githubProfile.id.toString(),
          name: githubProfile.name,
          email: githubProfile.email,
          image: githubProfile.picture as string,
          githubId: githubProfile.id,
        };
      },
    }),
    Google({
      profile(googleProfile: GoogleProfile) {
        return {
          email: googleProfile.email,
          id: googleProfile.sub,
          image: googleProfile.image,
          name: googleProfile.name,
          credits: 10000,
        };
      },
    }),
  ],
});
