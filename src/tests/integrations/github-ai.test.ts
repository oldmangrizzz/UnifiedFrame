import { expect, test, describe, vi } from 'vitest';
import { GitHubAIProvider } from '../../integrations/ai/github';
import { AICapability } from '../../core/ai-interface';

describe('GitHub AI Provider', () => {
  test('supports expected capabilities', () => {
    const provider = new GitHubAIProvider();
    const capabilities = provider.supportedCapabilities;
    
    expect(capabilities.has(AICapability.TEXT_GENERATION)).toBe(true);
    expect(capabilities.has(AICapability.CODE_GENERATION)).toBe(true);
    expect(capabilities.has(AICapability.CHAT)).toBe(true);
    expect(capabilities.has(AICapability.FUNCTION_CALLING)).toBe(true);
  });

  test('generates completion successfully', async () => {
    const provider = new GitHubAIProvider();
    const mockResponse = {
      data: {
        choices: [{ text: 'Test response', finish_reason: 'stop' }],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 20,
          total_tokens: 30
        }
      }
    };

    // Mock Octokit request
    vi.spyOn(provider['octokit'], 'request').mockResolvedValue(mockResponse);

    const response = await provider.generate({
      prompt: 'Test prompt',
      capabilities: [AICapability.TEXT_GENERATION]
    });

    expect(response.content).toBe('Test response');
    expect(response.metadata.provider).toBe('github');
    expect(response.usage.totalTokens).toBe(30);
  });
});