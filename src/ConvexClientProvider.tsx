import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import type { ReactNode } from "react";

// This URL is injected at deploy time by Vercel.
// For local dev, start with: CONVEX_DEPLOYMENT=https://honorable-goose-849.convex.cloud npm run dev
const convexUrl = "https://honorable-goose-849.convex.cloud";
const convex = new ConvexReactClient(convexUrl);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexAuthProvider client={convex}>
      <ConvexProvider client={convex}>{children}</ConvexProvider>
    </ConvexAuthProvider>
  );
}
