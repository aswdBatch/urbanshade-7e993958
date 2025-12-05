import { ArrowLeft, Bug, Terminal, Database, HardDrive, AlertTriangle, Info, Eye, Download, Trash2, Copy, RefreshCw, Shield, Zap, Activity, Code, FileWarning, Server, Cpu, Network, Settings, Layers, Lock, Key, Search, Filter, Play, Pause, ChevronRight, ExternalLink, BookOpen, Wrench, AlertCircle, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const DefDevDocs = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-amber-400">DEF-DEV Documentation</h1>
          <Link 
            to="/docs" 
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:bg-amber-500/30 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Docs
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-12 space-y-16">
        {/* Title */}
        <section className="text-center space-y-4">
          <p className="text-sm text-gray-500 italic">(No jokes unfortunately)</p>
          <div className="flex items-center justify-center gap-3">
            <Bug className="w-12 h-12 text-amber-400" />
            <h2 className="text-4xl font-bold text-amber-400">DEF-DEV Console</h2>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Developer Environment and Debugging Tool for UrbanShade OS v2.0
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">v2.0</span>
            <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-xs font-semibold">Developer Tool</span>
            <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs font-semibold">Advanced</span>
          </div>
        </section>

        {/* Table of Contents */}
        <section className="p-6 bg-black/40 border border-white/10 rounded-xl">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            Table of Contents
          </h3>
          <div className="grid md:grid-cols-2 gap-2 text-sm">
            {[
              "Overview",
              "Accessing DEF-DEV",
              "Console Tab",
              "Actions Tab",
              "Storage Tab",
              "Recovery Images",
              "Bugcheck Reports",
              "Error Types & Codes",
              "Action Dispatcher API",
              "System Bus API",
              "Bugcheck System",
              "Advanced Functions",
              "Troubleshooting",
              "Best Practices"
            ].map((item, i) => (
              <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} className="flex items-center gap-2 p-2 rounded hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground">
                <ChevronRight className="w-3 h-3 text-amber-400" />
                {i + 1}. {item}
              </a>
            ))}
          </div>
        </section>

        {/* Overview */}
        <section id="overview" className="space-y-4">
          <h3 className="text-2xl font-bold border-b border-white/10 pb-2">1. Overview</h3>
          <p className="text-muted-foreground leading-relaxed">
            DEF-DEV (Developer Environment Framework - Development) is a comprehensive debugging and development console 
            for UrbanShade OS. It provides real-time logging, localStorage inspection, recovery image management, 
            action monitoring, and system diagnostics. This tool is intended for developers and advanced users 
            performing troubleshooting or system analysis.
          </p>
          
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <Terminal className="w-6 h-6 text-cyan-400 mb-2" />
              <h4 className="font-semibold text-cyan-400 mb-1">Real-Time Logging</h4>
              <p className="text-sm text-muted-foreground">Captures all console output with smart error simplification</p>
            </div>
            <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <Activity className="w-6 h-6 text-purple-400 mb-2" />
              <h4 className="font-semibold text-purple-400 mb-1">Action Monitoring</h4>
              <p className="text-sm text-muted-foreground">Tracks all system events via the Action Dispatcher</p>
            </div>
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <Database className="w-6 h-6 text-green-400 mb-2" />
              <h4 className="font-semibold text-green-400 mb-1">Storage Inspector</h4>
              <p className="text-sm text-muted-foreground">View and manage all localStorage entries</p>
            </div>
          </div>
        </section>

        {/* Accessing DEF-DEV */}
        <section id="accessing-def-dev" className="space-y-4">
          <h3 className="text-2xl font-bold border-b border-white/10 pb-2">2. Accessing DEF-DEV</h3>
          <div className="space-y-3 text-muted-foreground">
            <p>DEF-DEV requires Developer Mode to be enabled. There are multiple methods to access it:</p>
            
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-black/40 border border-white/10 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-amber-400" />
                  Method 1: During Installation
                </h4>
                <p className="text-sm">Check the "Enable Developer Mode" option in the configuration step of the installer.</p>
              </div>
              <div className="p-4 bg-black/40 border border-white/10 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-amber-400" />
                  Method 2: Via Settings
                </h4>
                <p className="text-sm">Navigate to Settings → Developer Options and enable Developer Mode.</p>
              </div>
              <div className="p-4 bg-black/40 border border-white/10 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-amber-400" />
                  Method 3: Browser Console
                </h4>
                <p className="text-sm">Type <code className="px-1.5 py-0.5 bg-black/50 rounded text-amber-400">devMode()</code> in the browser console.</p>
              </div>
              <div className="p-4 bg-black/40 border border-white/10 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-400" />
                  Method 4: Recovery Mode
                </h4>
                <p className="text-sm">Access Recovery Mode (F2 during boot) and select "Developer Mode".</p>
              </div>
            </div>

            <p className="mt-4">Once enabled, access the full console at <code className="px-2 py-1 bg-black/50 rounded text-amber-400">/def-dev</code></p>
            
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg mt-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                <div>
                  <p className="text-red-400 font-semibold">Access Denied Error</p>
                  <p className="text-sm mt-1">If you see "!COULDN'T BIND TO PAGE!" this means Developer Mode is not enabled. 
                  Enable it via one of the methods above before accessing /def-dev.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Console Tab */}
        <section id="console-tab" className="space-y-6">
          <h3 className="text-2xl font-bold border-b border-white/10 pb-2">3. Console Tab</h3>
          <div className="p-6 bg-black/40 border border-white/10 rounded-lg space-y-4">
            <div className="flex items-center gap-3">
              <Terminal className="w-6 h-6 text-cyan-400" />
              <h4 className="text-xl font-bold">Real-Time Console Logging</h4>
            </div>
            <p className="text-muted-foreground">
              The Console tab captures and displays all console output including logs, warnings, errors, and system messages.
              It features smart error simplification that translates technical errors into human-readable explanations.
            </p>
            
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-3">
                <h5 className="font-semibold text-foreground">Features</h5>
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <Eye className="w-4 h-4 text-cyan-400 mt-1" />
                    <div>
                      <strong className="text-foreground">Simple/Technical Views</strong>
                      <p className="text-muted-foreground">Toggle between simplified and raw error views</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Search className="w-4 h-4 text-cyan-400 mt-1" />
                    <div>
                      <strong className="text-foreground">Search & Filter</strong>
                      <p className="text-muted-foreground">Search logs and filter by type (error, warn, info)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Pause className="w-4 h-4 text-cyan-400 mt-1" />
                    <div>
                      <strong className="text-foreground">Pause/Resume</strong>
                      <p className="text-muted-foreground">Pause logging to examine entries without scrolling</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h5 className="font-semibold text-foreground">Actions</h5>
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <Copy className="w-4 h-4 text-cyan-400 mt-1" />
                    <div>
                      <strong className="text-foreground">Copy Logs</strong>
                      <p className="text-muted-foreground">Copy all logs to clipboard for sharing</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Download className="w-4 h-4 text-cyan-400 mt-1" />
                    <div>
                      <strong className="text-foreground">Export</strong>
                      <p className="text-muted-foreground">Export logs as a .txt file with timestamps</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Trash2 className="w-4 h-4 text-red-400 mt-1" />
                    <div>
                      <strong className="text-foreground">Clear</strong>
                      <p className="text-muted-foreground">Clear all captured logs from current session</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg mt-4">
              <h5 className="font-semibold text-cyan-400 mb-2">Smart Error Simplification</h5>
              <p className="text-sm text-muted-foreground mb-3">
                Technical errors are automatically translated into plain language. Click any error entry to expand and see the full technical details.
              </p>
              <div className="grid gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-red-400 font-mono">Cannot read properties of undefined</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="text-green-400">"Something tried to use data that doesn't exist yet"</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-400 font-mono">Maximum call stack size exceeded</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="text-green-400">"The system got stuck in a loop"</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Actions Tab */}
        <section id="actions-tab" className="space-y-6">
          <h3 className="text-2xl font-bold border-b border-white/10 pb-2">4. Actions Tab</h3>
          <div className="p-6 bg-black/40 border border-white/10 rounded-lg space-y-4">
            <div className="flex items-center gap-3">
              <Activity className="w-6 h-6 text-purple-400" />
              <h4 className="text-xl font-bold">System Action Monitoring</h4>
            </div>
            <p className="text-muted-foreground">
              Monitors all system actions and user interactions in real-time. Connected to the OS action bus via the Action Dispatcher.
            </p>
            
            <div className="mt-4">
              <h5 className="font-semibold text-foreground mb-3">Tracked Action Types</h5>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { type: "SYSTEM", color: "purple", desc: "Core system events (boot, shutdown, settings changes)" },
                  { type: "APP", color: "blue", desc: "Application lifecycle events (open, close, errors)" },
                  { type: "FILE", color: "cyan", desc: "File system operations (create, read, delete)" },
                  { type: "USER", color: "yellow", desc: "User interactions (clicks, inputs, navigation)" },
                  { type: "SECURITY", color: "orange", desc: "Security events (login, permissions, lockdown)" },
                  { type: "WINDOW", color: "green", desc: "Window management (open, close, focus, resize)" },
                  { type: "ERROR", color: "red", desc: "System errors and exceptions" },
                ].map(({ type, color, desc }) => (
                  <div key={type} className={`p-3 bg-${color}-500/10 border border-${color}-500/30 rounded-lg`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-3 h-3 rounded bg-${color}-500`}></span>
                      <span className={`font-semibold text-${color}-400`}>{type}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg mt-4">
              <h5 className="font-semibold text-purple-400 mb-2">Persistence</h5>
              <p className="text-sm text-muted-foreground">
                Actions can be persisted to localStorage for analysis across sessions. Enable persistence in the Actions tab settings.
                The system keeps the last 500 actions by default.
              </p>
            </div>
          </div>
        </section>

        {/* Storage Tab */}
        <section id="storage-tab" className="space-y-6">
          <h3 className="text-2xl font-bold border-b border-white/10 pb-2">5. Storage Tab</h3>
          <div className="p-6 bg-black/40 border border-white/10 rounded-lg space-y-4">
            <div className="flex items-center gap-3">
              <Database className="w-6 h-6 text-cyan-400" />
              <h4 className="text-xl font-bold">LocalStorage Inspector</h4>
            </div>
            <p className="text-muted-foreground">
              View, search, and manage all localStorage entries used by UrbanShade OS.
            </p>
            
            <div className="grid md:grid-cols-2 gap-4 mt-4 text-sm">
              <div className="space-y-2">
                <h5 className="font-semibold text-foreground">Capabilities</h5>
                <ul className="space-y-1 text-muted-foreground">
                  <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-400" /> Search entries by key name</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-400" /> View raw values stored in each entry</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-400" /> Monitor storage size and entry count</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-400" /> Export storage snapshot</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-400" /> Clear all storage (requires confirmation)</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h5 className="font-semibold text-foreground">Common Keys</h5>
                <ul className="space-y-1 text-muted-foreground text-xs font-mono">
                  <li>urbanshade_admin - Admin account data</li>
                  <li>urbanshade_accounts - User accounts</li>
                  <li>urbanshade_settings - System settings</li>
                  <li>urbanshade_bugchecks - Bugcheck reports</li>
                  <li>def-dev-actions - Logged actions</li>
                  <li>bios_* - BIOS configuration</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Recovery Images */}
        <section id="recovery-images" className="space-y-6">
          <h3 className="text-2xl font-bold border-b border-white/10 pb-2">6. Recovery Images</h3>
          <div className="p-6 bg-black/40 border border-white/10 rounded-lg space-y-4">
            <div className="flex items-center gap-3">
              <HardDrive className="w-6 h-6 text-green-400" />
              <h4 className="text-xl font-bold">System Recovery Images</h4>
            </div>
            <p className="text-muted-foreground">
              Create, edit, import, and export system recovery images (.img files). Recovery images capture complete system state
              and can be used to restore the system to a known good configuration.
            </p>
            
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <Zap className="w-5 h-5 text-green-400 mb-2" />
                <h5 className="font-semibold text-green-400 mb-1">Capture State</h5>
                <p className="text-sm text-muted-foreground">Save the current system state including all settings, accounts, and data as a recovery image.</p>
              </div>
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <Download className="w-5 h-5 text-green-400 mb-2" />
                <h5 className="font-semibold text-green-400 mb-1">Import/Export</h5>
                <p className="text-sm text-muted-foreground">Import .img files from external sources or export images for backup and sharing.</p>
              </div>
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <RefreshCw className="w-5 h-5 text-green-400 mb-2" />
                <h5 className="font-semibold text-green-400 mb-1">Load to Live</h5>
                <p className="text-sm text-muted-foreground">Restore an image to the current system, replacing all localStorage data.</p>
              </div>
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <Shield className="w-5 h-5 text-amber-400 mb-2" />
                <h5 className="font-semibold text-amber-400 mb-1">Recovery Disc (.usd)</h5>
                <p className="text-sm text-muted-foreground">Special recovery disc format with emergency admin capabilities for disaster recovery.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Bugcheck Reports */}
        <section id="bugcheck-reports" className="space-y-6">
          <h3 className="text-2xl font-bold border-b border-white/10 pb-2">7. Bugcheck Reports</h3>
          <div className="p-6 bg-black/40 border border-white/10 rounded-lg space-y-4">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-red-400" />
              <h4 className="text-xl font-bold">Bugcheck Report Management</h4>
            </div>
            <p className="text-muted-foreground">
              View and manage bugcheck reports generated by the system when fatal errors occur. Each bugcheck includes
              error code, description, timestamp, system info, and optional stack trace.
            </p>
            
            <div className="text-sm space-y-2 text-muted-foreground">
              <p className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-400" /> View error codes and human-readable descriptions</p>
              <p className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-400" /> Copy reports to share with developers</p>
              <p className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-400" /> Export reports as JSON files</p>
              <p className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-400" /> Clear resolved bugchecks</p>
              <p className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-400" /> View system state at time of crash</p>
            </div>
          </div>
        </section>

        {/* Error Types */}
        <section id="error-types-&-codes" className="space-y-6">
          <h3 className="text-2xl font-bold border-b border-white/10 pb-2">8. Error Types & Codes</h3>
          <p className="text-muted-foreground">
            DEF-DEV uses standardized error codes for system issues. These appear in the Action Logger and Console tabs.
          </p>
          
          <div className="grid gap-3">
            {[
              { code: "!COULDN'T FIND BIN/FILE!", desc: "LocalStorage key or file doesn't exist", color: "red", severity: "ERROR" },
              { code: "!LOCALSTORAGE ACCESS DENIED!", desc: "Browser blocked localStorage access (private mode or quota exceeded)", color: "red", severity: "FATAL" },
              { code: "!ACCESS LEVEL INSUFFICIENT!", desc: "User lacks required permissions for the operation", color: "orange", severity: "WARN" },
              { code: "!NETWORK BIND FAILED!", desc: "Failed to establish network connection", color: "yellow", severity: "ERROR" },
              { code: "!PROCESS TERMINATED UNEXPECTEDLY!", desc: "Application crashed or was killed by the system", color: "red", severity: "ERROR" },
              { code: "!MEMORY ALLOCATION FAILED!", desc: "System ran out of available memory", color: "purple", severity: "FATAL" },
              { code: "!OPERATION TIMED OUT!", desc: "Request exceeded the configured time limit", color: "yellow", severity: "WARN" },
              { code: "!INVALID OPERATION REQUESTED!", desc: "Attempted to perform an unsupported action", color: "orange", severity: "WARN" },
              { code: "!DATA CORRUPTION DETECTED!", desc: "Stored data is malformed, damaged, or inconsistent", color: "red", severity: "FATAL" },
              { code: "!AUTHENTICATION FAILED!", desc: "Login credentials invalid or session expired", color: "red", severity: "ERROR" },
            ].map(({ code, desc, color, severity }) => (
              <div key={code} className={`p-4 bg-${color}-500/10 border border-${color}-500/30 rounded-lg flex items-start gap-4`}>
                <FileWarning className={`w-5 h-5 text-${color}-400 mt-0.5 flex-shrink-0`} />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <code className={`text-${color}-400 font-mono text-sm font-bold`}>{code}</code>
                    <span className={`text-xs px-2 py-0.5 rounded bg-${color}-500/30 text-${color}-400`}>{severity}</span>
                  </div>
                  <p className="text-muted-foreground text-sm">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Action Dispatcher API */}
        <section id="action-dispatcher-api" className="space-y-4">
          <h3 className="text-2xl font-bold border-b border-white/10 pb-2">9. Action Dispatcher API</h3>
          <p className="text-muted-foreground">
            The Action Dispatcher allows you to send events from any component to DEF-DEV for monitoring and logging.
          </p>
          
          <div className="p-4 bg-black/60 border border-white/10 rounded-lg">
            <pre className="text-sm text-cyan-400 overflow-x-auto">
{`import { actionDispatcher } from "@/lib/actionDispatcher";

// Dispatch different action types
actionDispatcher.system("System initialized");
actionDispatcher.app("Application started", { appId: "calculator" });
actionDispatcher.file("File saved: document.txt", { path: "/documents/" });
actionDispatcher.user("User clicked button", { buttonId: "submit" });
actionDispatcher.security("Access granted", { clearance: 3 });
actionDispatcher.window("Window opened: Settings");

// Dispatch errors with standard codes
actionDispatcher.dispatchError("FILE_NOT_FOUND", "config.json");
actionDispatcher.dispatchError("PERMISSION_DENIED", "admin area");
actionDispatcher.dispatchError("STORAGE_ERROR", "quota exceeded");

// Subscribe to actions
const unsubscribe = actionDispatcher.subscribe((action) => {
  console.log("Action:", action.type, action.message);
});

// Get history
const history = actionDispatcher.getHistory();

// Enable/disable persistence
actionDispatcher.setPersistence(true);`}
            </pre>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="p-4 bg-black/40 border border-white/10 rounded-lg">
              <h5 className="font-semibold text-foreground mb-2">Available Methods</h5>
              <ul className="text-sm text-muted-foreground space-y-1 font-mono">
                <li>system(message, details?)</li>
                <li>app(message, details?)</li>
                <li>file(message, details?)</li>
                <li>user(message, details?)</li>
                <li>security(message, details?)</li>
                <li>window(message, details?)</li>
                <li>dispatchError(type, context)</li>
              </ul>
            </div>
            <div className="p-4 bg-black/40 border border-white/10 rounded-lg">
              <h5 className="font-semibold text-foreground mb-2">Error Type Constants</h5>
              <ul className="text-sm text-muted-foreground space-y-1 font-mono">
                <li>FILE_NOT_FOUND</li>
                <li>STORAGE_ERROR</li>
                <li>PERMISSION_DENIED</li>
                <li>CONNECTION_FAILED</li>
                <li>PROCESS_CRASH</li>
                <li>MEMORY_OVERFLOW</li>
                <li>TIMEOUT</li>
                <li>INVALID_OPERATION</li>
              </ul>
            </div>
          </div>
        </section>

        {/* System Bus API */}
        <section id="system-bus-api" className="space-y-4">
          <h3 className="text-2xl font-bold border-b border-white/10 pb-2">10. System Bus API</h3>
          <p className="text-muted-foreground">
            The System Bus enables cross-component communication for system-level events like crashes, bugchecks, and lockdowns
            without opening new browser windows.
          </p>
          
          <div className="p-4 bg-black/60 border border-white/10 rounded-lg">
            <pre className="text-sm text-cyan-400 overflow-x-auto">
{`import { systemBus } from "@/lib/systemBus";

// Trigger system events
systemBus.triggerCrash("KERNEL_PANIC", "critical.exe");
systemBus.triggerBugcheck("MEMORY_PRESSURE", "Out of memory");
systemBus.triggerLockdown("ALPHA");
systemBus.enterRecovery();
systemBus.triggerReboot();
systemBus.triggerShutdown();
systemBus.openDevMode();

// Listen for events
const unsubscribe = systemBus.on("TRIGGER_CRASH", (event) => {
  console.log("Crash triggered:", event.payload);
});

// Listen for all events
systemBus.onAny((event) => {
  console.log("System event:", event.type, event.payload);
});`}
            </pre>
          </div>

          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg mt-4">
            <h5 className="font-semibold text-amber-400 mb-2">Admin Panel Integration</h5>
            <p className="text-sm text-muted-foreground">
              The Admin Panel uses the System Bus to trigger crashes and bugchecks in the current window instead of opening
              new browser tabs. This provides a more seamless experience and allows for proper state management.
            </p>
          </div>
        </section>

        {/* Bugcheck System */}
        <section id="bugcheck-system" className="space-y-4">
          <h3 className="text-2xl font-bold border-b border-white/10 pb-2">11. Bugcheck System</h3>
          <p className="text-muted-foreground">
            UrbanShade OS includes a bugcheck system that monitors for fatal errors and system anomalies. 
            When detected, the system generates a bugcheck report and displays a crash screen.
          </p>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Monitored Conditions</h4>
            <div className="grid gap-3">
              {[
                { code: "ICON_COLLISION_FATAL", desc: "Multiple desktop icons occupy the same position for extended periods" },
                { code: "RENDER_LOOP_DETECTED", desc: "Component enters infinite render cycle consuming resources" },
                { code: "MEMORY_PRESSURE", desc: "Excessive localStorage or state accumulation detected" },
                { code: "UNHANDLED_EXCEPTION", desc: "Critical JavaScript errors that escape error boundaries" },
                { code: "STATE_CORRUPTION", desc: "System state data became inconsistent or corrupted" },
                { code: "INFINITE_LOOP", desc: "Process entered an infinite loop and had to be terminated" },
              ].map(({ code, desc }) => (
                <div key={code} className="p-3 bg-black/40 border border-white/10 rounded-lg flex items-start gap-3">
                  <Bug className="w-4 h-4 text-red-400 mt-1" />
                  <div>
                    <code className="text-red-400 font-mono text-sm">{code}</code>
                    <p className="text-sm text-muted-foreground mt-1">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-black/60 border border-white/10 rounded-lg mt-4">
            <h5 className="font-semibold text-foreground mb-2">Creating Bugchecks Programmatically</h5>
            <pre className="text-sm text-cyan-400 overflow-x-auto">
{`import { createBugcheck, BUGCHECK_CODES } from "@/components/BugcheckScreen";

const bugcheck = createBugcheck(
  BUGCHECK_CODES.MEMORY_PRESSURE,
  "Too many items stored in localStorage",
  "StorageManager.save()",
  new Error().stack
);`}
            </pre>
          </div>
        </section>

        {/* Advanced Functions */}
        <section id="advanced-functions" className="space-y-4">
          <h3 className="text-2xl font-bold border-b border-white/10 pb-2">12. Advanced Functions</h3>
          <div className="grid gap-4">
            <div className="p-4 bg-black/40 border border-white/10 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Server className="w-5 h-5 text-cyan-400" />
                <h4 className="font-semibold">System State Snapshots</h4>
              </div>
              <p className="text-muted-foreground text-sm">
                Capture complete system state including all localStorage, settings, installed apps, and window positions.
                Use for debugging, creating restore points, or sharing configurations.
              </p>
            </div>
            <div className="p-4 bg-black/40 border border-white/10 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Network className="w-5 h-5 text-green-400" />
                <h4 className="font-semibold">Event Bus Monitoring</h4>
              </div>
              <p className="text-muted-foreground text-sm">
                Monitor all custom events dispatched across the system via both the Action Dispatcher and System Bus.
                Useful for debugging inter-component communication and understanding system behavior.
              </p>
            </div>
            <div className="p-4 bg-black/40 border border-white/10 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Cpu className="w-5 h-5 text-purple-400" />
                <h4 className="font-semibold">Performance Metrics</h4>
              </div>
              <p className="text-muted-foreground text-sm">
                Track localStorage size, active windows, memory usage (when available), and event throughput 
                to identify performance bottlenecks and resource issues.
              </p>
            </div>
            <div className="p-4 bg-black/40 border border-white/10 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-5 h-5 text-amber-400" />
                <h4 className="font-semibold">Emergency Admin Access</h4>
              </div>
              <p className="text-muted-foreground text-sm">
                Recovery Discs (.usd files) provide emergency admin access when the system is severely corrupted.
                This includes creating emergency admin accounts, clearing all accounts, and resetting restrictions.
              </p>
            </div>
          </div>
        </section>

        {/* Troubleshooting */}
        <section id="troubleshooting" className="space-y-4">
          <h3 className="text-2xl font-bold border-b border-white/10 pb-2">13. Troubleshooting</h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-black/40 border border-white/10 rounded-lg">
              <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                DEF-DEV won't open
              </h4>
              <p className="text-sm text-muted-foreground mb-2">Make sure Developer Mode is enabled:</p>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>Check Settings → Developer Options</li>
                <li>Try enabling via browser console: <code className="px-1 bg-black/50 rounded">devMode()</code></li>
                <li>Enter Recovery Mode and select Developer Mode option</li>
              </ul>
            </div>

            <div className="p-4 bg-black/40 border border-white/10 rounded-lg">
              <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                Actions not being logged
              </h4>
              <p className="text-sm text-muted-foreground mb-2">Actions require the Action Dispatcher to be imported and used:</p>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>Ensure the component imports from <code className="px-1 bg-black/50 rounded">@/lib/actionDispatcher</code></li>
                <li>Check if persistence is enabled if you need history across sessions</li>
                <li>The Action Logger may not capture all legacy console.log calls</li>
              </ul>
            </div>

            <div className="p-4 bg-black/40 border border-white/10 rounded-lg">
              <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-cyan-400" />
                Storage appears empty or corrupted
              </h4>
              <p className="text-sm text-muted-foreground mb-2">localStorage issues can have several causes:</p>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>Private/Incognito browsing mode blocks localStorage</li>
                <li>Storage quota may be exceeded (try clearing some data)</li>
                <li>Browser extensions may interfere with storage access</li>
                <li>Try using the Quick Reset option in Recovery Mode</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Best Practices */}
        <section id="best-practices" className="space-y-4">
          <h3 className="text-2xl font-bold border-b border-white/10 pb-2">14. Best Practices</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-400 mb-2" />
              <h4 className="font-semibold text-green-400 mb-2">Do</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use specific action types for categorization</li>
                <li>• Include relevant details in action payloads</li>
                <li>• Create recovery images before major changes</li>
                <li>• Use Simple View for initial error triage</li>
                <li>• Export logs before clearing them</li>
              </ul>
            </div>
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-400 mb-2" />
              <h4 className="font-semibold text-red-400 mb-2">Don't</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Log sensitive information (passwords, tokens)</li>
                <li>• Spam actions in tight loops (use throttling)</li>
                <li>• Ignore bugcheck reports (they indicate real issues)</li>
                <li>• Delete recovery images without a backup</li>
                <li>• Disable security features in production</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Warning */}
        <section className="p-6 bg-amber-500/10 border border-amber-500/30 rounded-lg space-y-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-400" />
            <h3 className="text-xl font-bold text-amber-400">Important Warnings</h3>
          </div>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-amber-400">•</span>
              <span>DEF-DEV is a powerful debugging tool intended for developers. Incorrect use may cause system instability.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400">•</span>
              <span>Loading recovery images will overwrite ALL current localStorage data. Always create a backup first.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400">•</span>
              <span>Clearing storage cannot be undone. Make sure to export important data before clearing.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400">•</span>
              <span>Some features require Developer Mode to be enabled. This is a security measure to prevent accidental access.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400">•</span>
              <span>The System Bus can trigger real crashes and bugchecks. Use with caution during active work.</span>
            </li>
          </ul>
        </section>

        {/* Footer */}
        <section className="text-center text-sm text-muted-foreground py-8 border-t border-white/10">
          <p>DEF-DEV Console Documentation • UrbanShade OS v2.0</p>
          <p className="mt-2">For additional help, access Recovery Mode (F2 during boot) or contact the development team.</p>
        </section>
      </main>
    </div>
  );
};

export default DefDevDocs;