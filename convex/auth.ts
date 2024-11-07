import { convexAuth } from "@convex-dev/auth/server";
import Google, { GoogleProfile } from "@auth/core/providers/google";
export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    Google({
      profile(googleProfile: GoogleProfile) {
        return {
          email: googleProfile.email,
          id: googleProfile.sub,
          image: googleProfile.image,
          name: googleProfile.name,
          credits: 1000,
        };
      },
    }),
  ],
});
