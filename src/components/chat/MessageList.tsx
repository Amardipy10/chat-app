"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState, useCallback } from "react";
import { formatDistanceToNow } from "@/lib/formatTime";
import { ChevronDown } from "lucide-react";

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

  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const prevMessageCountRef = useRef(messages.length);

  // Check if user is scrolled near the bottom (within 150px)
  const checkIfNearBottom = useCallback(() => {
    const container = containerRef.current;
    if (!container) return true;
    const threshold = 150;
    return (
      container.scrollHeight - container.scrollTop - container.clientHeight <
      threshold
    );
  }, []);

  // Handle scroll events
  const handleScroll = useCallback(() => {
    const nearBottom = checkIfNearBottom();
    setIsNearBottom(nearBottom);
    if (nearBottom) {
      setNewMessageCount(0);
    }
  }, [checkIfNearBottom]);

  // Smart auto-scroll: only scroll if user is near bottom
  useEffect(() => {
    const currentCount = messages.length;
    const prevCount = prevMessageCountRef.current;

    if (currentCount > prevCount) {
      const newMsgs = currentCount - prevCount;

      if (isNearBottom) {
        // User is near bottom → scroll to new messages
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      } else {
        // User is scrolled up → show "new messages" badge
        setNewMessageCount((prev) => prev + newMsgs);
      }
    }

    prevMessageCountRef.current = currentCount;
  }, [messages.length, isNearBottom]);

  // Scroll to bottom on first load
  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, [conversationId]);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    setNewMessageCount(0);
  };

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
    <div className="relative flex-1 overflow-hidden">
      <ScrollArea
        className="h-full px-4"
        ref={containerRef}
        onScrollCapture={handleScroll}
      >
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
              msg._creationTime - messages[index - 1]._creationTime > 300000;

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
                  {/* Avatar */}
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
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* "New messages" floating button */}
      {newMessageCount > 0 && !isNearBottom && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-primary-foreground shadow-lg transition-all duration-300 hover:bg-primary/90 animate-in slide-in-from-bottom-2"
        >
          <ChevronDown className="h-3.5 w-3.5" />
          <span className="text-xs font-semibold">
            {newMessageCount} new message{newMessageCount > 1 ? "s" : ""}
          </span>
        </button>
      )}
    </div>
  );
}
