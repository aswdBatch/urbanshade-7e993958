import { ArrowLeft, Package, Star, Search, Terminal, Monitor, Layers, Shield, Volume2, Bug, FileText, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const Features = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-foreground">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary">New Features Guide</h1>
          <Link 
            to="/docs" 
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Docs
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        <section className="text-center space-y-4">
          <Zap className="w-16 h-16 mx-auto text-primary" />
          <h2 className="text-4xl font-bold">Latest Features</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            UrbanShade OS has received a major update with tons of new features to enhance 
            your facility management experience.
          </p>
        </section>

        {/* UUR Features */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-cyan-400" />
            <h3 className="text-2xl font-bold">UUR Package Manager</h3>
          </div>
          <div className="p-6 rounded-lg bg-cyan-500/10 border border-cyan-500/30 space-y-4">
            <p className="text-muted-foreground">
              The UrbanShade User Repository has been enhanced with powerful new features.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-900/50 rounded-lg">
                <h4 className="font-bold text-cyan-400 mb-2 flex items-center gap-2">
                  <Star className="w-4 h-4" /> Ratings & Reviews
                </h4>
                <p className="text-sm text-muted-foreground">
                  Rate packages 1-5 stars and leave reviews to help others find quality packages.
                </p>
              </div>
              <div className="p-4 bg-slate-900/50 rounded-lg">
                <h4 className="font-bold text-cyan-400 mb-2 flex items-center gap-2">
                  <Package className="w-4 h-4" /> Package Categories
                </h4>
                <p className="text-sm text-muted-foreground">
                  Browse packages by category: Apps, Utilities, Themes, Extensions, Games, and more.
                </p>
              </div>
              <div className="p-4 bg-slate-900/50 rounded-lg">
                <h4 className="font-bold text-cyan-400 mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4" /> Featured Packages
                </h4>
                <p className="text-sm text-muted-foreground">
                  Discover curated packages in the Featured section, hand-picked by the UUR team.
                </p>
              </div>
              <div className="p-4 bg-slate-900/50 rounded-lg">
                <h4 className="font-bold text-cyan-400 mb-2 flex items-center gap-2">
                  <Layers className="w-4 h-4" /> Dependencies
                </h4>
                <p className="text-sm text-muted-foreground">
                  Packages can now declare dependencies. The system auto-installs required packages.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* DEF-DEV Features */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Bug className="w-8 h-8 text-amber-400" />
            <h3 className="text-2xl font-bold">DEF-DEV Console Enhancements</h3>
          </div>
          <div className="p-6 rounded-lg bg-amber-500/10 border border-amber-500/30 space-y-4">
            <p className="text-muted-foreground">
              Developer tools have been significantly upgraded with new debugging capabilities.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Search className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-400">Command Search</strong>
                  <p className="text-sm text-muted-foreground">
                    Search through all available DEF-DEV commands with fuzzy matching and descriptions.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-400">Export/Import Config</strong>
                  <p className="text-sm text-muted-foreground">
                    Save and restore your DEF-DEV preferences including filters, theme, and custom settings.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Terminal className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-400">Terminal Scripts</strong>
                  <p className="text-sm text-muted-foreground">
                    Save multiple terminal commands as a script and execute them with a single command.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </section>

        {/* Desktop Features */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Monitor className="w-8 h-8 text-purple-400" />
            <h3 className="text-2xl font-bold">Desktop Improvements</h3>
          </div>
          <div className="p-6 rounded-lg bg-purple-500/10 border border-purple-500/30 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-900/50 rounded-lg">
                <h4 className="font-bold text-purple-400 mb-2 flex items-center gap-2">
                  <Layers className="w-4 h-4" /> Multiple Desktops
                </h4>
                <p className="text-sm text-muted-foreground">
                  Create up to 8 virtual desktops to organize your windows. Switch with 
                  <kbd className="mx-1 px-1 py-0.5 bg-slate-800 rounded text-xs">Ctrl+Win+←/→</kbd>
                </p>
              </div>
              <div className="p-4 bg-slate-900/50 rounded-lg">
                <h4 className="font-bold text-purple-400 mb-2 flex items-center gap-2">
                  <Layers className="w-4 h-4" /> Window Groups
                </h4>
                <p className="text-sm text-muted-foreground">
                  Group related windows together. Minimize, restore, or close entire groups at once.
                </p>
              </div>
              <div className="p-4 bg-slate-900/50 rounded-lg">
                <h4 className="font-bold text-purple-400 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> File Associations
                </h4>
                <p className="text-sm text-muted-foreground">
                  Double-click files to open them with the right app. .txt → Notepad, .img → Image Editor.
                </p>
              </div>
              <div className="p-4 bg-slate-900/50 rounded-lg">
                <h4 className="font-bold text-purple-400 mb-2 flex items-center gap-2">
                  <Search className="w-4 h-4" /> Doc Search
                </h4>
                <p className="text-sm text-muted-foreground">
                  Search across all documentation from the docs page header. Find anything instantly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Bugcheck Features */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-red-400" />
            <h3 className="text-2xl font-bold">Crash & Recovery System</h3>
          </div>
          <div className="p-6 rounded-lg bg-red-500/10 border border-red-500/30 space-y-4">
            <p className="text-muted-foreground">
              Enhanced error handling and recovery options to keep your system safe.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-red-400">Bugcheck Severity Levels</strong>
                  <p className="text-sm text-muted-foreground">
                    Errors now have severity levels: WARNING (recoverable), CRITICAL (action needed), 
                    and FATAL (system halt). Each level has different behaviors.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-red-400">Crash Dump Files</strong>
                  <p className="text-sm text-muted-foreground">
                    Download detailed .dmp files with full crash information for debugging and reporting.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-red-400">Crash Recovery</strong>
                  <p className="text-sm text-muted-foreground">
                    After a crash, choose to restore from a recovery point or continue with current state.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </section>

        {/* Sound Effects */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Volume2 className="w-8 h-8 text-green-400" />
            <h3 className="text-2xl font-bold">Sound Effects</h3>
          </div>
          <div className="p-6 rounded-lg bg-green-500/10 border border-green-500/30 space-y-4">
            <p className="text-muted-foreground">
              Immersive audio feedback for system events (when enabled in Settings).
            </p>
            <ul className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
              <li>🔊 Boot sounds</li>
              <li>🔔 Notifications</li>
              <li>📧 Messages</li>
              <li>✓ Success</li>
              <li>⚠ Warnings</li>
              <li>❌ Errors</li>
              <li>🔐 Login/Logout</li>
              <li>📦 App open/close</li>
            </ul>
          </div>
        </section>

        <div className="flex justify-between pt-8 border-t border-white/10">
          <Link to="/docs/advanced" className="text-primary hover:underline">← Advanced Features</Link>
          <Link to="/docs/def-dev" className="text-primary hover:underline">DEF-DEV Guide →</Link>
        </div>
      </main>
    </div>
  );
};

export default Features;
