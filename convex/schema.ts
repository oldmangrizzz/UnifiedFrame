import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  agents: defineTable({
    name: v.string(),
    provider: v.string(),
    capabilities: v.array(v.string()),
    metadata: v.object({
      model: v.optional(v.string()),
      temperature: v.optional(v.number()),
      maxTokens: v.optional(v.number())
    }),
    memory: v.array(v.object({
      timestamp: v.number(),
      type: v.string(),
      content: v.string()
    }))
  }),

  tasks: defineTable({
    agentId: v.id("agents"),
    type: v.string(),
    status: v.string(),
    priority: v.number(),
    request: v.object({
      prompt: v.string(),
      context: v.optional(v.any()),
      capabilities: v.array(v.string())
    }),
    response: v.optional(v.object({
      content: v.string(),
      metadata: v.any(),
      usage: v.object({
        promptTokens: v.number(),
        completionTokens: v.number(),
        totalTokens: v.number()
      })
    })),
    createdAt: v.number(),
    completedAt: v.optional(v.number())
  }),

  integrations: defineTable({
    type: v.string(),
    config: v.object({
      apiKey: v.string(),
      webhookUrl: v.optional(v.string()),
      additionalConfig: v.optional(v.any())
    }),
    status: v.string(),
    lastSync: v.optional(v.number())
  }),

  knowledge: defineTable({
    source: v.string(),
    type: v.string(),
    content: v.string(),
    embedding: v.array(v.number()),
    metadata: v.any(),
    updatedAt: v.number()
  })
});