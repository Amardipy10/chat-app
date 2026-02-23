"use client";

import { Id } from "../../../convex/_generated/dataModel";
import { UserButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import UserList from "./UserList";
import ConversationList from "./ConversationList";
import { MessageSquare } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface SidebarProps {
  selectedConversation: Id<"conversations"> | null;
  onConversationSelect: (id: Id<"conversations">) => void;
}

export default function Sidebar({
  selectedConversation,
  onConversationSelect,
}: SidebarProps) {
  const currentUser = useQuery(api.users.getCurrentUser);

  return (
    <div className="flex h-full w-80 flex-col border-r border-border/50 bg-card/30 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-foreground">
              ChatApp
            </h1>
            {currentUser && (
              <p className="text-[11px] text-muted-foreground leading-none mt-0.5">
                {currentUser.username}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <UserList onConversationSelect={onConversationSelect} />
          <UserButton afterSignOutUrl="/sign-in" />
        </div>
      </div>

      <Separator className="opacity-50" />

      {/* Conversations label */}
      <div className="px-4 py-2.5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
          Messages
        </p>
      </div>

      {/* Conversation list */}
      <ConversationList
        selectedId={selectedConversation}
        onSelect={onConversationSelect}
      />
    </div>
  );
}
