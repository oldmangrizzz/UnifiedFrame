import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Ensure all schemas are properly defined for Convex
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
  }).index("by_provider", ["provider"]),

  tasks: defineTable({
    agentId: v.id("agents"),
    status: v.string(),
    priority: v.number(),
    request: v.object({
      prompt: v.string(),
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
    createdAt: v.number()
  }).index("by_status", ["status"]),

  identities: defineTable({
    name: v.string(),
    systemPrompt: v.string(),
    metadata: v.object({
      version: v.string(),
      lastUpdated: v.string(),
      author: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
      model: v.optional(v.string())
    })
  })
});