"use client";

import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect, useRef } from "react";

/**
 * Manages the current user's online/offline presence.
 *
 * - Sets `isOnline: true` on mount
 * - Sets `isOnline: false` on unmount, tab close, and tab visibility change
 * - Sends periodic heartbeats to keep presence alive
 */
export function usePresence() {
  const setPresence = useMutation(api.presence.setPresence);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Go online
    const goOnline = () => {
      setPresence({ isOnline: true }).catch(() => {});
    };

    // Go offline
    const goOffline = () => {
      setPresence({ isOnline: false }).catch(() => {});
    };

    // Handle visibility change (tab switch)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        goOnline();
      } else {
        goOffline();
      }
    };

    // Handle page close / navigate away
    const handleBeforeUnload = () => {
      // Use sendBeacon for reliability on page close
      goOffline();
    };

    // Set online on mount
    goOnline();

    // Heartbeat every 30 seconds to keep presence alive
    heartbeatRef.current = setInterval(() => {
      if (document.visibilityState === "visible") {
        goOnline();
      }
    }, 30000);

    // Add listeners
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      // Cleanup
      goOffline();
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [setPresence]);
}
