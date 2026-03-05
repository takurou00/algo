import { createAuthClient } from "better-auth/react";
import { twoFactorClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
  plugins: [
    twoFactorClient({
      twoFactorPage: "/two-factor",
    }),
  ],
});

export const { signIn, signOut, signUp, useSession } = authClient;
