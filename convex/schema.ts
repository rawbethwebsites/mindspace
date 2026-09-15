import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table - managed by Convex Auth
  users: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    image: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_email", ["email"]),

  // Chat conversations
  chats: defineTable({
    userId: v.id("users"),
    title: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_updated", ["userId", "updatedAt"]),

  // Chat messages
  messages: defineTable({
    chatId: v.id("chats"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
    createdAt: v.number(),
  })
    .index("by_chat", ["chatId"]),

  // Journal entries
  journals: defineTable({
    userId: v.id("users"),
    content: v.string(),
    reflection: v.optional(v.string()),
    mood: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_created", ["userId", "createdAt"]),

  // Mood logs
  moods: defineTable({
    userId: v.id("users"),
    level: v.number(), // 1-5
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_created", ["userId", "createdAt"]),

  // Exercise completions
  exercises: defineTable({
    userId: v.id("users"),
    exerciseType: v.string(), // "breathing", "grounding", "cbt", "body-scan"
    completedAt: v.number(),
    duration: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_user_completed", ["userId", "completedAt"]),
});
