"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useCallback, useEffect } from "react";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import TypingIndicator from "./TypingIndicator";
import { usePresence } from "@/hooks/usePresence";

interface ChatViewProps {
  conversationId: Id<"conversations">;
  onBack: () => void;
}

export default function ChatView({ conversationId, onBack }: ChatViewProps) {
  const currentUser = useQuery(api.users.getCurrentUser);
  const setPresence = useMutation(api.presence.setPresence);
  const markAsRead = useMutation(api.messages.markAsRead);

  // Manage online/offline lifecycle
  usePresence();

  // Mark messages as read when conversation opens and when new messages arrive
  const messages = useQuery(api.messages.getMessages, { conversationId });
  useEffect(() => {
    if (conversationId && messages) {
      markAsRead({ conversationId }).catch(() => {});
    }
  }, [conversationId, messages?.length, markAsRead]);

  // Get conversation to find other participant
  const conversation = useQuery(api.conversations.getConversation, {
    conversationId,
  });

  // Find the other participant's ID
  const otherParticipantId = conversation?.participantDetails?.find(
    (p: { _id: string }) => p._id !== currentUser?._id
  )?._id as Id<"users"> | undefined;

  // Subscribe to other user's presence for typing indicator below messages
  const otherPresence = useQuery(
    api.presence.getPresence,
    otherParticipantId ? { userId: otherParticipantId } : "skip"
  );

  const otherUser = conversation?.participantDetails?.find(
    (p: { _id: string }) => p._id !== currentUser?._id
  );

  const isOtherTyping =
    otherPresence?.isTyping &&
    otherPresence?.typingInConversation === conversationId;

  const handleTyping = useCallback(
    (isTyping: boolean) => {
      setPresence({
        isOnline: true,
        isTyping,
        typingInConversation: isTyping ? conversationId : undefined,
      }).catch(() => {
        // Silently fail — presence is non-critical
      });
    },
    [conversationId, setPresence]
  );

  if (!currentUser) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col h-full">
      <ChatHeader conversationId={conversationId} onBack={onBack} />
      <MessageList
        conversationId={conversationId}
        currentUserId={currentUser._id}
      />
      {isOtherTyping && (
        <TypingIndicator username={otherUser?.username} />
      )}
      <MessageInput
        conversationId={conversationId}
        onTyping={handleTyping}
      />
    </div>
  );
}
