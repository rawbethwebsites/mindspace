import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get current user
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email as string))
      .unique();

    return user;
  },
});

// Create user after signup
export const createUser = mutation({
  args: {
    email: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (existing) {
      throw new Error("User already exists");
    }

    await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      createdAt: Date.now(),
    });
  },
});
