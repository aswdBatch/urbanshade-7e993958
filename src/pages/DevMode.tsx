import { useState, useEffect, useRef } from "react";
import { Bug, AlertTriangle, Info, CheckCircle, Trash2, Download, Copy, Upload, Database, RefreshCw, HardDrive, FileText, X, Eye, EyeOff, Play, Terminal, Zap, Shield, Activity, ExternalLink, BookOpen, Skull, MonitorX, Cpu, MemoryStick, AlertOctagon, Power, Bomb, Send, Clock } from "lucide-react";
import { toast } from "sonner";
import { loadState } from "@/lib/persistence";
import { Link } from "react-router-dom";
import { actionDispatcher } from "@/lib/actionDispatcher";
import { commandQueue, parseTerminalCommand, TERMINAL_COMMANDS, TerminalResult } from "@/lib/commandQueue";

interface LogEntry {
  id: number;
  type: "info" | "warn" | "error" | "success" | "debug" | "system";
  timestamp: Date;
  message: string;
  simplified?: string;
  raw?: string;
  stack?: string;
}

interface ActionEntry {
  id: number;
  type: "SYSTEM" | "APP" | "FILE" | "USER" | "SECURITY" | "WINDOW";
  timestamp: Date;
  message: string;
}

interface RecoveryImage {
  name: string;
  data: Record<string, string>;
  created: string;
  size: number;
}

interface BugcheckEntry {
  code: string;
  description: string;
  timestamp: string;
  location?: string;
  systemInfo?: Record<string, string>;
}

const simplifyError = (message: string): string => {
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
  ];

  for (const [pattern, simple] of simplifications) {
    if (pattern.test(message)) return simple;
  }
  return message.length > 100 ? "An unexpected error occurred" : message;
};

interface CrashEntry {
  stopCode: string;
  process?: string;
  module?: string;
  timestamp: string;
}

