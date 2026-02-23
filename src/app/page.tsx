"use client";

import { useState } from "react";
import Sidebar from "@/components/chat/Sidebar";
import { Id } from "../../convex/_generated/dataModel";
import { MessageSquare } from "lucide-react";

export default function Home() {
  const [selectedConversation, setSelectedConversation] =
    useState<Id<"conversations"> | null>(null);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        selectedConversation={selectedConversation}
        onConversationSelect={setSelectedConversation}
      />

      {/* Main content area */}
      <div className="flex flex-1 flex-col items-center justify-center bg-muted/20">
        {!selectedConversation ? (
          <div className="flex flex-col items-center gap-4 text-center px-8">
            <div className="rounded-3xl bg-primary/5 p-6">
              <MessageSquare className="h-16 w-16 text-primary/40" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Welcome to ChatApp
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground max-w-sm">
                Select a conversation from the sidebar or start a new chat
                to begin messaging in real-time.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <p className="text-sm">
              Chat view coming in Phase 5 ✨
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
