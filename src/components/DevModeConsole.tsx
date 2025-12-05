import { useState, useEffect, useRef } from "react";
import { 
  X, Bug, AlertTriangle, Info, CheckCircle, Trash2, Download, Copy, 
  Search, Filter, Terminal, Cpu, HardDrive, Activity, RefreshCw,
  ChevronDown, ChevronRight, Layers, Zap
} from "lucide-react";

interface LogEntry {
  id: number;
  type: "info" | "warn" | "error" | "success" | "debug";
  timestamp: Date;
  message: string;
  simplified?: string;
  raw?: string;
  category?: string;
}

interface DevModeConsoleProps {
  onClose: () => void;
}

// Simplify error messages for non-programmers
const simplifyError = (message: string): { simple: string; category: string } => {
  const simplifications: [RegExp, string, string][] = [
    [/cannot read propert(y|ies) of (undefined|null)/i, "Something tried to use data that doesn't exist yet", "Data Error"],
    [/is not a function/i, "The system tried to run something that isn't runnable", "Code Error"],
    [/is not defined/i, "The system is looking for something that doesn't exist", "Missing Reference"],
    [/syntax error/i, "There's a typo or formatting problem in the code", "Syntax Error"],
    [/network error|failed to fetch/i, "Couldn't connect to the internet or server", "Network"],
    [/timeout/i, "The operation took too long and was stopped", "Timeout"],
    [/permission denied|unauthorized/i, "You don't have permission to do this", "Permission"],
    [/out of memory/i, "The system ran out of memory", "Memory"],
    [/maximum call stack/i, "The system got stuck in a loop", "Infinite Loop"],
    [/unexpected token/i, "The system found something it didn't expect", "Parse Error"],
    [/failed to load/i, "Couldn't load a required file", "Load Error"],
    [/cors|cross-origin/i, "Security blocked a connection to another website", "Security"],
    [/localstorage/i, "Problem accessing saved data", "Storage"],
    [/quota exceeded/i, "Storage is full - too much data saved", "Storage Full"],
  ];

  for (const [pattern, simple, category] of simplifications) {
    if (pattern.test(message)) {
      return { simple, category };
    }
  }

  return { 
    simple: message.length > 100 ? "An unexpected error occurred" : message,
    category: "General"
  };
};

