"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useCallback } from "react";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

interface ChatViewProps {
  conversationId: Id<"conversations">;
  onBack: () => void;
}

export default function ChatView({ conversationId, onBack }: ChatViewProps) {
  const currentUser = useQuery(api.users.getCurrentUser);
  const setPresence = useMutation(api.presence.setPresence);

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
      <MessageInput
        conversationId={conversationId}
        onTyping={handleTyping}
      />
    </div>
  );
}
