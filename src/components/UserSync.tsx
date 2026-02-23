"use client";

import { useStoreUserEffect } from "@/hooks/useStoreUserEffect";

/**
 * Invisible component that syncs the authenticated Clerk user
 * into the Convex `users` table. Place once in the app layout.
 */
export default function UserSync() {
  useStoreUserEffect();
  return null;
}
