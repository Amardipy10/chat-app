import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Create a new 1:1 or group conversation.
 * Prevents duplicate 1:1 conversations between the same two users.
 */
export const createConversation = mutation({
  args: {
    participants: v.array(v.id("users")),
    isGroup: v.boolean(),
    groupName: v.optional(v.string()),
    groupImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // For 1:1 chats, check if a conversation already exists
    if (!args.isGroup && args.participants.length === 2) {
      const existingConversations = await ctx.db
        .query("conversations")
        .collect();

      const existingDM = existingConversations.find(
        (conv) =>
          !conv.isGroup &&
          conv.participants.length === 2 &&
          conv.participants.includes(args.participants[0]) &&
          conv.participants.includes(args.participants[1])
      );

      if (existingDM) return existingDM._id;
    }

    return await ctx.db.insert("conversations", {
      participants: args.participants,
      isGroup: args.isGroup,
      groupName: args.groupName,
      groupImage: args.groupImage,
      lastMessageAt: Date.now(),
    });
  },
});

/**
 * List all conversations for the current user,
 * sorted by most-recent message first.
 */
export const getConversations = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser) return [];

    const allConversations = await ctx.db
      .query("conversations")
      .withIndex("by_lastMessageAt")
      .order("desc")
      .collect();

    // Filter to only conversations the current user is part of
    const userConversations = allConversations.filter((conv) =>
      conv.participants.includes(currentUser._id)
    );

    // Enrich with participant details and last message
    const enriched = await Promise.all(
      userConversations.map(async (conv) => {
        const participantDetails = await Promise.all(
          conv.participants.map(async (pId) => await ctx.db.get(pId))
        );

        // Get last message for preview
        const lastMessage = await ctx.db
          .query("messages")
          .withIndex("by_conversationId", (q) =>
            q.eq("conversationId", conv._id)
          )
          .order("desc")
          .first();

        return {
          ...conv,
          participantDetails: participantDetails.filter(Boolean),
          lastMessage,
        };
      })
    );

    return enriched;
  },
});

/**
 * Get a single conversation with participant details.
 */
export const getConversation = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) return null;

    const participantDetails = await Promise.all(
      conversation.participants.map(async (pId) => await ctx.db.get(pId))
    );

    return {
      ...conversation,
      participantDetails: participantDetails.filter(Boolean),
    };
  },
});
