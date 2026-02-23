import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    username: v.string(),
    imageUrl: v.string(),
    isOnline: v.boolean(),
    lastSeen: v.number(),
  }).index("by_clerkId", ["clerkId"]),

  conversations: defineTable({
    participants: v.array(v.id("users")),
    isGroup: v.boolean(),
    groupName: v.optional(v.string()),
    groupImage: v.optional(v.string()),
    lastMessageAt: v.number(),
  }).index("by_lastMessageAt", ["lastMessageAt"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.string(),
    type: v.union(
      v.literal("text"),
      v.literal("image"),
      v.literal("file")
    ),
    isEdited: v.boolean(),
    seenBy: v.array(v.id("users")),
  }).index("by_conversationId", ["conversationId"]),

  presence: defineTable({
    userId: v.id("users"),
    isOnline: v.boolean(),
    isTyping: v.boolean(),
    typingInConversation: v.optional(v.id("conversations")),
    lastSeen: v.number(),
  }).index("by_userId", ["userId"]),
});
