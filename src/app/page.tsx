"use client";

import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-8">
      <div className="absolute top-4 right-4">
        <UserButton afterSignOutUrl="/sign-in" />
      </div>

      <h1 className="text-4xl font-bold tracking-tight text-foreground">
        🚀 ChatApp
      </h1>
      <p className="max-w-md text-center text-muted-foreground">
        Real-time messaging powered by Next.js, Convex &amp; Clerk.
        <br />
        Phase 1 setup complete — ready for Phase 2!
      </p>

      <div className="flex gap-3">
        <Button>Primary Button</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
      </div>
    </div>
  );
}
