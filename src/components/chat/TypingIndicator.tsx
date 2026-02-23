"use client";

/**
 * Animated typing indicator with bouncing dots.
 */
export default function TypingIndicator({ username }: { username?: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="flex items-center gap-1.5 rounded-2xl bg-muted/80 px-4 py-2.5 rounded-bl-md">
        <div className="flex items-center gap-0.5">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce"
            style={{ animationDelay: "0ms", animationDuration: "1s" }}
          />
          <span
            className="inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce"
            style={{ animationDelay: "150ms", animationDuration: "1s" }}
          />
          <span
            className="inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce"
            style={{ animationDelay: "300ms", animationDuration: "1s" }}
          />
        </div>
      </div>
      {username && (
        <span className="text-[11px] text-muted-foreground/60 font-medium">
          {username} is typing...
        </span>
      )}
    </div>
  );
}
