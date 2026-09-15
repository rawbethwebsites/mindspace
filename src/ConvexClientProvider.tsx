"use client";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import type { ReactNode } from "react";

const convex = new ConvexReactClient("https://honorable-goose-849.convex.cloud");

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexAuthProvider client={convex}>
      <ConvexProvider client={convex}>{children}</ConvexProvider>
    </ConvexAuthProvider>
  );
}