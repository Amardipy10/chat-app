"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Phone, Video, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "@/lib/formatTime";

interface ChatHeaderProps {
  conversationId: Id<"conversations">;
  onBack: () => void;
}

export default function ChatHeader({
  conversationId,
  onBack,
}: ChatHeaderProps) {
  const conversation = useQuery(api.conversations.getConversation, {
    conversationId,
  });
  const currentUser = useQuery(api.users.getCurrentUser);

  // Get the other participant's ID for presence lookup
  const otherParticipantId = conversation?.participantDetails?.find(
    (p) => p != null && p._id !== currentUser?._id
  )?._id as Id<"users"> | undefined;

  // Subscribe to the other user's presence (real-time)
  const otherPresence = useQuery(
    api.presence.getPresence,
    otherParticipantId ? { userId: otherParticipantId } : "skip"
  );

  if (!conversation || !currentUser) {
    return (
      <div className="flex h-16 items-center border-b border-border/50 px-4 bg-card/50 backdrop-blur-sm">
        <div className="h-5 w-32 animate-pulse rounded-md bg-muted" />
      </div>
    );
  }

  const otherParticipant = conversation.participantDetails?.find(
    (p) => p != null && p._id !== currentUser._id
  );

  const displayName = conversation.isGroup
    ? conversation.groupName ?? "Group Chat"
    : otherParticipant?.username ?? "Unknown";

  const displayImage = conversation.isGroup
    ? conversation.groupImage
    : otherParticipant?.imageUrl;

  const isOnline = otherPresence?.isOnline ?? otherParticipant?.isOnline ?? false;
  const isTyping =
    otherPresence?.isTyping &&
    otherPresence?.typingInConversation === conversationId;

  // Build status text
  const getStatusText = () => {
    if (isTyping) return null; // handled separately with animation
    if (isOnline) return <span className="text-emerald-500 font-medium">Online</span>;
    if (otherPresence?.lastSeen) {
      return `Last seen ${formatDistanceToNow(otherPresence.lastSeen)} ago`;
    }
    return "Offline";
  };

  return (
    <div className="flex h-16 items-center justify-between border-b border-border/50 px-4 bg-card/50 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="h-8 w-8 md:hidden"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div className="relative">
          <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm">
            <AvatarImage src={displayImage} alt={displayName} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
              {displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {isOnline && (
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-background" />
          )}
        </div>

        <div>
          <h2 className="text-sm font-semibold text-foreground leading-tight">
            {displayName}
          </h2>
          <div className="text-[11px] text-muted-foreground h-4">
            {isTyping ? (
              <span className="text-primary font-medium flex items-center gap-1">
                typing
                <span className="flex gap-0.5">
                  <span className="inline-block h-1 w-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms", animationDuration: "1s" }} />
                  <span className="inline-block h-1 w-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms", animationDuration: "1s" }} />
                  <span className="inline-block h-1 w-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms", animationDuration: "1s" }} />
                </span>
              </span>
            ) : (
              getStatusText()
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
          <Phone className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
          <Video className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
