import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

const crons = cronJobs();

// Health check every 5 minutes
crons.interval(
  "healthCheck",
  { minutes: 5 },
  async (ctx) => {
    await ctx.runAction(api.system.healthCheck, {});
  }
);

// Daily backup at midnight
crons.cron(
  "dailyBackup",
  { expression: "0 0 * * *" },
  async (ctx) => {
    await ctx.runAction(api.system.backup, {});
  }
);

// Weekly optimization
crons.cron(
  "weeklyOptimization",
  { expression: "0 0 * * 0" },
  async (ctx) => {
    await ctx.runAction(api.system.optimize, {});
  }
);

export default crons;