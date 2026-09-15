"use client";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import type { ReactNode } from "react";

const convex = new ConvexReactClient("https://honorable-goose-849.convex.cloud");

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}

export const auth = {
  getUserId(): string | null {
    return localStorage.getItem("mindspace_userId");
  },
  getToken(): string | null {
    return localStorage.getItem("mindspace_token");
  },
  setUser(userId: string, token: string) {
    localStorage.setItem("mindspace_userId", userId);
    localStorage.setItem("mindspace_token", token);
  },
  clear() {
    localStorage.removeItem("mindspace_userId");
    localStorage.removeItem("mindspace_token");
  },
};
