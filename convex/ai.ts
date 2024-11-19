import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import OpenAI from "openai";
import { Client as NotionClient } from "@notionhq/client";
import { WebClient as SlackClient } from "@slack/web-api";

export const executeTask = action({
  args: {
    agentId: v.id("agents"),
    prompt: v.string(),
    capabilities: v.array(v.string())
  },
  handler: async (ctx, args) => {
    const agent = await ctx.runQuery(api.agents.get, { id: args.agentId });
    if (!agent) throw new Error("Agent not found");

    // Create task record
    const taskId = await ctx.runMutation(api.tasks.create, {
      agentId: args.agentId,
      request: {
        prompt: args.prompt,
        capabilities: args.capabilities
      }
    });

    // Execute based on provider
    let response;
    switch (agent.provider) {
      case "openai":
        const openai = new OpenAI(process.env.OPENAI_API_KEY);
        response = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [{ role: "user", content: args.prompt }]
        });
        break;
      // Add other providers
    }

    // Update task with response
    await ctx.runMutation(api.tasks.update, {
      id: taskId,
      response: {
        content: response.choices[0].message.content,
        metadata: { model: response.model },
        usage: response.usage
      }
    });

    return response;
  }
});

export const updateAgentMemory = mutation({
  args: {
    agentId: v.id("agents"),
    memory: v.object({
      type: v.string(),
      content: v.string()
    })
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.agentId);
    if (!agent) throw new Error("Agent not found");

    return await ctx.db.patch(args.agentId, {
      memory: [...agent.memory, {
        ...args.memory,
        timestamp: Date.now()
      }]
    });
  }
});