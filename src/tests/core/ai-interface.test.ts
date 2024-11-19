import { expect, test, describe } from 'vitest';
import { AIRequestSchema, AIResponseSchema, AICapability } from '../../core/ai-interface';

describe('AI Interface Schemas', () => {
  test('validates correct AI request', () => {
    const validRequest = {
      prompt: 'Test prompt',
      capabilities: [AICapability.TEXT_GENERATION],
      temperature: 0.7,
      maxTokens: 100
    };

    expect(() => AIRequestSchema.parse(validRequest)).not.toThrow();
  });

  test('validates correct AI response', () => {
    const validResponse = {
      content: 'Test response',
      metadata: { model: 'test-model' },
      usage: {
        promptTokens: 10,
        completionTokens: 20,
        totalTokens: 30
      },
      capabilities: [AICapability.TEXT_GENERATION]
    };

    expect(() => AIResponseSchema.parse(validResponse)).not.toThrow();
  });

  test('rejects invalid temperature', () => {
    const invalidRequest = {
      prompt: 'Test prompt',
      capabilities: [AICapability.TEXT_GENERATION],
      temperature: 3.0
    };

    expect(() => AIRequestSchema.parse(invalidRequest)).toThrow();
  });
});