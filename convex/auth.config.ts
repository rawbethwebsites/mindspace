import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      profile(params) {
        const email = String(params.email || "").trim().toLowerCase();
        
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          throw new Error("Enter a valid email address");
        }

        if (params.flow === "signUp") {
          const name = String(params.name || "").trim();
          if (name.length < 2) {
            throw new Error("Name must be at least 2 characters");
          }

          return {
            email,
            name,
            createdAt: Date.now(),
          };
        }

        return { email };
      },
    }),
  ],
});
