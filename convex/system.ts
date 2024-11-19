import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { internal } from "./_generated/api";

export const healthCheck = action({
  handler: async (ctx) => {
    const checks = [
      ctx.runQuery(api.agents.list),
      ctx.runQuery(api.tasks.getPending),
      ctx.runQuery(api.integrations.getStatus)
    ];

    try {
      await Promise.all(checks);
      return { status: "healthy" };
    } catch (error) {
      return { status: "unhealthy", error };
    }
  }
});

export const backup = action({
  handler: async (ctx) => {
    const timestamp = new Date().toISOString();
    const data = {
      agents: await ctx.runQuery(api.agents.list),
      tasks: await ctx.runQuery(api.tasks.list),
      identities: await ctx.runQuery(api.identities.list)
    };

    await ctx.runMutation(internal.backups.create, {
      timestamp,
      data
    });

    return { status: "success", timestamp };
  }
});

export const optimize = action({
  handler: async (ctx) => {
    // Clean up old tasks
    await ctx.runMutation(api.tasks.cleanup);
    
    // Optimize indexes
    await ctx.runMutation(internal.system.optimizeIndexes);
    
    return { status: "success" };
  }
});