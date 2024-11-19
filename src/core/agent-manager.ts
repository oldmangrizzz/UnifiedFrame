import { EventEmitter } from 'events';
import { AIInterface, AIRequest, AIResponse } from './ai-interface';
import { TaskQueue } from '../services/task-queue';
import { logger } from '../utils/logger';

export class Agent {
  constructor(
    public id: string,
    public name: string,
    public provider: AIInterface,
    public capabilities: Set<string>,
    public metadata: Record<string, any> = {}
  ) {}

  async execute(request: AIRequest): Promise<AIResponse> {
    return await this.provider.generate(request);
  }
}

export class AgentManager extends EventEmitter {
  private agents: Map<string, Agent> = new Map();
  private taskQueue: TaskQueue;

  constructor() {
    super();
    this.taskQueue = new TaskQueue();
  }

  registerAgent(agent: Agent) {
    this.agents.set(agent.id, agent);
    this.emit('agentRegistered', agent);
    logger.info(`Agent ${agent.name} (${agent.id}) registered`);
  }

  async executeTask(agentId: string, request: AIRequest): Promise<AIResponse> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    if (!await agent.provider.validate(request)) {
      throw new Error(`Agent ${agentId} does not support requested capabilities`);
    }

    return await this.taskQueue.addTask(agent, request);
  }

  async collaborativeExecute(request: AIRequest): Promise<AIResponse[]> {
    const capableAgents = Array.from(this.agents.values())
      .filter(agent => Array.from(request.capabilities)
        .every(cap => agent.capabilities.has(cap)));

    const tasks = capableAgents.map(agent => 
      this.taskQueue.addTask(agent, request)
    );

    return await Promise.all(tasks);
  }
}