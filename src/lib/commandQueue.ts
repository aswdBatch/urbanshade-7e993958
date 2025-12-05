// Command Queue System for DEF-DEV
// Allows queuing commands from DEF-DEV that the main OS page executes

export type CommandType = 
  | "CRASH" 
  | "BUGCHECK" 
  | "REBOOT" 
  | "SHUTDOWN" 
  | "LOCKDOWN"
  | "RECOVERY"
  | "WIPE"
  | "WRITE_STORAGE"
  | "DELETE_STORAGE"
  | "EXEC_TERMINAL"
  | "TOAST"
  | "CUSTOM";

export interface QueuedCommand {
  id: string;
  type: CommandType;
  payload: Record<string, any>;
  timestamp: string;
  executed?: boolean;
  source: string;
}

const QUEUE_KEY = 'urbanshade_command_queue';
const PERSISTENCE_KEY = 'def_dev_persistence_enabled';

class CommandQueue {
  private pollInterval: number | null = null;
  private listeners: Map<CommandType, Set<(cmd: QueuedCommand) => void>> = new Map();
  private globalListeners: Set<(cmd: QueuedCommand) => void> = new Set();

  // Generate unique ID
  private generateId(): string {
    return `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Queue a command
  queue(type: CommandType, payload: Record<string, any> = {}, source: string = 'def-dev'): string {
    const commands = this.getQueue();
    const id = this.generateId();
    const cmd: QueuedCommand = {
      id,
      type,
      payload,
      timestamp: new Date().toISOString(),
      source,
    };
    commands.push(cmd);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(commands));
    return id;
  }

  // Get all queued commands
  getQueue(): QueuedCommand[] {
    try {
      const stored = localStorage.getItem(QUEUE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // Get and clear next command (FIFO)
  dequeue(): QueuedCommand | null {
    const commands = this.getQueue();
    if (commands.length === 0) return null;
    
    const cmd = commands.shift()!;
    localStorage.setItem(QUEUE_KEY, JSON.stringify(commands));
    return cmd;
  }

  // Clear specific command by ID
  remove(id: string): boolean {
    const commands = this.getQueue();
    const filtered = commands.filter(c => c.id !== id);
    if (filtered.length !== commands.length) {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
      return true;
    }
    return false;
  }

  // Clear all commands
  clear(): void {
    localStorage.removeItem(QUEUE_KEY);
  }

  // Subscribe to specific command type
  on(type: CommandType, callback: (cmd: QueuedCommand) => void): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(callback);
    return () => this.listeners.get(type)?.delete(callback);
  }

  // Subscribe to all commands
  onAny(callback: (cmd: QueuedCommand) => void): () => void {
    this.globalListeners.add(callback);
    return () => this.globalListeners.delete(callback);
  }

  // Process a command and notify listeners
  private processCommand(cmd: QueuedCommand): void {
    // Notify specific listeners
    this.listeners.get(cmd.type)?.forEach(cb => cb(cmd));
    // Notify global listeners
    this.globalListeners.forEach(cb => cb(cmd));
  }

  // Start polling for commands (call from main page)
  startPolling(intervalMs: number = 250): void {
    if (this.pollInterval) return;
    
    this.pollInterval = window.setInterval(() => {
      const cmd = this.dequeue();
      if (cmd) {
        this.processCommand(cmd);
      }
    }, intervalMs);
  }

  // Stop polling
  stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  // Check if polling is active
  isPolling(): boolean {
    return this.pollInterval !== null;
  }

  // === Persistence System ===
  
  isPersistenceEnabled(): boolean {
    return localStorage.getItem(PERSISTENCE_KEY) === 'true';
  }

  setPersistence(enabled: boolean): void {
    localStorage.setItem(PERSISTENCE_KEY, enabled ? 'true' : 'false');
  }

  // === Convenience methods for common commands ===

  queueCrash(crashType: string, process: string = 'system.exe'): string {
    return this.queue('CRASH', { type: crashType, process });
  }

  queueBugcheck(code: string, description: string): string {
    return this.queue('BUGCHECK', { code, description });
  }

  queueReboot(): string {
    return this.queue('REBOOT', {});
  }

  queueShutdown(): string {
    return this.queue('SHUTDOWN', {});
  }

  queueLockdown(protocol: string): string {
    return this.queue('LOCKDOWN', { protocol });
  }

  queueRecovery(): string {
    return this.queue('RECOVERY', {});
  }

  queueWipe(): string {
    return this.queue('WIPE', {});
  }

  queueStorageWrite(key: string, value: string): string {
    return this.queue('WRITE_STORAGE', { key, value });
  }

  queueStorageDelete(key: string): string {
    return this.queue('DELETE_STORAGE', { key });
  }

  queueTerminalCommand(command: string): string {
    return this.queue('EXEC_TERMINAL', { command });
  }

  queueToast(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info'): string {
    return this.queue('TOAST', { message, type });
  }

  queueCustom(action: string, data: Record<string, any> = {}): string {
    return this.queue('CUSTOM', { action, ...data });
  }
}

// Singleton
export const commandQueue = new CommandQueue();

// Terminal command parser
export interface TerminalResult {
  output: string;
  success: boolean;
  type: 'output' | 'error' | 'info' | 'system';
}

export const parseTerminalCommand = (input: string): { command: string; args: string[] } => {
  const parts = input.trim().split(/\s+/);
  return {
    command: parts[0]?.toLowerCase() || '',
    args: parts.slice(1)
  };
};

export const TERMINAL_COMMANDS: Record<string, { desc: string; usage: string }> = {
  help: { desc: 'Show available commands', usage: 'help [command]' },
  crash: { desc: 'Trigger a crash screen', usage: 'crash <type>' },
  bugcheck: { desc: 'Trigger a bugcheck', usage: 'bugcheck <code> [message]' },
  reboot: { desc: 'Reboot the system', usage: 'reboot' },
  shutdown: { desc: 'Shutdown the system', usage: 'shutdown' },
  lockdown: { desc: 'Trigger lockdown protocol', usage: 'lockdown <protocol>' },
  recovery: { desc: 'Enter recovery mode', usage: 'recovery' },
  wipe: { desc: 'Wipe all system data', usage: 'wipe --confirm' },
  echo: { desc: 'Print text to terminal', usage: 'echo <text>' },
  clear: { desc: 'Clear terminal output', usage: 'clear' },
  ls: { desc: 'List localStorage keys', usage: 'ls [filter]' },
  get: { desc: 'Get localStorage value', usage: 'get <key>' },
  set: { desc: 'Set localStorage value', usage: 'set <key> <value>' },
  del: { desc: 'Delete localStorage key', usage: 'del <key>' },
  toast: { desc: 'Show a toast notification', usage: 'toast <type> <message>' },
  status: { desc: 'Show system status', usage: 'status' },
  queue: { desc: 'Show command queue', usage: 'queue' },
  exec: { desc: 'Execute queued command on OS', usage: 'exec <command>' },
};
