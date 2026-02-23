"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus, Search, Users } from "lucide-react";

interface UserListProps {
  onConversationSelect: (conversationId: Id<"conversations">) => void;
}

export default function UserList({ onConversationSelect }: UserListProps) {
  const users = useQuery(api.users.getUsers) ?? [];
  const currentUser = useQuery(api.users.getCurrentUser);
  const createConversation = useMutation(api.conversations.createConversation);

  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Filter out the current user and apply search
  const filteredUsers = users.filter((user) => {
    if (currentUser && user._id === currentUser._id) return false;
    const query = search.toLowerCase();
    return (
      user.username.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  });

  const handleStartChat = async (otherUserId: Id<"users">) => {
    if (!currentUser || isCreating) return;
    setIsCreating(true);

    try {
      const conversationId = await createConversation({
        participants: [currentUser._id, otherUserId],
        isGroup: false,
      });
      setIsOpen(false);
      setSearch("");
      onConversationSelect(conversationId);
    } catch (error) {
      console.error("Failed to create conversation:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-border/50 bg-card/50 backdrop-blur-sm hover:bg-accent/80 transition-all duration-200"
        >
          <MessageSquarePlus className="h-4 w-4" />
          New Chat
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md border-border/50 bg-background/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-primary" />
            Start a Conversation
          </DialogTitle>
        </DialogHeader>

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-muted/50 border-border/50 focus-visible:ring-primary/30"
          />
        </div>

        {/* User list */}
        <ScrollArea className="max-h-72">
          <div className="space-y-1 pr-3">
            {filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Users className="h-10 w-10 mb-2 opacity-40" />
                <p className="text-sm">
                  {search ? "No users found" : "No other users yet"}
                </p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <button
                  key={user._id}
                  onClick={() => handleStartChat(user._id)}
                  disabled={isCreating}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-150 hover:bg-accent/80 disabled:opacity-50 group"
                >
                  <div className="relative">
                    <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm">
                      <AvatarImage src={user.imageUrl} alt={user.username} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                        {user.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {user.isOnline && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-background" />
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {user.username}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  {user.isOnline && (
                    <span className="text-[10px] font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      Online
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
