import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ============ CHATS ============

export const listChats = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    if (!args.userId) {
      // Anonymous user - return empty (local-only mode)
      return [];
    }
    return await ctx.db
      .query("chats")
      .withIndex("by_user_updated", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const createChat = mutation({
  args: { 
    userId: v.id("users"),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const chatId = await ctx.db.insert("chats", {
      userId: args.userId,
      title: args.title || "New Conversation",
      createdAt: now,
      updatedAt: now,
    });
    return chatId;
  },
});

export const updateChatTitle = mutation({
  args: { id: v.id("chats"), title: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      title: args.title,
      updatedAt: Date.now(),
    });
  },
});

export const deleteChat = mutation({
  args: { id: v.id("chats") },
  handler: async (ctx, args) => {
    // Delete all messages first
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.id))
      .collect();
    
    for (const msg of messages) {
      await ctx.db.delete(msg._id);
    }
    
    await ctx.db.delete(args.id);
  },
});

// ============ MESSAGES ============

export const getMessages = query({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .order("asc")
      .collect();
  },
});

export const addMessage = mutation({
  args: {
    chatId: v.id("chats"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      chatId: args.chatId,
      role: args.role,
      content: args.content,
      createdAt: Date.now(),
    });
    
    // Update chat's updatedAt
    await ctx.db.patch(args.chatId, { updatedAt: Date.now() });
    
    return messageId;
  },
});

// ============ JOURNALS ============

export const listJournals = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("journals")
      .withIndex("by_user_created", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const createJournal = mutation({
  args: {
    userId: v.id("users"),
    content: v.string(),
    mood: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const journalId = await ctx.db.insert("journals", {
      userId: args.userId,
      content: args.content,
      mood: args.mood || undefined,
      reflection: undefined,
      createdAt: Date.now(),
    });
    return journalId;
  },
});

export const updateJournalReflection = mutation({
  args: { id: v.id("journals"), reflection: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { reflection: args.reflection });
  },
});

export const deleteJournal = mutation({
  args: { id: v.id("journals") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// ============ MOODS ============

export const listMoods = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("moods")
      .withIndex("by_user_created", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(30); // Last 30 entries
  },
});

export const logMood = mutation({
  args: {
    userId: v.id("users"),
    level: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("moods", {
      userId: args.userId,
      level: args.level,
      notes: args.notes,
      createdAt: Date.now(),
    });
  },
});

// ============ EXERCISES ============

export const listExercises = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("exercises")
      .withIndex("by_user_completed", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(50);
  },
});

export const completeExercise = mutation({
  args: {
    userId: v.id("users"),
    exerciseType: v.string(),
    duration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("exercises", {
      userId: args.userId,
      exerciseType: args.exerciseType,
      duration: args.duration,
      completedAt: Date.now(),
    });
  },
});
