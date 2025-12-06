import { useEffect, useState } from "react";
import { AlertTriangle, Copy, Download, RefreshCw, Bug, Terminal } from "lucide-react";
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

// Real bugcheck codes for actual system errors
export const BUGCHECK_CODES = {
  // Desktop/UI related
  DESKTOP_MALFUNC: { hex: "0x00000001", severity: "HIGH", category: "Desktop" },
  RENDER_FAILURE: { hex: "0x00000002", severity: "HIGH", category: "Rendering" },
  ICON_COLLISION: { hex: "0x00000003", severity: "MEDIUM", category: "Desktop" },
  WINDOW_OVERFLOW: { hex: "0x00000004", severity: "MEDIUM", category: "Window Manager" },
  
  // Data related
  DATA_INCORRECT: { hex: "0x00000010", severity: "CRITICAL", category: "Data Integrity" },
  STATE_CORRUPTION: { hex: "0x00000011", severity: "CRITICAL", category: "State" },
  STORAGE_OVERFLOW: { hex: "0x00000012", severity: "HIGH", category: "Storage" },
  PARSE_FAILURE: { hex: "0x00000013", severity: "HIGH", category: "Data" },
  
  // System related
  KERNEL_PANIC: { hex: "0x00000020", severity: "CRITICAL", category: "Kernel" },
  MEMORY_EXHAUSTED: { hex: "0x00000021", severity: "CRITICAL", category: "Memory" },
  INFINITE_LOOP: { hex: "0x00000022", severity: "HIGH", category: "Process" },
  STACK_OVERFLOW: { hex: "0x00000023", severity: "CRITICAL", category: "Stack" },
  
  // Developer triggered
  DEV_ERR: { hex: "0x000000FF", severity: "INFO", category: "Developer" },
  DEV_TEST: { hex: "0x000000FE", severity: "INFO", category: "Developer" },
  
  // Generic
  UNHANDLED_EXCEPTION: { hex: "0x00000099", severity: "HIGH", category: "Exception" },
  UNKNOWN_FATAL: { hex: "0x000000DE", severity: "CRITICAL", category: "Unknown" },
} as const;

