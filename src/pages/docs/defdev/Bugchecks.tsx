import { ArrowLeft, Bug, AlertTriangle, FileWarning, ExternalLink, ChevronRight, AlertCircle, Info, ShieldAlert, Skull } from "lucide-react";
import { Link } from "react-router-dom";

const DefDevBugchecks = () => {
  const bugcheckTypes = [
    { code: "DESKTOP_MALFUNC", hex: "0x00000001", severity: "high", description: "Desktop layout or rendering failure" },
    { code: "RENDER_FAILURE", hex: "0x00000002", severity: "high", description: "Component failed to render correctly" },
    { code: "ICON_COLLISION", hex: "0x00000003", severity: "medium", description: "Multiple icons occupying same position" },
    { code: "WINDOW_OVERFLOW", hex: "0x00000004", severity: "medium", description: "Too many windows or window state error" },
    { code: "DATA_INCORRECT", hex: "0x00000010", severity: "critical", description: "Data validation failed, corrupt data detected" },
    { code: "STATE_CORRUPTION", hex: "0x00000011", severity: "critical", description: "Application state became inconsistent" },
    { code: "STORAGE_OVERFLOW", hex: "0x00000012", severity: "high", description: "LocalStorage quota exceeded" },
    { code: "PARSE_FAILURE", hex: "0x00000013", severity: "high", description: "Failed to parse stored data (JSON error)" },
    { code: "KERNEL_PANIC", hex: "0x00000020", severity: "critical", description: "Core system failure, unrecoverable" },
    { code: "MEMORY_EXHAUSTED", hex: "0x00000021", severity: "critical", description: "Browser memory limit reached" },
    { code: "INFINITE_LOOP", hex: "0x00000022", severity: "high", description: "Process stuck in infinite loop" },
    { code: "STACK_OVERFLOW", hex: "0x00000023", severity: "critical", description: "Call stack exceeded maximum size" },
    { code: "DEV_ERR", hex: "0x000000FF", severity: "info", description: "Developer-triggered test error" },
    { code: "UNHANDLED_EXCEPTION", hex: "0x00000099", severity: "high", description: "Uncaught exception propagated to top level" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-amber-400">Bugchecks</h1>
            <span className="text-xs text-muted-foreground">/ DEF-DEV Documentation</span>
          </div>
          <Link 
            to="/docs/def-dev" 
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:bg-amber-500/30 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to DEF-DEV
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-12 space-y-12">
        {/* Title */}
        <section className="space-y-4">
          <p className="text-sm text-gray-500 italic">(No jokes unfortunately)</p>
          <div className="flex items-center gap-3">
            <Bug className="w-10 h-10 text-red-400" />
            <h2 className="text-4xl font-bold text-amber-400">Bugchecks</h2>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Understanding real system errors and how to debug them.
          </p>
        </section>

        {/* CRITICAL: What is a Bugcheck */}
        <section className="space-y-6">
          <h3 className="text-2xl font-bold border-b border-white/10 pb-2">What is a Bugcheck?</h3>
          <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-xl">
            <div className="flex items-start gap-4">
              <ShieldAlert className="w-6 h-6 text-red-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-3">
                <h4 className="font-bold text-red-400">THESE ARE REAL ERRORS</h4>
                <p className="text-muted-foreground">
                  A <strong className="text-foreground">bugcheck</strong> in UrbanShade OS is a <strong className="text-red-400">real, unrecoverable error</strong> that 
                  forces the system to halt immediately. Unlike the themed crash screens which are part of the simulation, 
                  a bugcheck indicates that something has genuinely gone wrong in the application code.
                </p>
                <p className="text-muted-foreground">
                  When a bugcheck occurs, the system <strong className="text-foreground">force crashes</strong> to prevent:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• <strong className="text-red-300">Save corruption</strong> - Your data could become unreadable</li>
                  <li>• <strong className="text-red-300">State desync</strong> - The application could enter an inconsistent state</li>
                  <li>• <strong className="text-red-300">Cascading failures</strong> - One error leading to many more</li>
                  <li>• <strong className="text-red-300">User experience destruction</strong> - Complete UX breakdown</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5" />
              <div>
                <p className="text-sm text-amber-200/80">
                  <strong>If you see a bugcheck screen, something is actually broken.</strong> Please report it to developers 
                  with the error details so we can fix it.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* When Bugchecks Trigger */}
        <section className="space-y-6">
          <h3 className="text-2xl font-bold border-b border-white/10 pb-2">When Do Bugchecks Occur?</h3>
          <p className="text-muted-foreground">
            Bugchecks are triggered automatically when the system detects conditions that would cause severe problems:
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-black/40 border border-red-500/30 rounded-lg">
              <h4 className="font-bold text-red-400 mb-3 flex items-center gap-2">
                <Skull className="w-5 h-5" />
                Data Corruption Risks
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-3 h-3 text-red-400 mt-1" />
                  JSON parse failures on critical data
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-3 h-3 text-red-400 mt-1" />
                  LocalStorage write failures
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-3 h-3 text-red-400 mt-1" />
                  State object becoming undefined unexpectedly
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-3 h-3 text-red-400 mt-1" />
                  Conflicting writes to same storage key
                </li>
              </ul>
            </div>

            <div className="p-4 bg-black/40 border border-orange-500/30 rounded-lg">
              <h4 className="font-bold text-orange-400 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                UX-Breaking Issues
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-3 h-3 text-orange-400 mt-1" />
                  Desktop icons all in same position for 3+ seconds
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-3 h-3 text-orange-400 mt-1" />
                  Window manager losing track of windows
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-3 h-3 text-orange-400 mt-1" />
                  Infinite re-render loops detected
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-3 h-3 text-orange-400 mt-1" />
                  Critical component failing to mount
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Bugcheck Codes */}
        <section className="space-y-6">
          <h3 className="text-2xl font-bold border-b border-white/10 pb-2">Bugcheck Codes</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 font-semibold text-amber-400">Stop Code</th>
                  <th className="text-left py-3 px-4 font-semibold text-amber-400">Hex</th>
                  <th className="text-left py-3 px-4 font-semibold text-amber-400">Severity</th>
                  <th className="text-left py-3 px-4 font-semibold text-amber-400">Description</th>
                </tr>
              </thead>
              <tbody>
                {bugcheckTypes.map((bc) => (
                  <tr key={bc.code} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-mono text-foreground">{bc.code}</td>
                    <td className="py-3 px-4 font-mono text-cyan-400">{bc.hex}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        bc.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                        bc.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                        bc.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {bc.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{bc.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Testing Bugchecks */}
        <section className="space-y-6">
          <h3 className="text-2xl font-bold border-b border-white/10 pb-2">Testing Bugchecks (For Developers)</h3>
          <p className="text-muted-foreground">
            Developers can manually trigger bugchecks for testing using DEF-DEV:
          </p>
          
          <div className="p-4 bg-black/40 border border-white/10 rounded-lg">
            <h4 className="font-bold text-foreground mb-3">Terminal Commands</h4>
            <div className="space-y-2 font-mono bg-black/50 p-3 rounded-lg text-sm">
              <p><span className="text-green-400">$</span> bugcheck DEV_TEST "Testing bugcheck system"</p>
              <p><span className="text-green-400">$</span> bugcheck KERNEL_PANIC "Simulated kernel failure"</p>
              <p><span className="text-green-400">$</span> sudo set bugcheck 0 <span className="text-gray-500"># Disables bugchecks until refresh</span></p>
            </div>
          </div>
        </section>

        {/* Viewing Reports */}
        <section className="space-y-6">
          <h3 className="text-2xl font-bold border-b border-white/10 pb-2">Viewing Bugcheck Reports</h3>
          <div className="p-4 bg-black/40 border border-white/10 rounded-lg">
            <p className="text-muted-foreground mb-4">
              All bugchecks are automatically saved to localStorage and visible in DEF-DEV:
            </p>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-amber-500/20 rounded text-center text-xs leading-5 text-amber-400 flex-shrink-0">1</span>
                Navigate to <code className="px-1 bg-black/50 rounded">/def-dev</code>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-amber-500/20 rounded text-center text-xs leading-5 text-amber-400 flex-shrink-0">2</span>
                Click the "Bugchecks" tab
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-amber-500/20 rounded text-center text-xs leading-5 text-amber-400 flex-shrink-0">3</span>
                View, export, or clear bugcheck reports
              </li>
            </ol>
          </div>
        </section>

        {/* Navigation */}
        <section className="flex flex-wrap gap-4 pt-8 border-t border-white/10">
          <Link
            to="/docs/def-dev/admin"
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Admin Panel
          </Link>
          <Link
            to="/docs/def-dev/api"
            className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded-lg text-sm text-amber-400 transition-colors ml-auto"
          >
            API Reference
            <ExternalLink className="w-4 h-4" />
          </Link>
        </section>
      </main>
    </div>
  );
};

export default DefDevBugchecks;
