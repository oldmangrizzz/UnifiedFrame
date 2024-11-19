import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import { Client as NotionClient } from "@notionhq/client";
import { WebClient as SlackClient } from "@slack/web-api";

export const syncNotionPage = action({
  args: {
    pageId: v.string()
  },
  handler: async (ctx, args) => {
    const notion = new NotionClient({
      auth: process.env.NOTION_API_KEY
    });

    const page = await notion.pages.retrieve({
      page_id: args.pageId
    });

    // Store in knowledge base
    await ctx.runMutation(api.knowledge.create, {
      source: "notion",
      type: "page",
      content: JSON.stringify(page),
      metadata: {
        pageId: args.pageId,
        title: page.properties?.title?.title[0]?.text?.content
      }
    });

    return page;
  }
});

export const handleSlackEvent = action({
  args: {
    event: v.any()
  },
  handler: async (ctx, args) => {
    const slack = new SlackClient(process.env.SLACK_BOT_TOKEN);

    // Process message with AI
    if (args.event.type === "message") {
      const response = await ctx.runAction(api.ai.executeTask, {
        agentId: "default-agent", // Replace with agent selection logic
        prompt: args.event.text,
        capabilities: ["text-generation"]
      });

      // Send response back to Slack
      await slack.chat.postMessage({
        channel: args.event.channel,
        text: response.choices[0].message.content
      });
    }
  }
});