export const DevModeConsole = ({ onClose }: DevModeConsoleProps) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<"all" | "error" | "warn" | "info">("all");
  const [showSimplified, setShowSimplified] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedLogs, setExpandedLogs] = useState<Set<number>>(new Set());
  const [isPaused, setIsPaused] = useState(false);
  const [stats, setStats] = useState({ errors: 0, warnings: 0, total: 0 });
  const logIdRef = useRef(0);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const pausedLogsRef = useRef<LogEntry[]>([]);

  useEffect(() => {
    // Store original console methods
    const originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info,
      debug: console.debug,
    };

    const addLog = (type: LogEntry["type"], ...args: any[]) => {
      const message = args.map(arg => 
        typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(" ");
      
      const errorInfo = type === "error" || type === "warn" ? simplifyError(message) : { simple: undefined, category: undefined };
      
      const newLog: LogEntry = {
        id: logIdRef.current++,
        type,
        timestamp: new Date(),
        message,
        simplified: errorInfo.simple,
        category: errorInfo.category,
        raw: message,
      };

      if (isPaused) {
        pausedLogsRef.current.push(newLog);
      } else {
        setLogs(prev => [...prev.slice(-300), newLog]);
      }
    };

    // Override console methods
    console.log = (...args) => {
      originalConsole.log(...args);
      addLog("info", ...args);
    };
    console.warn = (...args) => {
      originalConsole.warn(...args);
      addLog("warn", ...args);
    };
    console.error = (...args) => {
      originalConsole.error(...args);
      addLog("error", ...args);
    };
    console.info = (...args) => {
      originalConsole.info(...args);
      addLog("info", ...args);
    };
    console.debug = (...args) => {
      originalConsole.debug(...args);
      addLog("debug", ...args);
    };

    // Global error handler
    const handleError = (event: ErrorEvent) => {
      addLog("error", `💥 CRASH: ${event.message}\n📍 Location: ${event.filename}:${event.lineno}:${event.colno}`);
    };

    // Unhandled promise rejection handler
    const handleRejection = (event: PromiseRejectionEvent) => {
      addLog("error", `⚠️ Async Error: ${event.reason}`);
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    // Add initial system log
    addLog("success", "✓ Dev Mode Console initialized - monitoring all system events");

    return () => {
      console.log = originalConsole.log;
      console.warn = originalConsole.warn;
      console.error = originalConsole.error;
      console.info = originalConsole.info;
      console.debug = originalConsole.debug;
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, [isPaused]);

  // Update stats
  useEffect(() => {
    setStats({
      errors: logs.filter(l => l.type === "error").length,
      warnings: logs.filter(l => l.type === "warn").length,
      total: logs.length
    });
  }, [logs]);

  // Auto-scroll
  useEffect(() => {
    if (!isPaused) {
      logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, isPaused]);

  // Resume and add paused logs
  const handleResume = () => {
    setIsPaused(false);
    if (pausedLogsRef.current.length > 0) {
      setLogs(prev => [...prev, ...pausedLogsRef.current].slice(-300));
      pausedLogsRef.current = [];
    }
  };

  const getIcon = (type: LogEntry["type"]) => {
    switch (type) {
      case "error": return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case "warn": return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case "success": return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "debug": return <Bug className="w-4 h-4 text-purple-400" />;
      default: return <Info className="w-4 h-4 text-cyan-400" />;
    }
  };

  const getTypeStyles = (type: LogEntry["type"]) => {
    switch (type) {
      case "error": return "bg-red-500/10 border-l-4 border-l-red-500 border-y border-r border-red-500/20";
      case "warn": return "bg-amber-500/10 border-l-4 border-l-amber-500 border-y border-r border-amber-500/20";
      case "success": return "bg-green-500/10 border-l-4 border-l-green-500 border-y border-r border-green-500/20";
      case "debug": return "bg-purple-500/10 border-l-4 border-l-purple-500 border-y border-r border-purple-500/20";
      default: return "bg-slate-800/50 border-l-4 border-l-cyan-500 border-y border-r border-slate-700/50";
    }
  };

  const filteredLogs = logs.filter(log => {
    if (filter !== "all" && log.type !== filter) return false;
    if (searchQuery && !log.message.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const toggleExpand = (id: number) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedLogs(newExpanded);
  };

  const exportLogs = () => {
    const content = logs.map(log => 
      `[${log.timestamp.toISOString()}] [${log.type.toUpperCase()}] ${log.message}`
    ).join("\n");
    
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `urbanshade_devlogs_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyLogs = () => {
    const content = logs.map(log => 
      `[${log.type.toUpperCase()}] ${log.message}`
    ).join("\n");
    navigator.clipboard.writeText(content);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white font-mono flex flex-col z-50">
      {/* Header */}
      <div className="bg-slate-900/80 border-b border-cyan-500/30 p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <Terminal className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h1 className="font-bold text-cyan-400 text-lg">Developer Console</h1>
                <p className="text-xs text-slate-500">Real-time system monitoring</p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="hidden md:flex items-center gap-3 ml-6 pl-6 border-l border-slate-700">
              <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 rounded-full">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs text-red-400">{stats.errors} errors</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 rounded-full">
                <div className="w-2 h-2 bg-amber-500 rounded-full" />
                <span className="text-xs text-amber-400">{stats.warnings} warnings</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-slate-700/50 rounded-full">
                <Activity className="w-3 h-3 text-slate-400" />
                <span className="text-xs text-slate-400">{stats.total} events</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSimplified(!showSimplified)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                showSimplified 
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" 
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              {showSimplified ? "🔍 Simple View" : "⚙️ Technical View"}
            </button>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-slate-900/50 border-b border-slate-800 p-3 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-1 bg-slate-800 p-1 rounded-lg">
          {(["all", "error", "warn", "info"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded text-xs capitalize transition-all ${
                filter === f 
                  ? f === "error" ? "bg-red-500/30 text-red-400" :
                    f === "warn" ? "bg-amber-500/30 text-amber-400" :
                    "bg-cyan-500/20 text-cyan-400"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {f === "all" ? "All" : f}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-1">
          <button
            onClick={() => isPaused ? handleResume() : setIsPaused(true)}
            className={`p-2 rounded-lg transition-colors ${
              isPaused ? "bg-green-500/20 text-green-400" : "bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
            title={isPaused ? "Resume" : "Pause"}
          >
            {isPaused ? <Zap className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
          </button>
          <button onClick={copyLogs} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors" title="Copy logs">
            <Copy className="w-4 h-4 text-slate-400" />
          </button>
          <button onClick={exportLogs} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors" title="Export logs">
            <Download className="w-4 h-4 text-slate-400" />
          </button>
          <button onClick={() => setLogs([])} className="p-2 bg-slate-800 hover:bg-red-500/20 rounded-lg transition-colors" title="Clear logs">
            <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-400" />
          </button>
        </div>
      </div>

      {/* Pause Banner */}
      {isPaused && (
        <div className="bg-amber-500/20 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between">
          <span className="text-sm text-amber-400">
            ⏸️ Logging paused - {pausedLogsRef.current.length} events queued
          </span>
          <button 
            onClick={handleResume}
            className="px-3 py-1 bg-amber-500/30 hover:bg-amber-500/40 rounded text-xs text-amber-300 transition-colors"
          >
            Resume
          </button>
        </div>
      )}

      {/* Help Banner */}
      {showSimplified && (
        <div className="bg-cyan-500/10 border-b border-cyan-500/20 p-3">
          <div className="flex items-start gap-3 max-w-4xl">
            <Info className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-cyan-200/80">
              <strong className="text-cyan-400">Simple Mode Active</strong> — Error messages are automatically 
              simplified to be easier to understand. Click on any log entry to see the full technical details.
            </div>
          </div>
        </div>
      )}

      {/* Logs */}
      <div className="flex-1 overflow-auto p-4 space-y-2">
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4">
            <Terminal className="w-12 h-12 opacity-50" />
            <div className="text-center">
              <p className="font-medium">No logs to display</p>
              <p className="text-sm opacity-70">System events will appear here in real-time</p>
            </div>
          </div>
        ) : (
          filteredLogs.map(log => {
            const isExpanded = expandedLogs.has(log.id);
            const hasDetails = log.type === "error" || log.type === "warn";
            
            return (
              <div 
                key={log.id} 
                className={`rounded-lg overflow-hidden transition-all ${getTypeStyles(log.type)}`}
              >
                <div 
                  className={`p-3 ${hasDetails ? "cursor-pointer hover:bg-white/5" : ""}`}
                  onClick={() => hasDetails && toggleExpand(log.id)}
                >
                  <div className="flex items-start gap-3">
                    {hasDetails && (
                      <div className="mt-1">
                        {isExpanded ? (
                          <ChevronDown className="w-3 h-3 text-slate-500" />
                        ) : (
                          <ChevronRight className="w-3 h-3 text-slate-500" />
                        )}
                      </div>
                    )}
                    {getIcon(log.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <span className="text-xs text-slate-500 font-mono">
                          {log.timestamp.toLocaleTimeString()}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full uppercase font-bold ${
                          log.type === "error" ? "bg-red-500/30 text-red-400" :
                          log.type === "warn" ? "bg-amber-500/30 text-amber-400" :
                          log.type === "success" ? "bg-green-500/30 text-green-400" :
                          log.type === "debug" ? "bg-purple-500/30 text-purple-400" :
                          "bg-cyan-500/30 text-cyan-400"
                        }`}>
                          {log.type}
                        </span>
                        {log.category && (
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-700/50 text-slate-400">
                            {log.category}
                          </span>
                        )}
                      </div>
                      
                      {showSimplified && log.simplified && (log.type === "error" || log.type === "warn") ? (
                        <div className="text-sm font-medium">
                          {log.type === "error" ? "❌" : "⚠️"} {log.simplified}
                        </div>
                      ) : (
                        <pre className="text-sm whitespace-pre-wrap break-words text-slate-300">
                          {log.message}
                        </pre>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Technical Details */}
                {isExpanded && hasDetails && (
                  <div className="px-4 pb-3 pt-2 border-t border-white/5 bg-black/20">
                    <div className="text-xs text-slate-500 uppercase mb-2 font-semibold">
                      Technical Details
                    </div>
                    <pre className="p-3 bg-black/40 rounded-lg overflow-x-auto whitespace-pre-wrap text-xs text-slate-400 font-mono">
                      {log.raw}
                    </pre>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(log.raw || log.message);
                      }}
                      className="mt-2 px-3 py-1 bg-slate-700/50 hover:bg-slate-700 rounded text-xs text-slate-400 transition-colors"
                    >
                      Copy raw message
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={logsEndRef} />
      </div>

      {/* Footer */}
      <div className="bg-slate-900 border-t border-slate-700 p-3 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2">
            <Layers className="w-3 h-3" />
            {filteredLogs.length} / {logs.length} events
          </span>
          <span className="flex items-center gap-2">
            <Cpu className="w-3 h-3" />
            {typeof (performance as any).memory?.usedJSHeapSize === 'number' 
              ? `${Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024)}MB` 
              : 'N/A'}
          </span>
        </div>
        <span>Press ESC or click X to close</span>
      </div>
    </div>
  );
};