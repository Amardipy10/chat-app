import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

/**
 * Clerk webhook endpoint.
 * Listens for user.created, user.updated, and user.deleted events
 * and syncs user data to the Convex users table.
 *
 * Setup: In your Clerk Dashboard → Webhooks, add the endpoint:
 *   https://<your-deployment>.convex.site/clerk-webhook
 * Subscribe to: user.created, user.updated, user.deleted
 */
http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    const eventType = body.type;
    const data = body.data;

    switch (eventType) {
      case "user.created":
      case "user.updated": {
        const email =
          data.email_addresses?.[0]?.email_address ?? "";
        const username =
          data.username ??
          data.first_name ??
          email.split("@")[0] ??
          "User";
        const imageUrl = data.image_url ?? "";

        await ctx.runMutation(api.users.createOrUpdateUser, {
          clerkId: data.id,
          email,
          username,
          imageUrl,
        });
        break;
      }

      case "user.deleted": {
        await ctx.runMutation(api.users.deleteUser, {
          clerkId: data.id,
        });
        break;
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;
