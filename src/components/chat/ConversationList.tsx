"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "@/lib/formatTime";

interface ConversationListProps {
  selectedId: Id<"conversations"> | null;
  onSelect: (id: Id<"conversations">) => void;
}

function ConversationItem({
  conv,
  currentUserId,
  isSelected,
  onSelect,
}: {
  conv: {
    _id: Id<"conversations">;
    isGroup: boolean;
    groupName?: string;
    groupImage?: string;
    lastMessageAt: number;
    lastMessage?: { content: string } | null;
    participantDetails?: Array<{
      _id: string;
      username: string;
      imageUrl: string;
      isOnline: boolean;
    } | null>;
  };
  currentUserId: string | undefined;
  isSelected: boolean;
  onSelect: (id: Id<"conversations">) => void;
}) {
  // Subscribe to unread count for this conversation (reactive)
  const unreadCount =
    useQuery(api.messages.getUnreadCount, { conversationId: conv._id }) ?? 0;

  const otherParticipant = conv.participantDetails?.find(
    (p) => p != null && p._id !== currentUserId
  );

  const displayName = conv.isGroup
    ? conv.groupName ?? "Group Chat"
    : otherParticipant?.username ?? "Unknown";

  const displayImage = conv.isGroup
    ? conv.groupImage
    : otherParticipant?.imageUrl;

  return (
    <button
      onClick={() => onSelect(conv._id)}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-200 group ${
        isSelected
          ? "bg-primary/10 ring-1 ring-primary/20 shadow-sm"
          : "hover:bg-accent/60"
      }`}
    >
      <div className="relative flex-shrink-0">
        <Avatar className="h-11 w-11 ring-2 ring-background shadow-sm">
          <AvatarImage src={displayImage} alt={displayName} />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
            {displayName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {!conv.isGroup && otherParticipant?.isOnline && (
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-background" />
        )}
      </div>

      <div className="flex-1 overflow-hidden min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p
            className={`truncate text-sm font-semibold ${
              unreadCount > 0
                ? "text-foreground"
                : isSelected
                  ? "text-primary"
                  : "text-foreground"
            }`}
          >
            {displayName}
          </p>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {conv.lastMessageAt && (
              <span
                className={`text-[10px] ${
                  unreadCount > 0
                    ? "text-primary font-semibold"
                    : "text-muted-foreground/70"
                }`}
              >
                {formatDistanceToNow(conv.lastMessageAt)}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          {conv.lastMessage ? (
            <p
              className={`truncate text-xs ${
                unreadCount > 0
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
              }`}
            >
              {conv.lastMessage.content}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground/50">No messages</p>
          )}
          {unreadCount > 0 && (
            <Badge
              variant="default"
              className="h-5 min-w-5 flex items-center justify-center rounded-full px-1.5 text-[10px] font-bold bg-primary text-primary-foreground"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </button>
  );
}

export default function ConversationList({
  selectedId,
  onSelect,
}: ConversationListProps) {
  const conversations = useQuery(api.conversations.getConversations) ?? [];
  const currentUser = useQuery(api.users.getCurrentUser);

  if (conversations.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <div className="rounded-2xl bg-muted/50 p-4 mb-3">
          <MessageCircle className="h-8 w-8 text-muted-foreground/60" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          No conversations yet
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          Start a new chat to begin messaging
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="space-y-0.5 p-2">
        {conversations.map((conv) => (
          <ConversationItem
            key={conv._id}
            conv={conv}
            currentUserId={currentUser?._id}
            isSelected={selectedId === conv._id}
            onSelect={onSelect}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
