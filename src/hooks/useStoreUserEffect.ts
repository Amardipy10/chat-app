"use client";

import { useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import { api } from "../../convex/_generated/api";

/**
 * Automatically syncs the current Clerk user to the Convex users table.
 * This runs client-side on every page load as a fallback —
 * the Clerk webhook (http.ts) handles server-side sync,
 * but this ensures the user exists immediately on first sign-in
 * without waiting for the webhook round-trip.
 */
export function useStoreUserEffect() {
  const { user, isLoaded, isSignedIn } = useUser();
  const createOrUpdateUser = useMutation(api.users.createOrUpdateUser);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user || hasRun.current) return;

    hasRun.current = true;

    const email = user.emailAddresses[0]?.emailAddress ?? "";
    const username =
      user.username ??
      user.firstName ??
      email.split("@")[0] ??
      "User";
    const imageUrl = user.imageUrl ?? "";

    createOrUpdateUser({
      clerkId: user.id,
      email,
      username,
      imageUrl,
    }).catch((error) => {
      console.error("Failed to sync user to Convex:", error);
      hasRun.current = false; // Allow retry on next render
    });
  }, [isLoaded, isSignedIn, user, createOrUpdateUser]);
}
