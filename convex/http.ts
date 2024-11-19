import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/slack/events",
  method: "POST",
  handler: httpAction(async ({ runAction }, request) => {
    const body = await request.json();
    
    // Verify Slack signature
    // ... implement signature verification

    if (body.type === "url_verification") {
      return new Response(JSON.stringify({ challenge: body.challenge }));
    }

    // Handle event
    await runAction(api.integrations.handleSlackEvent, {
      event: body.event
    });

    return new Response("ok");
  })
});

export default http;