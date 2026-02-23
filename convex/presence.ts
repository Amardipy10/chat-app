import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Update a user's presence (online/typing status).
 * Creates a presence record if one doesn't exist.
 */
export const setPresence = mutation({
  args: {
    isOnline: v.boolean(),
    isTyping: v.optional(v.boolean()),
    typingInConversation: v.optional(v.id("conversations")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser) throw new Error("User not found in database");

    // Also update the user's isOnline and lastSeen fields
    await ctx.db.patch(currentUser._id, {
      isOnline: args.isOnline,
      lastSeen: Date.now(),
    });

    // Find existing presence record
    const existing = await ctx.db
      .query("presence")
      .withIndex("by_userId", (q) => q.eq("userId", currentUser._id))
      .unique();

    const presenceData = {
      userId: currentUser._id,
      isOnline: args.isOnline,
      isTyping: args.isTyping ?? false,
      typingInConversation: args.typingInConversation,
      lastSeen: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, presenceData);
      return existing._id;
    }

    return await ctx.db.insert("presence", presenceData);
  },
});

/**
 * Get presence for a single user.
 */
export const getPresence = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("presence")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
  },
});

/**
 * Get presence for multiple users (e.g. all participants in a conversation).
 */
export const getPresences = query({
  args: { userIds: v.array(v.id("users")) },
  handler: async (ctx, args) => {
    const presences = await Promise.all(
      args.userIds.map(async (userId) => {
        const presence = await ctx.db
          .query("presence")
          .withIndex("by_userId", (q) => q.eq("userId", userId))
          .unique();
        return { userId, presence };
      })
    );
    return presences;
  },
});