const DevMode = () => {
  const [devModeEnabled, setDevModeEnabled] = useState(false);
  const [showWarning, setShowWarning] = useState(true);
  const [crashEntry, setCrashEntry] = useState<CrashEntry | null>(null);
  const [showCrashWarning, setShowCrashWarning] = useState(false);
  const [actionConsentChecked, setActionConsentChecked] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [actions, setActions] = useState<ActionEntry[]>([]);
  const [filter, setFilter] = useState<"all" | "error" | "warn" | "info" | "system">("all");
  const [actionFilter, setActionFilter] = useState<"ALL" | "SYSTEM" | "APP" | "FILE" | "USER" | "SECURITY" | "WINDOW">("ALL");
  const [showTechnical, setShowTechnical] = useState(true);
  const [selectedTab, setSelectedTab] = useState<"console" | "actions" | "terminal" | "storage" | "images" | "bugchecks" | "admin">("console");
  const [recoveryImages, setRecoveryImages] = useState<RecoveryImage[]>([]);
  const [bugchecks, setBugchecks] = useState<BugcheckEntry[]>([]);
  const [selectedImage, setSelectedImage] = useState<RecoveryImage | null>(null);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [storageSearch, setStorageSearch] = useState("");
  const [actionPersistenceEnabled, setActionPersistenceEnabled] = useState(false);
  // Terminal state
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalHistory, setTerminalHistory] = useState<{ input: string; output: TerminalResult }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const logIdRef = useRef(0);
  const actionIdRef = useRef(0);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const terminalInputRef = useRef<HTMLInputElement>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Check if coming from crash screen
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const fromCrash = urlParams.get('from') === 'crash';
    
    if (fromCrash) {
      // Load crash entry data
      const crashData = localStorage.getItem('urbanshade_crash_entry');
      if (crashData) {
        const parsed = JSON.parse(crashData);
        setCrashEntry(parsed);
        // Skip warning and go straight to bugchecks tab
        setShowWarning(false);
        setSelectedTab("bugchecks");
        // Add crash to bugchecks
        const existingBugchecks = JSON.parse(localStorage.getItem('urbanshade_bugchecks') || '[]');
        const newBugcheck: BugcheckEntry = {
          code: parsed.stopCode,
          description: `Crash from ${parsed.process || 'unknown process'}`,
          timestamp: parsed.timestamp,
          location: parsed.module,
          systemInfo: { source: 'crash_screen' }
        };
        const updated = [newBugcheck, ...existingBugchecks].slice(0, 50);
        localStorage.setItem('urbanshade_bugchecks', JSON.stringify(updated));
        setBugchecks(updated);
        // Clear crash entry
        localStorage.removeItem('urbanshade_crash_entry');
      }
      // Force dev mode for crash debugging
      setDevModeEnabled(true);
    }
  }, []);

  // Check if dev mode is enabled
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const fromCrash = urlParams.get('from') === 'crash';
    if (fromCrash) return; // Already handled above
    
    const devEnabled = loadState("settings_developer_mode", false) || loadState("urbanshade_dev_mode_install", false);
    setDevModeEnabled(devEnabled);
    
    // Check if action persistence consent exists
    const hasConsent = localStorage.getItem('def_dev_actions_consent') === 'true';
    setActionPersistenceEnabled(hasConsent);
    
    // Load recovery images
    const saved = localStorage.getItem('urbanshade_recovery_images_data');
    if (saved) setRecoveryImages(JSON.parse(saved));

    // Load bugchecks
    const bugcheckData = localStorage.getItem('urbanshade_bugchecks');
    if (bugcheckData) setBugchecks(JSON.parse(bugcheckData));
  }, []);

  // Console capture
  useEffect(() => {
    if (!devModeEnabled || showWarning) return;

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

      setLogs(prev => [...prev.slice(-500), newLog]);
    };

    const addAction = (type: ActionEntry["type"], message: string) => {
      const newAction: ActionEntry = {
        id: actionIdRef.current++,
        type,
        timestamp: new Date(),
        message
      };
      setActions(prev => [...prev.slice(-200), newAction]);
    };

    console.log = (...args) => { originalConsole.log(...args); addLog("info", ...args); };
    console.warn = (...args) => { originalConsole.warn(...args); addLog("warn", ...args); };
    console.error = (...args) => { originalConsole.error(...args); addLog("error", ...args); };
    console.info = (...args) => { originalConsole.info(...args); addLog("info", ...args); };
    console.debug = (...args) => { originalConsole.debug(...args); addLog("debug", ...args); };

    // Listen for custom action events
    const handleAction = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { type, message } = customEvent.detail || {};
      if (type && message) addAction(type, message);
    };

    const handleError = (event: ErrorEvent) => {
      addLog("error", `CRASH: ${event.message} at ${event.filename}:${event.lineno}`);
      addAction("SYSTEM", `Fatal error: ${event.message}`);
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      addLog("error", `ASYNC ERROR: ${event.reason}`);
      addAction("SYSTEM", `Unhandled rejection: ${event.reason}`);
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);
    window.addEventListener("defdev-action", handleAction);

    addLog("system", "DEF-DEV Console initialized - Capturing all system events");
    addLog("system", `LocalStorage: ${localStorage.length} entries, ${(JSON.stringify(localStorage).length / 1024).toFixed(1)} KB`);
    addAction("SYSTEM", "DEF-DEV Console initialized");

    return () => {
      console.log = originalConsole.log;
      console.warn = originalConsole.warn;
      console.error = originalConsole.error;
      console.info = originalConsole.info;
      console.debug = originalConsole.debug;
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
      window.removeEventListener("defdev-action", handleAction);
    };
  }, [devModeEnabled, showWarning]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // If dev mode not enabled, show error
  if (!devModeEnabled) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center">
            <X className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold text-red-500 mb-4">!COULDN'T BIND TO PAGE!</h1>
          <p className="text-gray-400 mb-6">
            Developer Mode is not enabled on this system. Enable it in Settings → Developer Options or during installation.
          </p>
          <button
            onClick={() => window.location.href = "/"}
            className="px-6 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-lg text-cyan-400"
          >
            Return to System
          </button>
        </div>
      </div>
    );
  }

  // Warning popup - Redesigned with detailed terminal aesthetic
  if (showWarning) {
    return (
      <div className="fixed inset-0 bg-[#050508] flex items-center justify-center p-4 overflow-auto">
        {/* Animated scan line effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(16,185,129,0.03) 2px, rgba(16,185,129,0.03) 4px)',
          }} />
          <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent animate-pulse" style={{ top: '30%' }} />
        </div>
        
        <div className="relative max-w-4xl w-full my-8">
          {/* Main Terminal */}
          <div className="bg-[#0a0d12] border border-emerald-500/40 rounded-xl overflow-hidden shadow-2xl shadow-emerald-500/10">
            {/* Title bar */}
            <div className="bg-gradient-to-r from-emerald-900/90 to-cyan-900/90 px-4 py-3 flex items-center gap-3 border-b border-emerald-500/40">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg shadow-green-500/50" />
              </div>
              <div className="flex-1 text-center">
                <span className="font-mono text-sm text-emerald-300">def-dev@urbanshade:~ [INIT]</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-emerald-400/60 font-mono">v2.2</span>
                <Bug className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            
            {/* Terminal content */}
            <div className="p-6 font-mono text-sm space-y-4 max-h-[80vh] overflow-auto">
              {/* Boot sequence */}
              <div className="text-emerald-500/70 text-xs space-y-1">
                <p>[BOOT] Initializing DEF-DEV environment...</p>
                <p>[BOOT] Loading kernel modules... OK</p>
                <p>[BOOT] Mounting virtual filesystem... OK</p>
                <p>[BOOT] Starting action dispatcher... OK</p>
              </div>

              {/* ASCII art header */}
              <pre className="text-emerald-400 text-xs leading-tight overflow-x-auto">
{`╔════════════════════════════════════════════════════════════════════╗
║  ██████╗ ███████╗███████╗    ██████╗ ███████╗██╗   ██╗             ║
║  ██╔══██╗██╔════╝██╔════╝    ██╔══██╗██╔════╝██║   ██║             ║
║  ██║  ██║█████╗  █████╗█████╗██║  ██║█████╗  ██║   ██║             ║
║  ██║  ██║██╔══╝  ██╔══╝╚════╝██║  ██║██╔══╝  ╚██╗ ██╔╝             ║
║  ██████╔╝███████╗██║         ██████╔╝███████╗ ╚████╔╝              ║
║  ╚═════╝ ╚══════╝╚═╝         ╚═════╝ ╚══════╝  ╚═══╝               ║
║                                                                     ║
║  Developer Environment Framework - Development Console    v2.2      ║
║  UrbanShade OS Advanced Debugging & System Management Tool          ║
╚════════════════════════════════════════════════════════════════════╝`}
              </pre>
              
              <div className="text-cyan-400">
                <span className="text-emerald-500">root@def-dev:~#</span> cat /etc/def-dev/ABOUT
              </div>
              
              {/* About section */}
              <div className="bg-slate-900/60 border border-slate-700/50 rounded-lg p-4 space-y-4">
                <div>
                  <h3 className="text-emerald-400 font-bold mb-2">WHAT IS DEF-DEV?</h3>
                  <p className="text-gray-300 text-xs leading-relaxed">
                    DEF-DEV (Developer Environment Framework - Development) is a comprehensive system debugging 
                    and administration console for UrbanShade OS. It provides low-level access to system internals,
                    real-time monitoring, and advanced administrative controls.
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-cyan-400 font-semibold mb-2 text-xs">CORE FEATURES</h4>
                    <ul className="text-gray-400 text-xs space-y-1">
                      <li className="flex items-center gap-2"><Terminal className="w-3 h-3 text-cyan-400" /> Real-time console capture</li>
                      <li className="flex items-center gap-2"><Activity className="w-3 h-3 text-purple-400" /> System action monitoring</li>
                      <li className="flex items-center gap-2"><Database className="w-3 h-3 text-green-400" /> LocalStorage inspection</li>
                      <li className="flex items-center gap-2"><HardDrive className="w-3 h-3 text-amber-400" /> Recovery image management</li>
                      <li className="flex items-center gap-2"><Shield className="w-3 h-3 text-red-400" /> Bugcheck reports</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-cyan-400 font-semibold mb-2 text-xs">ADMIN CAPABILITIES</h4>
                    <ul className="text-gray-400 text-xs space-y-1">
                      <li className="flex items-center gap-2"><Skull className="w-3 h-3 text-red-400" /> Crash screen triggers</li>
                      <li className="flex items-center gap-2"><Zap className="w-3 h-3 text-yellow-400" /> System command queue</li>
                      <li className="flex items-center gap-2"><FileText className="w-3 h-3 text-blue-400" /> Direct storage writes</li>
                      <li className="flex items-center gap-2"><Terminal className="w-3 h-3 text-emerald-400" /> Remote terminal execution</li>
                      <li className="flex items-center gap-2"><Power className="w-3 h-3 text-cyan-400" /> System power controls</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="text-amber-400">
                <span className="text-emerald-500">root@def-dev:~#</span> cat /etc/def-dev/WARNING
              </div>
              
              {/* Warning section */}
              <div className="bg-red-500/10 border border-red-500/40 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <h3 className="text-red-400 font-bold">⚠ SYSTEM WARNING: ADVANCED TOOLS</h3>
                    <p className="text-red-300/80 text-xs mt-2 leading-relaxed">
                      DEF-DEV provides direct access to system internals. Improper use of these tools can cause:
                    </p>
                    <ul className="text-red-300/70 text-xs mt-2 space-y-1 ml-4">
                      <li>• Data loss or corruption</li>
                      <li>• System instability or crashes</li>
                      <li>• Loss of user accounts and settings</li>
                      <li>• Unrecoverable system states</li>
                    </ul>
                    <p className="text-red-300/60 text-xs mt-3 italic">
                      Only proceed if you understand the implications. This tool is intended for developers and advanced users.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-cyan-400">
                <span className="text-emerald-500">root@def-dev:~#</span> cat /etc/def-dev/PERSISTENCE_INFO
              </div>

              {/* Persistence Info */}
              <div className="bg-emerald-500/10 border border-emerald-500/40 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Database className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-emerald-400 font-bold">ACTION LOGGING PERSISTENCE</h3>
                    <p className="text-emerald-300/80 text-xs mt-2 leading-relaxed">
                      When enabled, DEF-DEV will create a localStorage key called <code className="px-1 bg-black/30 rounded">def-dev-actions</code> to 
                      store system events across sessions. This allows you to:
                    </p>
                    <ul className="text-emerald-300/70 text-xs mt-2 space-y-1 ml-4">
                      <li>• Review actions from previous sessions</li>
                      <li>• Track system events over time</li>
                      <li>• Debug issues that occurred before DEF-DEV was open</li>
                      <li>• Export action history for analysis</li>
                    </ul>
                    
                    <label className="flex items-center gap-3 mt-4 cursor-pointer bg-black/20 p-3 rounded-lg border border-emerald-500/30">
                      <input
                        type="checkbox"
                        checked={actionConsentChecked}
                        onChange={(e) => setActionConsentChecked(e.target.checked)}
                        className="w-5 h-5 rounded border-emerald-500 bg-slate-800 accent-emerald-500"
                      />
                      <div>
                        <span className="text-emerald-300 text-sm font-semibold">
                          Enable persistent action logging
                        </span>
                        <p className="text-emerald-400/60 text-xs mt-0.5">
                          Creates def-dev-actions in localStorage (~50KB max)
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="text-gray-500 flex items-center gap-2">
                <span className="text-emerald-500">root@def-dev:~#</span> 
                <span className="animate-pulse">█</span>
                <span className="text-gray-600 text-xs ml-2">Awaiting user confirmation...</span>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="px-6 pb-6 pt-2 border-t border-slate-700/50 bg-slate-900/30">
              <div className="flex gap-3">
                <button
                  onClick={() => window.location.href = "/"}
                  className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-gray-300 font-mono text-sm transition-all hover:border-slate-500"
                >
                  <X className="w-4 h-4 inline mr-2" />exit --abort
                </button>
                <Link
                  to="/docs/def-dev"
                  className="px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-cyan-500/50 rounded-lg text-cyan-400 font-mono text-sm transition-all flex items-center gap-2 hover:border-cyan-400"
                >
                  <BookOpen className="w-4 h-4" /> man def-dev
                </Link>
                <button
                  onClick={() => {
                    if (actionConsentChecked) {
                      actionDispatcher.setPersistence(true);
                      setActionPersistenceEnabled(true);
                      localStorage.setItem('def_dev_actions_consent', 'true');
                      toast.success("Persistent action logging enabled - def-dev-actions created");
                    }
                    setShowWarning(false);
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 rounded-lg text-white font-mono text-sm font-bold transition-all shadow-lg shadow-emerald-500/20"
                >
                  <Play className="w-4 h-4 inline mr-2" />./init --confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle crash entry mode tab switching warning
  const handleTabSwitch = (newTab: typeof selectedTab) => {
    if (crashEntry && selectedTab === "bugchecks" && newTab !== "bugchecks") {
      if (!showCrashWarning) {
        toast.warning("You entered from a crash. Review the bugcheck data before navigating away.", {
          duration: 4000
        });
        setShowCrashWarning(true);
      }
    }
    setSelectedTab(newTab);
  };

  const getIcon = (type: LogEntry["type"]) => {
    switch (type) {
      case "error": return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case "warn": return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case "success": return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "system": return <Terminal className="w-4 h-4 text-purple-400" />;
      default: return <Info className="w-4 h-4 text-cyan-400" />;
    }
  };

  const getActionTypeColor = (type: ActionEntry["type"]) => {
    switch (type) {
      case "SYSTEM": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "APP": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "FILE": return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
      case "USER": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "SECURITY": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "WINDOW": return "bg-green-500/20 text-green-400 border-green-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const filteredLogs = logs.filter(log => filter === "all" || log.type === filter);
  const filteredActions = actionFilter === "ALL" ? actions : actions.filter(a => a.type === actionFilter);

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
    toast.success("Logs exported");
  };

  const handleImportImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        const newImage: RecoveryImage = {
          name: file.name.replace(/\.(img|json)$/, ''),
          data,
          created: new Date().toISOString(),
          size: JSON.stringify(data).length
        };
        const updated = [...recoveryImages, newImage];
        setRecoveryImages(updated);
        localStorage.setItem('urbanshade_recovery_images_data', JSON.stringify(updated));
        toast.success(`Imported ${file.name}`);
      } catch {
        toast.error("Failed to parse file");
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleEditValue = (key: string, value: string) => {
    if (!selectedImage) return;
    const updated = { ...selectedImage, data: { ...selectedImage.data, [key]: value } };
    setSelectedImage(updated);
    const newImages = recoveryImages.map(img => img.name === selectedImage.name ? updated : img);
    setRecoveryImages(newImages);
    localStorage.setItem('urbanshade_recovery_images_data', JSON.stringify(newImages));
    setEditingKey(null);
    toast.success(`Updated ${key}`);
  };

  const loadImageToLive = () => {
    if (!selectedImage) return;
    if (!confirm("Load this image to current system? This will replace all localStorage.")) return;
    localStorage.clear();
    Object.entries(selectedImage.data).forEach(([k, v]) => localStorage.setItem(k, v));
    toast.success("Image loaded. Reloading...");
    setTimeout(() => window.location.reload(), 1000);
  };

  const exportImage = () => {
    if (!selectedImage) return;
    const blob = new Blob([JSON.stringify(selectedImage.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedImage.name}.img`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const captureCurrentAsImage = () => {
    const data: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !key.includes('recovery_images')) data[key] = localStorage.getItem(key) || "";
    }
    const newImage: RecoveryImage = {
      name: `Snapshot_${new Date().toLocaleTimeString().replace(/:/g, '-')}`,
      data,
      created: new Date().toISOString(),
      size: JSON.stringify(data).length
    };
    const updated = [...recoveryImages, newImage];
    setRecoveryImages(updated);
    localStorage.setItem('urbanshade_recovery_images_data', JSON.stringify(updated));
    setSelectedImage(newImage);
    toast.success("Current state captured");
  };

  const clearBugchecks = () => {
    setBugchecks([]);
    localStorage.removeItem('urbanshade_bugchecks');
    toast.success("Bugcheck reports cleared");
  };

  const exportBugchecks = () => {
    const blob = new Blob([JSON.stringify(bugchecks, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bugchecks_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Bugchecks exported");
  };

  // Terminal command executor
  const executeTerminalCommand = (input: string): TerminalResult => {
    const { command, args } = parseTerminalCommand(input);
    
    switch (command) {
      case 'help':
        if (args[0] && TERMINAL_COMMANDS[args[0]]) {
          const cmd = TERMINAL_COMMANDS[args[0]];
          return { output: `${args[0]}: ${cmd.desc}\nUsage: ${cmd.usage}`, success: true, type: 'info' };
        }
        const cmdList = Object.entries(TERMINAL_COMMANDS)
          .map(([name, { desc }]) => `  ${name.padEnd(12)} - ${desc}`)
          .join('\n');
        return { output: `Available commands:\n${cmdList}`, success: true, type: 'info' };
        
      case 'crash':
        if (!args[0]) return { output: 'Usage: crash <type>\nTypes: KERNEL_PANIC, CRITICAL_PROCESS_DIED, MEMORY_MANAGEMENT, etc.', success: false, type: 'error' };
        commandQueue.queueCrash(args[0], 'terminal.exe');
        return { output: `Crash command queued: ${args[0]}\nWaiting for OS to execute...`, success: true, type: 'system' };
        
      case 'bugcheck':
        if (!args[0]) return { output: 'Usage: bugcheck <code> [description]', success: false, type: 'error' };
        commandQueue.queueBugcheck(args[0], args.slice(1).join(' ') || 'Terminal triggered bugcheck');
        return { output: `Bugcheck queued: ${args[0]}`, success: true, type: 'system' };
        
      case 'reboot':
        commandQueue.queueReboot();
        return { output: 'Reboot command queued', success: true, type: 'system' };
        
      case 'shutdown':
        commandQueue.queueShutdown();
        return { output: 'Shutdown command queued', success: true, type: 'system' };
        
      case 'lockdown':
        if (!args[0]) return { output: 'Usage: lockdown <protocol>', success: false, type: 'error' };
        commandQueue.queueLockdown(args[0]);
        return { output: `Lockdown protocol ${args[0]} queued`, success: true, type: 'system' };
        
      case 'recovery':
        commandQueue.queueRecovery();
        return { output: 'Recovery mode queued', success: true, type: 'system' };
        
      case 'wipe':
        if (!args.includes('--confirm')) return { output: 'DANGER: This will wipe ALL system data!\nUse: wipe --confirm', success: false, type: 'error' };
        commandQueue.queueWipe();
        return { output: 'System wipe command queued. System will reset on next poll.', success: true, type: 'system' };
        
      case 'echo':
        return { output: args.join(' '), success: true, type: 'output' };
        
      case 'clear':
        setTerminalHistory([]);
        return { output: '', success: true, type: 'output' };
        
      case 'ls':
        const filter = args[0]?.toLowerCase();
        const keys = Object.keys(localStorage)
          .filter(k => !filter || k.toLowerCase().includes(filter))
          .sort();
        return { output: keys.length > 0 ? keys.join('\n') : '(no matching keys)', success: true, type: 'output' };
        
      case 'get':
        if (!args[0]) return { output: 'Usage: get <key>', success: false, type: 'error' };
        const value = localStorage.getItem(args[0]);
        if (value === null) return { output: `!COULDN'T FIND BIN/FILE! Key not found: ${args[0]}`, success: false, type: 'error' };
        return { output: value, success: true, type: 'output' };
        
      case 'set':
        if (args.length < 2) return { output: 'Usage: set <key> <value>', success: false, type: 'error' };
        const setKey = args[0];
        const setValue = args.slice(1).join(' ');
        commandQueue.queueStorageWrite(setKey, setValue);
        return { output: `Storage write queued: ${setKey}`, success: true, type: 'system' };
        
      case 'del':
        if (!args[0]) return { output: 'Usage: del <key>', success: false, type: 'error' };
        commandQueue.queueStorageDelete(args[0]);
        return { output: `Storage delete queued: ${args[0]}`, success: true, type: 'system' };
        
      case 'toast':
        const toastType = args[0] as 'success' | 'error' | 'info' | 'warning';
        const toastMsg = args.slice(1).join(' ');
        if (!toastMsg) return { output: 'Usage: toast <type> <message>', success: false, type: 'error' };
        commandQueue.queueToast(toastMsg, toastType);
        return { output: `Toast queued: [${toastType}] ${toastMsg}`, success: true, type: 'system' };
        
      case 'status':
        const queueLen = commandQueue.getQueue().length;
        const persistence = commandQueue.isPersistenceEnabled();
        return { 
          output: `System Status:\n  Queue: ${queueLen} pending commands\n  Persistence: ${persistence ? 'enabled' : 'disabled'}\n  Storage: ${localStorage.length} keys (${(JSON.stringify(localStorage).length / 1024).toFixed(1)} KB)`, 
          success: true, 
          type: 'info' 
        };
        
      case 'queue':
        const pending = commandQueue.getQueue();
        if (pending.length === 0) return { output: 'Command queue is empty', success: true, type: 'info' };
        const queueOutput = pending.map((c, i) => `  ${i + 1}. [${c.type}] ${JSON.stringify(c.payload)}`).join('\n');
        return { output: `Pending commands:\n${queueOutput}`, success: true, type: 'info' };
        
      case 'exec':
        // Direct execute without queue (immediate local execution)
        const execCmd = args.join(' ');
        if (!execCmd) return { output: 'Usage: exec <command>', success: false, type: 'error' };
        return executeTerminalCommand(execCmd);
        
      default:
        if (!command) return { output: '', success: true, type: 'output' };
        return { output: `Command not found: ${command}\nType 'help' for available commands`, success: false, type: 'error' };
    }
  };

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;
    
    const result = executeTerminalCommand(terminalInput);
    if (result.output || result.type === 'error') {
      setTerminalHistory(prev => [...prev, { input: terminalInput, output: result }]);
    }
    setTerminalInput("");
    setHistoryIndex(-1);
    setTimeout(() => terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  const handleTerminalKeyDown = (e: React.KeyboardEvent) => {
    const inputs = terminalHistory.map(h => h.input);
    if (e.key === 'ArrowUp' && inputs.length > 0) {
      e.preventDefault();
      const newIdx = Math.min(historyIndex + 1, inputs.length - 1);
      setHistoryIndex(newIdx);
      setTerminalInput(inputs[inputs.length - 1 - newIdx]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIdx = historyIndex - 1;
        setHistoryIndex(newIdx);
        setTerminalInput(inputs[inputs.length - 1 - newIdx]);
      } else {
        setHistoryIndex(-1);
        setTerminalInput('');
      }
    }
  };

  const storageEntries = Object.entries(localStorage).filter(([key]) => 
    !key.includes('recovery_images') && key.toLowerCase().includes(storageSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-[#0d1117] text-gray-100 flex flex-col font-mono">
      {/* Crash entry banner */}
      {crashEntry && (
        <div className="bg-red-500/20 border-b border-red-500/50 px-4 py-2 flex items-center gap-3">
          <AlertOctagon className="w-5 h-5 text-red-400" />
          <div className="flex-1">
            <span className="text-red-400 font-bold text-sm">CRASH DEBUG MODE</span>
            <span className="text-red-300/70 text-xs ml-3">
              Stop code: {crashEntry.stopCode} | Module: {crashEntry.module || 'Unknown'}
            </span>
          </div>
          <button 
            onClick={() => setCrashEntry(null)}
            className="text-red-400/70 hover:text-red-400 text-xs"
          >
            Dismiss
          </button>
        </div>
      )}
      
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-900/50 to-orange-900/50 border-b border-amber-500/30 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bug className="w-6 h-6 text-amber-400" />
          <div>
            <h1 className="font-bold text-amber-400">DEF-DEV Console</h1>
            <p className="text-xs text-gray-500">UrbanShade Developer Environment v2.1</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/docs/def-dev" className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-sm flex items-center gap-1">
            <BookOpen className="w-3 h-3" /> Docs
          </Link>
          <span className="text-xs text-gray-500">Session: {new Date().toLocaleTimeString()}</span>
          <button onClick={() => window.location.href = "/"} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-sm">
            Exit
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        {[
          { id: "console", label: "Console", icon: <Terminal className="w-4 h-4" /> },
          { id: "actions", label: "Actions", icon: <Activity className="w-4 h-4" /> },
          { id: "terminal", label: "Terminal", icon: <Send className="w-4 h-4" /> },
          { id: "storage", label: "Storage", icon: <Database className="w-4 h-4" /> },
          { id: "images", label: "Recovery Images", icon: <HardDrive className="w-4 h-4" /> },
          { id: "bugchecks", label: `Bugchecks${bugchecks.length > 0 ? ` (${bugchecks.length})` : ''}`, icon: <Shield className="w-4 h-4" /> },
          { id: "admin", label: "Admin", icon: <Skull className="w-4 h-4" /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabSwitch(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 text-sm border-b-2 transition-colors ${
              selectedTab === tab.id 
                ? "border-amber-500 text-amber-400 bg-amber-500/10" 
                : "border-transparent text-gray-500 hover:text-gray-300"
            } ${crashEntry && tab.id === "bugchecks" ? "ring-1 ring-red-500/50" : ""}`}
          >
            {tab.icon} {tab.label}
            {crashEntry && tab.id === "bugchecks" && (
              <span className="ml-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {selectedTab === "console" && (
          <div className="h-full flex flex-col">
            {/* Toolbar */}
            <div className="p-2 border-b border-gray-800 flex items-center gap-2 flex-wrap">
              <div className="flex gap-1">
                {(["all", "error", "warn", "info", "system"] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-2 py-1 rounded text-xs capitalize ${
                      filter === f ? "bg-amber-500/20 text-amber-400" : "bg-gray-800 text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    {f} {f !== "all" && `(${logs.filter(l => l.type === f).length})`}
                  </button>
                ))}
              </div>
              <div className="flex-1" />
              <button onClick={() => setShowTechnical(!showTechnical)} className="p-1.5 hover:bg-gray-800 rounded" title="Toggle technical view">
                {showTechnical ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <button onClick={() => navigator.clipboard.writeText(logs.map(l => `[${l.type}] ${l.message}`).join("\n"))} className="p-1.5 hover:bg-gray-800 rounded">
                <Copy className="w-4 h-4" />
              </button>
              <button onClick={exportLogs} className="p-1.5 hover:bg-gray-800 rounded">
                <Download className="w-4 h-4" />
              </button>
              <button onClick={() => setLogs([])} className="p-1.5 hover:bg-gray-800 rounded text-red-400">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Logs */}
            <div className="flex-1 overflow-auto p-2 space-y-1 text-xs">
              {filteredLogs.length === 0 ? (
                <div className="text-center text-gray-600 py-8">Waiting for events...</div>
              ) : (
                filteredLogs.map(log => (
                  <div key={log.id} className={`p-2 rounded border ${
                    log.type === "error" ? "bg-red-500/5 border-red-500/20" :
                    log.type === "warn" ? "bg-amber-500/5 border-amber-500/20" :
                    log.type === "system" ? "bg-purple-500/5 border-purple-500/20" :
                    "bg-gray-800/50 border-gray-700/50"
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      {getIcon(log.type)}
                      <span className="text-gray-600">{log.timestamp.toLocaleTimeString()}</span>
                      <span className={`uppercase font-bold ${
                        log.type === "error" ? "text-red-400" :
                        log.type === "warn" ? "text-amber-400" :
                        log.type === "system" ? "text-purple-400" : "text-cyan-400"
                      }`}>{log.type}</span>
                    </div>
                    {showTechnical ? (
                      <pre className="whitespace-pre-wrap break-all text-gray-300">{log.message}</pre>
                    ) : (
                      <div className="text-gray-300">{log.simplified || log.message}</div>
                    )}
                  </div>
                ))
              )}
              <div ref={logsEndRef} />
            </div>

            {/* Stats */}
            <div className="p-2 border-t border-gray-800 flex gap-4 text-xs text-gray-500">
              <span>Total: {logs.length}</span>
              <span className="text-red-400">Errors: {logs.filter(l => l.type === "error").length}</span>
              <span className="text-amber-400">Warnings: {logs.filter(l => l.type === "warn").length}</span>
            </div>
          </div>
        )}

        {selectedTab === "actions" && (
          <div className="h-full flex flex-col">
            {/* Filter */}
            <div className="p-2 border-b border-gray-800 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-500">Filter:</span>
              {(["ALL", "SYSTEM", "APP", "FILE", "USER", "SECURITY", "WINDOW"] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setActionFilter(type)}
                  className={`px-2 py-1 rounded text-xs ${
                    actionFilter === type ? "bg-amber-500/20 text-amber-400" : "bg-gray-800 text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {type}
                </button>
              ))}
              <div className="flex-1" />
              <div className="flex items-center gap-2 mr-2">
                <span className={`text-xs ${actionPersistenceEnabled ? 'text-green-400' : 'text-gray-500'}`}>
                  {actionPersistenceEnabled ? '● Persisting' : '○ Not persisting'}
                </span>
              </div>
              <button 
                onClick={() => {
                  const stored = actionDispatcher.refreshFromStorage();
                  const converted = stored.map((a, idx) => ({
                    id: idx,
                    type: a.type as ActionEntry["type"],
                    timestamp: a.timestamp,
                    message: a.message
                  }));
                  setActions(converted);
                  toast.success(`Loaded ${stored.length} actions from storage`);
                }}
                className="p-1.5 hover:bg-gray-800 rounded text-cyan-400"
                title="Refresh from localStorage"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button onClick={() => setActions([])} className="p-1.5 hover:bg-gray-800 rounded text-red-400">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Actions */}
            <div className="flex-1 overflow-auto p-2 space-y-1 text-xs">
              {filteredActions.length === 0 ? (
                <div className="text-center text-gray-600 py-8">
                  <p>No actions recorded yet...</p>
                  {actionPersistenceEnabled && (
                    <button 
                      onClick={() => {
                        const stored = actionDispatcher.refreshFromStorage();
                        const converted = stored.map((a, idx) => ({
                          id: idx,
                          type: a.type as ActionEntry["type"],
                          timestamp: a.timestamp,
                          message: a.message
                        }));
                        setActions(converted);
                      }}
                      className="mt-2 px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded text-cyan-400"
                    >
                      <RefreshCw className="w-3 h-3 inline mr-1" />Load from storage
                    </button>
                  )}
                </div>
              ) : (
                filteredActions.map(action => (
                  <div key={action.id} className="p-2 rounded bg-gray-800/50 border border-gray-700/50 flex items-center gap-3">
                    <span className="text-gray-600 min-w-[65px]">{action.timestamp.toLocaleTimeString()}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getActionTypeColor(action.type)}`}>
                      {action.type}
                    </span>
                    <span className="text-gray-300">{action.message}</span>
                  </div>
                ))
              )}
            </div>

            {/* Stats */}
            <div className="p-2 border-t border-gray-800 text-xs text-gray-500">
              Total Actions: {actions.length}
            </div>
          </div>
        )}

        {selectedTab === "terminal" && (
          <div className="h-full flex flex-col">
            {/* Terminal header */}
            <div className="p-2 border-b border-gray-800 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-400">DEF-DEV Terminal</span>
              <span className="text-xs text-gray-500 ml-2">Commands execute on OS via queue (250ms poll)</span>
              <div className="flex-1" />
              <span className="text-xs text-gray-600">{commandQueue.getQueue().length} queued</span>
              <button onClick={() => setTerminalHistory([])} className="p-1.5 hover:bg-gray-800 rounded text-red-400">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Terminal output */}
            <div className="flex-1 overflow-auto p-4 bg-black/30 font-mono text-sm" onClick={() => terminalInputRef.current?.focus()}>
              <div className="text-emerald-400/70 mb-4">
                DEF-DEV Terminal v2.2 - Type 'help' for commands
              </div>
              {terminalHistory.map((entry, idx) => (
                <div key={idx} className="mb-3">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <span className="text-emerald-600">root@def-dev:~#</span>
                    <span>{entry.input}</span>
                  </div>
                  <pre className={`mt-1 whitespace-pre-wrap break-all ${
                    entry.output.type === 'error' ? 'text-red-400' :
                    entry.output.type === 'system' ? 'text-cyan-400' :
                    entry.output.type === 'info' ? 'text-amber-400' : 'text-gray-300'
                  }`}>{entry.output.output}</pre>
                </div>
              ))}
              <div ref={terminalEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleTerminalSubmit} className="p-3 border-t border-gray-800 flex items-center gap-2 bg-black/30">
              <span className="text-emerald-600 font-mono text-sm">root@def-dev:~#</span>
              <input
                ref={terminalInputRef}
                type="text"
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                onKeyDown={handleTerminalKeyDown}
                className="flex-1 bg-transparent outline-none text-emerald-400 font-mono text-sm"
                placeholder="Enter command..."
                autoFocus
              />
              <button type="submit" className="p-1.5 hover:bg-emerald-500/20 rounded text-emerald-400">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {selectedTab === "storage" && (
          <div className="h-full flex flex-col p-4">
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={storageSearch}
                onChange={(e) => setStorageSearch(e.target.value)}
                placeholder="Search keys..."
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm"
              />
              <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded text-red-400 text-sm">
                Clear All
              </button>
            </div>
            <div className="flex-1 overflow-auto space-y-1">
              {storageEntries.map(([key, value]) => (
                <div key={key} className="p-2 bg-gray-800/50 border border-gray-700/50 rounded text-xs">
                  <div className="font-semibold text-cyan-400 mb-1">{key}</div>
                  <pre className="text-gray-400 whitespace-pre-wrap break-all max-h-20 overflow-auto">{value}</pre>
                </div>
              ))}
            </div>
            <div className="pt-2 text-xs text-gray-500">{storageEntries.length} entries • {(JSON.stringify(localStorage).length / 1024).toFixed(1)} KB</div>
          </div>
        )}

        {selectedTab === "images" && (
          <div className="h-full flex">
            {/* Image List */}
            <div className="w-64 border-r border-gray-800 p-3 flex flex-col">
              <div className="flex gap-2 mb-3">
                <button onClick={captureCurrentAsImage} className="flex-1 px-2 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded text-xs text-cyan-400">
                  <Zap className="w-3 h-3 inline mr-1" />Capture
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="flex-1 px-2 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded text-xs text-amber-400">
                  <Upload className="w-3 h-3 inline mr-1" />Import
                </button>
              </div>
              <input ref={fileInputRef} type="file" accept=".img,.json" onChange={handleImportImage} className="hidden" />
              <div className="flex-1 overflow-auto space-y-1">
                {recoveryImages.map(img => (
                  <button
                    key={img.name}
                    onClick={() => setSelectedImage(img)}
                    className={`w-full p-2 rounded text-left text-xs ${
                      selectedImage?.name === img.name ? "bg-amber-500/20 border border-amber-500/30" : "bg-gray-800/50 hover:bg-gray-700/50"
                    }`}
                  >
                    <div className="font-semibold truncate">{img.name}</div>
                    <div className="text-gray-500">{(img.size / 1024).toFixed(1)} KB</div>
                  </button>
                ))}
                {recoveryImages.length === 0 && <div className="text-gray-600 text-center py-4 text-xs">No images</div>}
              </div>
            </div>

            {/* Image Editor */}
            <div className="flex-1 p-4 overflow-auto">
              {selectedImage ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-amber-400">{selectedImage.name}</h3>
                      <p className="text-xs text-gray-500">{Object.keys(selectedImage.data).length} keys • {(selectedImage.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={exportImage} className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded text-xs text-cyan-400">
                        <Download className="w-3 h-3 inline mr-1" />Export
                      </button>
                      <button onClick={loadImageToLive} className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded text-xs text-green-400">
                        <Play className="w-3 h-3 inline mr-1" />Load to System
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(selectedImage.data).map(([key, value]) => (
                      <div key={key} className="p-2 bg-gray-800/50 border border-gray-700/50 rounded">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-cyan-400">{key}</span>
                          <button
                            onClick={() => { setEditingKey(key); setEditValue(value); }}
                            className="text-xs text-gray-500 hover:text-amber-400"
                          >
                            Edit
                          </button>
                        </div>
                        {editingKey === key ? (
                          <div className="flex gap-2">
                            <textarea
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="flex-1 px-2 py-1 bg-gray-900 border border-gray-600 rounded text-xs"
                              rows={3}
                            />
                            <div className="flex flex-col gap-1">
                              <button onClick={() => handleEditValue(key, editValue)} className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Save</button>
                              <button onClick={() => setEditingKey(null)} className="px-2 py-1 bg-gray-700 text-gray-400 rounded text-xs">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <pre className="text-xs text-gray-400 whitespace-pre-wrap break-all max-h-16 overflow-auto">{value}</pre>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-600">
                  Select an image or capture current state
                </div>
              )}
            </div>
          </div>
        )}

        {selectedTab === "bugchecks" && (
          <div className="h-full flex flex-col">
            {/* Toolbar */}
            <div className="p-2 border-b border-gray-800 flex items-center gap-2">
              <Shield className="w-4 h-4 text-red-400" />
              <span className="text-sm text-gray-400">Bugcheck Reports</span>
              <div className="flex-1" />
              {bugchecks.length > 0 && (
                <>
                  <button onClick={exportBugchecks} className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded text-xs text-cyan-400">
                    <Download className="w-3 h-3 inline mr-1" />Export All
                  </button>
                  <button onClick={clearBugchecks} className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded text-xs text-red-400">
                    <Trash2 className="w-3 h-3 inline mr-1" />Clear All
                  </button>
                </>
              )}
            </div>

            {/* Bugcheck List */}
            <div className="flex-1 overflow-auto p-4">
              {bugchecks.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-green-500/50 mx-auto mb-4" />
                  <p className="text-gray-500">No bugcheck reports</p>
                  <p className="text-xs text-gray-600 mt-1">System is running without critical errors</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bugchecks.map((bc, idx) => (
                    <div key={idx} className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-red-400 font-mono">{bc.code}</span>
                        <span className="text-xs text-gray-500">{new Date(bc.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-gray-300 mb-2">{bc.description}</p>
                      {bc.location && <p className="text-xs text-gray-500">Location: {bc.location}</p>}
                      {bc.systemInfo && (
                        <div className="mt-2 pt-2 border-t border-red-500/10 grid grid-cols-2 gap-2 text-xs">
                          {Object.entries(bc.systemInfo).map(([k, v]) => (
                            <div key={k}>
                              <span className="text-gray-500">{k}: </span>
                              <span className="text-gray-400">{v}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(JSON.stringify(bc, null, 2));
                          toast.success("Bugcheck copied");
                        }}
                        className="mt-3 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs"
                      >
                        <Copy className="w-3 h-3 inline mr-1" />Copy Report
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {selectedTab === "admin" && (
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-800 bg-gradient-to-r from-red-900/30 to-orange-900/30">
              <div className="flex items-center gap-3">
                <Skull className="w-6 h-6 text-red-400" />
                <div>
                  <h3 className="font-bold text-red-400">Admin Commands</h3>
                  <p className="text-xs text-gray-500">Advanced system control and crash triggers</p>
                </div>
              </div>
            </div>

            {/* Admin Controls */}
            <div className="flex-1 overflow-auto p-4 space-y-6">
              {/* Crash Triggers */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-amber-400 flex items-center gap-2">
                  <MonitorX className="w-4 h-4" /> Crash Screen Triggers
                </h4>
                <p className="text-xs text-gray-500 mb-3">Trigger various crash screens (BSOD) for testing crash handlers</p>
                
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { code: "CRITICAL_PROCESS_DIED", label: "Critical Process", desc: "System process terminated", icon: <AlertOctagon className="w-4 h-4" /> },
                    { code: "KERNEL_PANIC", label: "Kernel Panic", desc: "Core system failure", icon: <Cpu className="w-4 h-4" /> },
                    { code: "MEMORY_MANAGEMENT", label: "Memory Error", desc: "Memory allocation failed", icon: <MemoryStick className="w-4 h-4" /> },
                    { code: "SYSTEM_SERVICE_EXCEPTION", label: "Service Exception", desc: "System service error", icon: <AlertTriangle className="w-4 h-4" /> },
                    { code: "VIDEO_TDR_FAILURE", label: "Video Failure", desc: "Display driver timeout", icon: <MonitorX className="w-4 h-4" /> },
                    { code: "WHEA_UNCORRECTABLE_ERROR", label: "Hardware Error", desc: "Fatal hardware failure", icon: <Bomb className="w-4 h-4" /> },
                  ].map((crash) => (
                    <button
                      key={crash.code}
                      onClick={() => {
                        if (confirm(`Trigger ${crash.label}?\n\nThis will queue a crash command for the OS.`)) {
                          actionDispatcher.system(`Admin triggered crash: ${crash.code}`);
                          commandQueue.queueCrash(crash.code, 'admin.exe');
                          toast.success(`Crash queued: ${crash.code}`);
                        }
                      }}
                      className="p-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-left transition-all group"
                    >
                      <div className="flex items-center gap-2 text-red-400 mb-1">
                        {crash.icon}
                        <span className="font-semibold text-sm">{crash.label}</span>
                      </div>
                      <p className="text-xs text-gray-500">{crash.desc}</p>
                      <code className="text-xs text-red-400/50 mt-1 block">{crash.code}</code>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bugcheck Triggers */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-purple-400 flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Bugcheck Triggers
                </h4>
                <p className="text-xs text-gray-500 mb-3">Trigger system bugchecks (detailed error reports)</p>
                
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { code: "FATAL_EXCEPTION", label: "Fatal Exception", desc: "Unhandled system exception" },
                    { code: "SYSTEM_CORRUPTION", label: "System Corruption", desc: "Critical data integrity failure" },
                    { code: "SECURITY_BREACH", label: "Security Breach", desc: "Security violation detected" },
                    { code: "DRIVER_FAILURE", label: "Driver Failure", desc: "Driver crashed unexpectedly" },
                  ].map((bug) => (
                    <button
                      key={bug.code}
                      onClick={() => {
                        if (confirm(`Trigger ${bug.label} bugcheck?`)) {
                          actionDispatcher.system(`Admin triggered bugcheck: ${bug.code}`);
                          localStorage.setItem('urbanshade_pending_bugcheck', JSON.stringify({
                            code: bug.code,
                            description: bug.desc,
                            triggeredAt: new Date().toISOString()
                          }));
                          window.location.href = '/';
                        }
                      }}
                      className="p-3 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-lg text-left transition-all"
                    >
                      <div className="font-semibold text-sm text-purple-400 mb-1">{bug.label}</div>
                      <p className="text-xs text-gray-500">{bug.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* System Controls */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-cyan-400 flex items-center gap-2">
                  <Power className="w-4 h-4" /> System Controls
                </h4>
                
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => {
                      if (confirm('Force system reboot?')) {
                        actionDispatcher.system('Admin forced reboot');
                        window.location.href = '/';
                      }
                    }}
                    className="p-3 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg"
                  >
                    <Power className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                    <span className="text-xs text-cyan-400">Force Reboot</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      actionDispatcher.clearStorage();
                      setActions([]);
                      toast.success('Action history cleared');
                    }}
                    className="p-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                    <span className="text-xs text-amber-400">Clear Actions</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      const enabled = !actionPersistenceEnabled;
                      actionDispatcher.setPersistence(enabled);
                      setActionPersistenceEnabled(enabled);
                      toast.success(enabled ? 'Action persistence enabled' : 'Action persistence disabled');
                    }}
                    className={`p-3 border rounded-lg ${actionPersistenceEnabled ? 'bg-green-500/20 border-green-500/30' : 'bg-gray-500/10 border-gray-500/30'}`}
                  >
                    <Database className={`w-5 h-5 mx-auto mb-1 ${actionPersistenceEnabled ? 'text-green-400' : 'text-gray-400'}`} />
                    <span className={`text-xs ${actionPersistenceEnabled ? 'text-green-400' : 'text-gray-400'}`}>
                      {actionPersistenceEnabled ? 'Persist: ON' : 'Persist: OFF'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Dangerous Zone */}
              <div className="space-y-3 pt-4 border-t border-red-500/20">
                <h4 className="text-sm font-semibold text-red-500 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Danger Zone
                </h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      if (confirm('DANGER: This will clear ALL localStorage and reset the entire system. Continue?')) {
                        if (confirm('Are you ABSOLUTELY sure? This cannot be undone!')) {
                          actionDispatcher.system('Admin triggered full system wipe');
                          localStorage.clear();
                          toast.success('System wiped. Reloading...');
                          setTimeout(() => window.location.href = '/', 1000);
                        }
                      }
                    }}
                    className="p-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg"
                  >
                    <Bomb className="w-5 h-5 text-red-500 mx-auto mb-1" />
                    <span className="text-xs text-red-500 font-bold">WIPE SYSTEM</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      // Dispatch multiple error types
                      actionDispatcher.dispatchError("FILE_NOT_FOUND", "Test file missing");
                      actionDispatcher.dispatchError("STORAGE_ERROR", "Storage access denied");
                      actionDispatcher.dispatchError("PERMISSION_DENIED", "Admin test");
                      actionDispatcher.dispatchError("PROCESS_CRASH", "Test process terminated");
                      toast.info('Dispatched 4 test errors');
                    }}
                    className="p-3 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 rounded-lg"
                  >
                    <AlertTriangle className="w-5 h-5 text-orange-400 mx-auto mb-1" />
                    <span className="text-xs text-orange-400">Spam Errors</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DevMode;