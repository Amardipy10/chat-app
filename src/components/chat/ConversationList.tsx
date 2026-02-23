"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "@/lib/formatTime";

interface ConversationListProps {
  selectedId: Id<"conversations"> | null;
  onSelect: (id: Id<"conversations">) => void;
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
        {conversations.map((conv) => {
          // For 1:1, show the other person's info
          const otherParticipant = conv.participantDetails?.find(
            (p: { _id: string }) => p._id !== currentUser?._id
          );

          const displayName = conv.isGroup
            ? conv.groupName ?? "Group Chat"
            : otherParticipant?.username ?? "Unknown";

          const displayImage = conv.isGroup
            ? conv.groupImage
            : otherParticipant?.imageUrl;

          const isSelected = selectedId === conv._id;

          return (
            <button
              key={conv._id}
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
                      isSelected ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {displayName}
                  </p>
                  {conv.lastMessageAt && (
                    <span className="flex-shrink-0 text-[10px] text-muted-foreground/70">
                      {formatDistanceToNow(conv.lastMessageAt)}
                    </span>
                  )}
                </div>
                {conv.lastMessage && (
                  <p className="truncate text-xs text-muted-foreground mt-0.5">
                    {conv.lastMessage.content}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
}