export const BugcheckScreen = ({ bugcheck, onRestart, onReportToDev }: BugcheckScreenProps) => {
  const [copied, setCopied] = useState(false);

  const copyReport = () => {
    const report = JSON.stringify(bugcheck, null, 2);
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  const codeInfo = BUGCHECK_CODES[bugcheck.code as keyof typeof BUGCHECK_CODES] || {
    hex: "0x000000DE",
    severity: "UNKNOWN",
    category: "Unknown"
  };

  return (
    <div className="fixed inset-0 bg-[#0a0a0c] text-gray-100 flex flex-col font-mono z-[9999] overflow-hidden">
      {/* Subtle stress indicator - just a red border pulse */}
      <div className="absolute inset-0 border-4 border-red-600/60 pointer-events-none animate-pulse" style={{ animationDuration: '2s' }} />

      {/* Header */}
      <div className="bg-red-900/80 px-6 py-4 border-b border-red-600/60">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <AlertTriangle className="w-8 h-8 text-red-400" />
          <div>
            <h1 className="text-xl font-bold text-red-400">SYSTEM BUGCHECK</h1>
            <p className="text-xs text-red-300/70">The system has been halted to prevent data corruption</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Critical Warning - Real, not fake */}
          <div className="p-4 bg-red-950/50 border border-red-600/50 rounded-lg">
            <h2 className="text-sm font-bold text-red-400 mb-2">⚠ REAL ERROR - NOT A SIMULATION</h2>
            <p className="text-xs text-red-200/80 leading-relaxed">
              This is an actual unrecoverable error in the application. The system force-crashed to prevent 
              save corruption or further damage. This is NOT part of the game or a joke.
            </p>
          </div>

          {/* Error Details - Just the real data */}
          <div className="p-4 bg-black/60 border border-gray-700 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 text-xs">STOP CODE</span>
                <div className="text-lg font-bold text-red-400">{bugcheck.code}</div>
              </div>
              <div>
                <span className="text-gray-500 text-xs">HEX</span>
                <div className="text-lg font-mono text-cyan-400">{codeInfo.hex}</div>
              </div>
              <div>
                <span className="text-gray-500 text-xs">SEVERITY</span>
                <div className={`text-sm font-bold ${
                  codeInfo.severity === 'CRITICAL' ? 'text-red-400' :
                  codeInfo.severity === 'HIGH' ? 'text-orange-400' :
                  codeInfo.severity === 'MEDIUM' ? 'text-yellow-400' :
                  'text-gray-400'
                }`}>{codeInfo.severity}</div>
              </div>
              <div>
                <span className="text-gray-500 text-xs">CATEGORY</span>
                <div className="text-sm text-gray-300">{codeInfo.category}</div>
              </div>
            </div>
          </div>

          {/* Error Description */}
          <div className="p-4 bg-black/40 border border-gray-700/50 rounded-lg">
            <span className="text-gray-500 text-xs">ERROR DESCRIPTION</span>
            <p className="text-sm text-gray-200 mt-1">{bugcheck.description}</p>
            {bugcheck.location && (
              <div className="mt-2 text-xs text-gray-500">
                Location: <span className="text-gray-400 font-mono">{bugcheck.location}</span>
              </div>
            )}
          </div>

          {/* Timestamp */}
          <div className="text-xs text-gray-500">
            Occurred at: <span className="text-gray-400">{new Date(bugcheck.timestamp).toLocaleString()}</span>
          </div>

          {/* Stack Trace if available */}
          {bugcheck.stackTrace && (
            <div className="p-4 bg-black/60 border border-gray-700 rounded-lg">
              <span className="text-gray-500 text-xs">STACK TRACE</span>
              <pre className="text-xs text-gray-400 mt-2 overflow-x-auto whitespace-pre-wrap font-mono max-h-40 overflow-y-auto">
                {bugcheck.stackTrace}
              </pre>
            </div>
          )}

          {/* System Info if available */}
          {bugcheck.systemInfo && Object.keys(bugcheck.systemInfo).length > 0 && (
            <div className="p-4 bg-black/40 border border-gray-700/50 rounded-lg">
              <span className="text-gray-500 text-xs">SYSTEM INFO</span>
              <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                {Object.entries(bugcheck.systemInfo).map(([key, value]) => (
                  <div key={key}>
                    <span className="text-gray-500">{key}: </span>
                    <span className="text-gray-300 font-mono">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DEF-DEV Notice */}
          <div className="p-3 bg-amber-950/30 border border-amber-600/30 rounded-lg text-xs text-amber-300/80">
            <Bug className="w-4 h-4 inline mr-2 text-amber-400" />
            This error has been logged. Open DEF-DEV Console to view details and share with developers.
          </div>
        </div>
      </div>

      {/* Actions Footer */}
      <div className="border-t border-gray-700 bg-black/80 p-4">
        <div className="max-w-4xl mx-auto flex flex-wrap gap-3 justify-center">
          <button
            onClick={copyReport}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm border border-gray-600"
          >
            <Copy className="w-4 h-4" />
            {copied ? "Copied!" : "Copy Report"}
          </button>
          <button
            onClick={downloadReport}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm border border-gray-600"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          <button
            onClick={onReportToDev}
            className="flex items-center gap-2 px-4 py-2 bg-amber-700 hover:bg-amber-600 rounded text-sm border border-amber-500"
          >
            <Terminal className="w-4 h-4" />
            Open DEF-DEV
          </button>
          <button
            onClick={onRestart}
            className="flex items-center gap-2 px-5 py-2 bg-red-700 hover:bg-red-600 rounded text-sm font-bold border border-red-500"
          >
            <RefreshCw className="w-4 h-4" />
            RESTART
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper to create bugcheck
export const createBugcheck = (
  code: keyof typeof BUGCHECK_CODES | string, 
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
    userAgent: navigator.userAgent.slice(0, 80),
    localStorage: `${localStorage.length} entries`,
    url: window.location.pathname,
    screenSize: `${window.innerWidth}x${window.innerHeight}`,
  }
});
