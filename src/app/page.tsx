"use client";

import { useState } from "react";
import Sidebar from "@/components/chat/Sidebar";
import ChatView from "@/components/chat/ChatView";
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
      <div className="flex flex-1 flex-col bg-muted/20">
        {!selectedConversation ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8">
            <div className="flex flex-col items-center gap-4 text-center">
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
          </div>
        ) : (
          <ChatView
            conversationId={selectedConversation}
            onBack={() => setSelectedConversation(null)}
          />
        )}
      </div>
    </div>
  );
}
