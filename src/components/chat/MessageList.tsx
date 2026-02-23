"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useRef } from "react";
import { formatDistanceToNow } from "@/lib/formatTime";

interface MessageListProps {
  conversationId: Id<"conversations">;
  currentUserId: Id<"users">;
}

export default function MessageList({
  conversationId,
  currentUserId,
}: MessageListProps) {
  const messages =
    useQuery(api.messages.getMessages, { conversationId }) ?? [];
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">No messages yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Send a message to start the conversation
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 px-4" ref={scrollRef}>
      <div className="space-y-1 py-4">
        {messages.map((msg, index) => {
          const isOwn = msg.senderId === currentUserId;
          const showAvatar =
            !isOwn &&
            (index === 0 || messages[index - 1]?.senderId !== msg.senderId);
          const isLastInGroup =
            index === messages.length - 1 ||
            messages[index + 1]?.senderId !== msg.senderId;

          // Show timestamp divider for messages far apart
          const showTimeDivider =
            index === 0 ||
            msg._creationTime - messages[index - 1]._creationTime > 300000; // 5 min gap

          return (
            <div key={msg._id}>
              {showTimeDivider && (
                <div className="flex items-center justify-center py-3">
                  <span className="text-[10px] font-medium text-muted-foreground/60 bg-muted/60 px-3 py-1 rounded-full">
                    {new Date(msg._creationTime).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </span>
                </div>
              )}

              <div
                className={`flex items-end gap-2 ${
                  isOwn ? "flex-row-reverse" : "flex-row"
                } ${isLastInGroup ? "mb-2" : "mb-0.5"}`}
              >
                {/* Avatar (only for received messages, first in group) */}
                <div className="w-8 flex-shrink-0">
                  {showAvatar && !isOwn && msg.sender && (
                    <Avatar className="h-8 w-8 ring-1 ring-border/50">
                      <AvatarImage
                        src={msg.sender.imageUrl}
                        alt={msg.sender.username}
                      />
                      <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                        {msg.sender.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>

                {/* Message bubble */}
                <div
                  className={`group relative max-w-[65%] transition-all duration-150 ${
                    isOwn ? "items-end" : "items-start"
                  }`}
                >
                  {/* Sender name (only for received messages, first in group) */}
                  {showAvatar && !isOwn && msg.sender && (
                    <p className="mb-0.5 ml-1 text-[10px] font-semibold text-muted-foreground/70">
                      {msg.sender.username}
                    </p>
                  )}

                  <div
                    className={`rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                      isOwn
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted/80 text-foreground rounded-bl-md"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">
                      {msg.content}
                    </p>
                  </div>

                  {/* Timestamp on hover */}
                  {isLastInGroup && (
                    <p
                      className={`mt-0.5 text-[10px] text-muted-foreground/50 ${
                        isOwn ? "text-right mr-1" : "ml-1"
                      }`}
                    >
                      {formatDistanceToNow(msg._creationTime)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
