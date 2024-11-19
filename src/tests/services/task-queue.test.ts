import { expect, test, describe, vi } from 'vitest';
import { TaskQueue } from '../../services/task-queue';
import { Agent } from '../../core/agent-manager';
import { AICapability } from '../../core/ai-interface';

describe('Task Queue', () => {
  test('processes task successfully', async () => {
    const taskQueue = new TaskQueue();
    const mockAgent = {
      id: 'test-agent',
      execute: vi.fn().mockResolvedValue({
        content: 'Test response',
        metadata: {},
        usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
        capabilities: [AICapability.TEXT_GENERATION]
      })
    } as unknown as Agent;

    const request = {
      prompt: 'Test prompt',
      capabilities: [AICapability.TEXT_GENERATION]
    };

    const response = await taskQueue.addTask(mockAgent, request);
    expect(response).toBeDefined();
    expect(response.content).toBe('Test response');
    expect(mockAgent.execute).toHaveBeenCalledWith(request);
  });

  test('handles task failure', async () => {
    const taskQueue = new TaskQueue();
    const mockAgent = {
      id: 'test-agent',
      execute: vi.fn().mockRejectedValue(new Error('Test error'))
    } as unknown as Agent;

    const request = {
      prompt: 'Test prompt',
      capabilities: [AICapability.TEXT_GENERATION]
    };

    await expect(taskQueue.addTask(mockAgent, request)).rejects.toThrow('Test error');
  });
});