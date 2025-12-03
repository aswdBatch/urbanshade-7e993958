import { useState, useEffect, useRef } from "react";
import { X, Bug, AlertTriangle, Info, CheckCircle, Trash2, Download, Copy } from "lucide-react";

interface LogEntry {
  id: number;
  type: "info" | "warn" | "error" | "success" | "debug";
  timestamp: Date;
  message: string;
  simplified?: string;
  raw?: string;
}

interface DevModeConsoleProps {
  onClose: () => void;
}

// Simplify error messages for non-programmers
const simplifyError = (message: string): string => {
  // Common patterns and their simple explanations
  const simplifications: [RegExp, string][] = [
    [/cannot read propert(y|ies) of (undefined|null)/i, "Something tried to use data that doesn't exist yet"],
    [/is not a function/i, "The system tried to run something that isn't runnable"],
    [/is not defined/i, "The system is looking for something that doesn't exist"],
    [/syntax error/i, "There's a typo or formatting problem"],
    [/network error|failed to fetch/i, "Couldn't connect to the internet or server"],
    [/timeout/i, "The operation took too long and was stopped"],
    [/permission denied|unauthorized/i, "You don't have permission to do this"],
    [/out of memory/i, "The system ran out of memory"],
    [/maximum call stack/i, "The system got stuck in a loop"],
    [/unexpected token/i, "The system found something it didn't expect"],
    [/failed to load/i, "Couldn't load a required file"],
    [/cors|cross-origin/i, "Security blocked a connection to another website"],
    [/null|undefined/i, "Missing or empty data"],
  ];

  for (const [pattern, simple] of simplifications) {
    if (pattern.test(message)) {
      return simple;
    }
  }

  // If no pattern matches, return a generic simplification
  if (message.length > 100) {
    return "An unexpected error occurred";
  }
  return message;
};

export const DevModeConsole = ({ onClose }: DevModeConsoleProps) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<"all" | "error" | "warn" | "info">("all");
  const [showSimplified, setShowSimplified] = useState(true);
  const logIdRef = useRef(0);
  const logsEndRef = useRef<HTMLDivElement>(null);

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
      
      const newLog: LogEntry = {
        id: logIdRef.current++,
        type,
        timestamp: new Date(),
        message,
        simplified: type === "error" ? simplifyError(message) : undefined,
        raw: message,
      };

      setLogs(prev => [...prev.slice(-200), newLog]); // Keep last 200 logs
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
      addLog("error", `Crash: ${event.message} at ${event.filename}:${event.lineno}`);
    };

    // Unhandled promise rejection handler
    const handleRejection = (event: PromiseRejectionEvent) => {
      addLog("error", `Async Error: ${event.reason}`);
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    // Add initial system log
    addLog("success", "Dev Mode activated - monitoring system events");

    return () => {
      // Restore original console
      console.log = originalConsole.log;
      console.warn = originalConsole.warn;
      console.error = originalConsole.error;
      console.info = originalConsole.info;
      console.debug = originalConsole.debug;
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const getIcon = (type: LogEntry["type"]) => {
    switch (type) {
      case "error": return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case "warn": return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case "success": return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "debug": return <Bug className="w-4 h-4 text-purple-400" />;
      default: return <Info className="w-4 h-4 text-cyan-400" />;
    }
  };

  const getTypeColor = (type: LogEntry["type"]) => {
    switch (type) {
      case "error": return "bg-red-500/10 border-red-500/30 text-red-300";
      case "warn": return "bg-amber-500/10 border-amber-500/30 text-amber-300";
      case "success": return "bg-green-500/10 border-green-500/30 text-green-300";
      case "debug": return "bg-purple-500/10 border-purple-500/30 text-purple-300";
      default: return "bg-cyan-500/10 border-cyan-500/30 text-cyan-300";
    }
  };

  const filteredLogs = logs.filter(log => {
    if (filter === "all") return true;
    return log.type === filter;
  });

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
    <div className="fixed inset-0 bg-slate-950 text-white font-mono flex flex-col z-50">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-700 p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bug className="w-5 h-5 text-cyan-400" />
          <span className="font-bold text-cyan-400">Developer Console</span>
          <span className="text-xs text-slate-500">| Monitoring system events</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSimplified(!showSimplified)}
            className={`px-3 py-1 rounded text-xs ${showSimplified ? "bg-cyan-500/20 text-cyan-400" : "bg-slate-800 text-slate-400"}`}
          >
            {showSimplified ? "Simple Mode" : "Technical Mode"}
          </button>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-slate-900/50 border-b border-slate-800 p-2 flex items-center gap-2">
        <div className="flex gap-1">
          {(["all", "error", "warn", "info"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded text-xs capitalize ${
                filter === f 
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" 
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              {f} {f !== "all" && `(${logs.filter(l => l.type === f).length})`}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <button onClick={copyLogs} className="p-2 hover:bg-slate-800 rounded" title="Copy logs">
          <Copy className="w-4 h-4 text-slate-400" />
        </button>
        <button onClick={exportLogs} className="p-2 hover:bg-slate-800 rounded" title="Export logs">
          <Download className="w-4 h-4 text-slate-400" />
        </button>
        <button onClick={() => setLogs([])} className="p-2 hover:bg-slate-800 rounded" title="Clear logs">
          <Trash2 className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Help Banner */}
      <div className="bg-slate-800/50 border-b border-slate-700 p-3 text-xs text-slate-400">
        <strong className="text-cyan-400">What is this?</strong> This console shows system events and errors in real-time. 
        {showSimplified 
          ? " Errors are simplified for easier understanding."
          : " Showing full technical details."
        }
      </div>

      {/* Logs */}
      <div className="flex-1 overflow-auto p-3 space-y-2">
        {filteredLogs.length === 0 ? (
          <div className="text-center text-slate-500 py-8">
            No logs to display. System events will appear here.
          </div>
        ) : (
          filteredLogs.map(log => (
            <div key={log.id} className={`p-3 rounded border ${getTypeColor(log.type)}`}>
              <div className="flex items-start gap-2">
                {getIcon(log.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-slate-500">
                      {log.timestamp.toLocaleTimeString()}
                    </span>
                    <span className={`text-xs px-1.5 py-0.5 rounded uppercase font-bold ${
                      log.type === "error" ? "bg-red-500/30 text-red-400" :
                      log.type === "warn" ? "bg-amber-500/30 text-amber-400" :
                      log.type === "success" ? "bg-green-500/30 text-green-400" :
                      "bg-cyan-500/30 text-cyan-400"
                    }`}>
                      {log.type}
                    </span>
                  </div>
                  
                  {showSimplified && log.type === "error" && log.simplified ? (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">
                        ⚠️ {log.simplified}
                      </div>
                      <details className="text-xs">
                        <summary className="cursor-pointer text-slate-500 hover:text-slate-300">
                          Show technical details
                        </summary>
                        <pre className="mt-2 p-2 bg-black/30 rounded overflow-x-auto whitespace-pre-wrap text-slate-400">
                          {log.raw}
                        </pre>
                      </details>
                    </div>
                  ) : (
                    <pre className="text-sm whitespace-pre-wrap break-words">
                      {log.message}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>

      {/* Footer */}
      <div className="bg-slate-900 border-t border-slate-700 p-2 text-xs text-slate-500 flex items-center justify-between">
        <span>{logs.length} events captured</span>
        <span>Errors: {logs.filter(l => l.type === "error").length} | Warnings: {logs.filter(l => l.type === "warn").length}</span>
      </div>
    </div>
  );
};
