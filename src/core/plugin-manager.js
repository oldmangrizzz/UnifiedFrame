import { EventEmitter } from 'events';
import { logger } from '../utils/logger.js';

class PluginManager extends EventEmitter {
  constructor() {
    super();
    this.plugins = new Map();
    this.hooks = new Map();
  }

  registerPlugin(name, plugin) {
    if (this.plugins.has(name)) {
      throw new Error(`Plugin ${name} already registered`);
    }
    this.plugins.set(name, plugin);
    logger.info(`Plugin ${name} registered`);
  }

  registerHook(event, callback) {
    if (!this.hooks.has(event)) {
      this.hooks.set(event, []);
    }
    this.hooks.get(event).push(callback);
  }

  async executeHook(event, data) {
    if (!this.hooks.has(event)) return data;
    
    const hooks = this.hooks.get(event);
    let result = data;
    
    for (const hook of hooks) {
      try {
        result = await hook(result);
      } catch (error) {
        logger.error(`Hook execution error for ${event}:`, error);
      }
    }
    
    return result;
  }
}

export const pluginManager = new PluginManager();