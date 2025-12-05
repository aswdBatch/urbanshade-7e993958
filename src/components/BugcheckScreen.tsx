import { useEffect, useState } from "react";
import { AlertTriangle, Copy, Download, RefreshCw, Bug, Info, FileWarning, Terminal, Clock, MapPin, Cpu, HardDrive } from "lucide-react";
import { toast } from "sonner";

export interface BugcheckData {
  code: string;
  description: string;
  timestamp: string;
  location?: string;
  stackTrace?: string;
  systemInfo?: Record<string, string>;
}

interface BugcheckScreenProps {
  bugcheck: BugcheckData;
  onRestart: () => void;
  onReportToDev: () => void;
}

export const BugcheckScreen = ({ bugcheck, onRestart, onReportToDev }: BugcheckScreenProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showStackTrace, setShowStackTrace] = useState(false);

  const copyReport = () => {
    const report = JSON.stringify(bugcheck, null, 2);
    navigator.clipboard.writeText(report);
    toast.success("Bugcheck report copied to clipboard");
  };

  const downloadReport = () => {
    const report = JSON.stringify(bugcheck, null, 2);
    const blob = new Blob([report], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bugcheck_${bugcheck.code}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Save bugcheck to localStorage for DEF-DEV
  useEffect(() => {
    const existing = localStorage.getItem('urbanshade_bugchecks');
    const bugchecks = existing ? JSON.parse(existing) : [];
    bugchecks.push(bugcheck);
    localStorage.setItem('urbanshade_bugchecks', JSON.stringify(bugchecks.slice(-50)));
  }, [bugcheck]);

  // Get readable explanation based on bugcheck code
  const getReadableExplanation = (code: string): { title: string; explanation: string; severity: string; fix: string } => {
    const explanations: Record<string, { title: string; explanation: string; severity: string; fix: string }> = {
      ICON_COLLISION_FATAL: {
        title: "Desktop Layout Conflict",
        explanation: "Multiple desktop icons tried to occupy the same position for too long, causing the system to enter an unstable state.",
        severity: "MEDIUM",
        fix: "The system will reset icon positions on restart. If this persists, try resetting desktop settings."
      },
      RENDER_LOOP_DETECTED: {
        title: "Display Rendering Loop",
        explanation: "A component got stuck updating itself repeatedly, which would eventually consume all system resources.",
        severity: "HIGH",
        fix: "This is usually caused by a bug in the application. Try closing problematic apps before restart."
      },
      MEMORY_PRESSURE: {
        title: "Memory Exhaustion",
        explanation: "The system ran out of available memory due to too much data being stored or processed.",
        severity: "HIGH",
        fix: "Try clearing browser cache and localStorage. Reduce the number of open windows."
      },
      UNHANDLED_EXCEPTION: {
        title: "Unexpected Error",
        explanation: "An error occurred that the system wasn't prepared to handle, causing it to fail safely.",
        severity: "MEDIUM",
        fix: "This may be a bug. If reproducible, please report the steps that led to this error."
      },
      STATE_CORRUPTION: {
        title: "Data Integrity Failure",
        explanation: "System state data became corrupted or inconsistent, making it unsafe to continue.",
        severity: "CRITICAL",
        fix: "A system reset may be required. Try Recovery Mode if this happens repeatedly."
      },
      INFINITE_LOOP: {
        title: "Process Stuck",
        explanation: "A process entered an infinite loop and had to be terminated to prevent system freeze.",
        severity: "MEDIUM",
        fix: "The problematic process was stopped. If caused by a specific action, avoid that action."
      }
    };
    
    return explanations[code] || {
      title: "System Error",
      explanation: "An unexpected system error occurred that required the system to stop.",
      severity: "UNKNOWN",
      fix: "Try restarting the system. If the error persists, enter Recovery Mode."
    };
  };

  const readableInfo = getReadableExplanation(bugcheck.code);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL": return "text-red-400 bg-red-500/20 border-red-500/50";
      case "HIGH": return "text-orange-400 bg-orange-500/20 border-orange-500/50";
      case "MEDIUM": return "text-amber-400 bg-amber-500/20 border-amber-500/50";
      default: return "text-gray-400 bg-gray-500/20 border-gray-500/50";
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#1a0505] via-[#0d0d0d] to-[#1a0505] text-gray-100 flex flex-col font-mono z-[9999] overflow-hidden">
      {/* Animated background effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,50,50,0.1) 2px, rgba(255,50,50,0.1) 4px)'
        }} />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent animate-pulse" />
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-red-900/60 via-red-800/40 to-red-900/60 border-b border-red-500/40 px-6 py-5">
        <div className="max-w-4xl mx-auto flex items-center gap-5">
          <div className="relative">
            <div className="w-16 h-16 rounded-xl bg-red-500/10 border-2 border-red-500/60 flex items-center justify-center">
              <Bug className="w-8 h-8 text-red-400" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-red-400 tracking-wide">SYSTEM BUGCHECK</h1>
            <p className="text-sm text-red-300/70 mt-1">A critical error has occurred and the system was stopped</p>
          </div>
          <div className={`px-3 py-1.5 rounded-lg border ${getSeverityColor(readableInfo.severity)}`}>
            <span className="text-xs font-bold">SEVERITY: {readableInfo.severity}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          
          {/* CRITICAL WARNING - NOT A SIMULATION */}
          <div className="p-5 bg-red-900/30 border-2 border-red-500/50 rounded-xl">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-red-400 flex-shrink-0 animate-pulse" />
              <div className="space-y-2">
                <h2 className="text-lg font-bold text-red-400">This is NOT a simulation</h2>
                <p className="text-sm text-red-200/80 leading-relaxed">
                  A real error occurred in the system. This bugcheck screen was triggered because something went wrong
                  that couldn't be recovered from automatically. The error has been logged and can be reported for debugging.
                </p>
                <p className="text-xs text-red-300/60 mt-2">
                  If you can reproduce this error, please note the steps that led to it before reporting.
                </p>
              </div>
            </div>
          </div>

          {/* Error Code Display */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-5 bg-black/50 border border-red-500/30 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <FileWarning className="w-4 h-4 text-red-400" />
                <span className="text-xs text-red-400/70 uppercase tracking-wider font-semibold">Bugcheck Code</span>
              </div>
              <div className="text-2xl font-bold text-red-400 font-mono break-all">{bugcheck.code}</div>
              <div className="text-sm text-gray-400 mt-2">{readableInfo.title}</div>
            </div>

            <div className="p-5 bg-black/50 border border-white/10 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Timestamp</span>
              </div>
              <div className="text-lg font-mono text-gray-300">
                {new Date(bugcheck.timestamp).toLocaleString()}
              </div>
              {bugcheck.location && (
                <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                  <MapPin className="w-3 h-3" />
                  <span>{bugcheck.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* What Happened Section */}
          <div className="p-5 bg-black/40 border border-white/10 rounded-xl space-y-4">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-cyan-400" />
              <h3 className="font-bold text-cyan-400">What Happened?</h3>
            </div>
            <p className="text-gray-300 leading-relaxed">{readableInfo.explanation}</p>
            <div className="p-4 bg-black/30 rounded-lg border border-white/5">
              <div className="text-xs text-gray-500 uppercase mb-2 font-semibold">Original Error Message</div>
              <p className="text-gray-400 text-sm">{bugcheck.description}</p>
            </div>
          </div>

          {/* How to Fix Section */}
          <div className="p-5 bg-green-900/10 border border-green-500/30 rounded-xl space-y-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-green-400" />
              <h3 className="font-bold text-green-400">How to Fix This</h3>
            </div>
            <p className="text-green-200/80 text-sm leading-relaxed">{readableInfo.fix}</p>
          </div>

          {/* Technical Details Accordion */}
          <div className="border border-white/10 rounded-xl overflow-hidden">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full p-4 bg-gray-900/50 flex items-center justify-between hover:bg-gray-900/70 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Cpu className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-semibold text-gray-300">System Information</span>
              </div>
              <span className="text-xs text-gray-500">{showDetails ? "▼" : "▶"}</span>
            </button>
            
            {showDetails && bugcheck.systemInfo && (
              <div className="p-4 bg-black/60 border-t border-white/5 grid grid-cols-2 gap-3">
                {Object.entries(bugcheck.systemInfo).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-xs">
                    <span className="text-gray-500">{key}</span>
                    <span className="text-gray-300 font-mono">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stack Trace Accordion */}
          {bugcheck.stackTrace && (
            <div className="border border-white/10 rounded-xl overflow-hidden">
              <button
                onClick={() => setShowStackTrace(!showStackTrace)}
                className="w-full p-4 bg-gray-900/50 flex items-center justify-between hover:bg-gray-900/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <HardDrive className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-semibold text-gray-300">Stack Trace (Technical)</span>
                </div>
                <span className="text-xs text-gray-500">{showStackTrace ? "▼" : "▶"}</span>
              </button>
              
              {showStackTrace && (
                <div className="p-4 bg-black/60 border-t border-white/5">
                  <pre className="text-xs text-gray-400 overflow-x-auto whitespace-pre-wrap font-mono">
                    {bugcheck.stackTrace}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* DEF-DEV Info */}
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5" />
              <div>
                <p className="text-sm text-amber-300/90 font-medium mb-1">
                  This error has been logged to DEF-DEV
                </p>
                <p className="text-xs text-amber-300/60">
                  You can view this and other bugcheck reports in the DEF-DEV Console under "Bugcheck Reports".
                  Share the report with developers for analysis if needed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Footer */}
      <div className="border-t border-white/10 bg-black/60 p-5">
        <div className="max-w-4xl mx-auto flex flex-wrap gap-3 justify-center">
          <button
            onClick={copyReport}
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm"
          >
            <Copy className="w-4 h-4" />
            Copy Report
          </button>
          <button
            onClick={downloadReport}
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            Download Report
          </button>
          <button
            onClick={onReportToDev}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-600/80 hover:bg-amber-500 rounded-lg transition-colors text-white text-sm font-medium"
          >
            <Bug className="w-4 h-4" />
            Open DEF-DEV
          </button>
          <button
            onClick={onRestart}
            className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-500 rounded-lg transition-colors text-white font-semibold text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Restart System
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-6 py-3 bg-black/80 text-center text-xs text-gray-600 border-t border-white/5">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <span>URBANSHADE OS Bugcheck Handler • Build 22621.2428</span>
          <span>{new Date().toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

// Helper to create bugcheck
export const createBugcheck = (
  code: string, 
  description: string, 
  location?: string,
  stackTrace?: string
): BugcheckData => ({
  code,
  description,
  timestamp: new Date().toISOString(),
  location,
  stackTrace,
  systemInfo: {
    userAgent: navigator.userAgent.slice(0, 100),
    localStorage: `${localStorage.length} entries`,
    memory: (performance as any).memory?.usedJSHeapSize 
      ? `${Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024)}MB` 
      : 'N/A',
    url: window.location.pathname
  }
});

// Bugcheck codes
export const BUGCHECK_CODES = {
  ICON_COLLISION_FATAL: "ICON_COLLISION_FATAL",
  RENDER_LOOP_DETECTED: "RENDER_LOOP_DETECTED", 
  MEMORY_PRESSURE: "MEMORY_PRESSURE",
  UNHANDLED_EXCEPTION: "UNHANDLED_EXCEPTION",
  STATE_CORRUPTION: "STATE_CORRUPTION",
  INFINITE_LOOP: "INFINITE_LOOP"
} as const;