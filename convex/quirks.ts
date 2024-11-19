import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { QuirkSchema } from "../src/core/quirks/adapter";

export const create = mutation({
  args: {
    personaId: v.string(),
    quirk: QuirkSchema
  },
  handler: async (ctx, args) => {
    const { personaId, quirk } = args;
    return await ctx.db.insert("quirks", {
      personaId,
      ...quirk,
      createdAt: Date.now()
    });
  }
});

export const list = query({
  args: {
    personaId: v.string()
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("quirks")
      .filter(q => q.eq(q.field("personaId"), args.personaId))
      .collect();
  }
});

export const update = mutation({
  args: {
    personaId: v.string(),
    quirkId: v.string(),
    updates: v.object(QuirkSchema.partial())
  },
  handler: async (ctx, args) => {
    const { personaId, quirkId, updates } = args;
    return await ctx.db.patch(quirkId, updates);
  }
});