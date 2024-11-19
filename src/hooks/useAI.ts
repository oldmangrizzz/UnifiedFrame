import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useAI() {
  const executeTask = useMutation(api.ai.executeTask);
  const agentMemory = useQuery(api.agents.getMemory);

  return {
    executeTask,
    agentMemory
  };
}