import { useState, useEffect } from "react";
import { Package, Check, Download, Settings, X } from "lucide-react";
import { toast } from "sonner";

interface GenericInstallerProps {
  appName?: string;
  appId?: string;
  installerId?: string;
  onComplete?: () => void;
}

export const GenericInstaller = ({ appName = "Application", appId, installerId, onComplete }: GenericInstallerProps) => {
  // Load installer data if not provided
  const installerData = (() => {
    if (appName && appId) return { appName, appId, installerId };
    
    const stored = localStorage.getItem('current_installer');
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        appName: parsed.appName || appName,
        appId: parsed.appId || appId,
        installerId: parsed.id || installerId
      };
    }
    return { appName, appId, installerId };
  })();
  const [stage, setStage] = useState<"welcome" | "configure" | "installing" | "complete">("welcome");
  const [progress, setProgress] = useState(0);
  const [installLocation, setInstallLocation] = useState("C:\\Program Files\\Urbanshade");
  const [options, setOptions] = useState({
    desktopShortcut: true,
    startMenu: true,
    quickLaunch: false,
    fileAssociations: true,
  });

  useEffect(() => {
    if (stage === "installing") {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setStage("complete"), 500);
            return 100;
          }
          return prev + 2;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [stage]);

  const handleInstall = () => {
    setStage("installing");
  };

  const handleFinish = () => {
    // Add to installed apps
    if (installerData.appId) {
      const installed = JSON.parse(localStorage.getItem('urbanshade_installed_apps') || '[]');
      if (!installed.includes(installerData.appId)) {
        installed.push(installerData.appId);
        localStorage.setItem('urbanshade_installed_apps', JSON.stringify(installed));
      }
    }

    // Remove installer from downloads
    if (installerData.installerId) {
      const installers = JSON.parse(localStorage.getItem('downloads_installers') || '[]');
      const updated = installers.filter((i: any) => i.id !== installerData.installerId);
      localStorage.setItem('downloads_installers', JSON.stringify(updated));
    }

    // Clear current installer data
    localStorage.removeItem('current_installer');

    if (options.startMenu) {
      toast.success(`${installerData.appName} installed successfully!`);
    }
    
    // Trigger storage event to update UI
    window.dispatchEvent(new Event('storage'));
    
    onComplete?.();
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-[#001f3f] via-[#003d5c] to-[#001f3f] text-white">
      {/* Header */}
      <div className="border-b border-[#0078D7]/30 bg-[#0078D7]/10 p-4 flex items-center gap-3">
        <Package className="w-6 h-6 text-[#0078D7]" />
        <div>
          <h1 className="text-lg font-bold">{installerData.appName} Setup</h1>
          <p className="text-xs opacity-70">Installation Wizard</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">
        {stage === "welcome" && (
          <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-[#0078D7]/20 rounded-full flex items-center justify-center border-2 border-[#0078D7] animate-scale-in">
                <Package className="w-12 h-12 text-[#0078D7]" />
              </div>
              <h2 className="text-2xl font-bold">Welcome to {installerData.appName} Setup</h2>
              <p className="text-gray-300">
                This wizard will guide you through the installation of {installerData.appName}.
              </p>
            </div>

            <div className="bg-[#0078D7]/10 border border-[#0078D7]/30 rounded-lg p-4">
              <p className="text-sm text-gray-300">
                It is recommended that you close all other applications before continuing.
                Click Next to continue, or Cancel to exit Setup.
              </p>
            </div>
          </div>
        )}

        {stage === "configure" && (
          <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
            <h2 className="text-xl font-bold mb-4">Installation Options</h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Install Location:</label>
                <input
                  type="text"
                  value={installLocation}
                  onChange={(e) => setInstallLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-black/40 border border-[#0078D7]/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#0078D7]/50"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 rounded bg-white/5 hover:bg-white/10 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={options.desktopShortcut}
                    onChange={(e) => setOptions({ ...options, desktopShortcut: e.target.checked })}
                    className="w-4 h-4 accent-[#0078D7]"
                  />
                  <div>
                    <div className="font-medium">Create desktop shortcut</div>
                    <div className="text-xs opacity-70">Add an icon to your desktop</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded bg-white/5 hover:bg-white/10 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={options.startMenu}
                    onChange={(e) => setOptions({ ...options, startMenu: e.target.checked })}
                    className="w-4 h-4 accent-[#0078D7]"
                  />
                  <div>
                    <div className="font-medium">Add to Start Menu</div>
                    <div className="text-xs opacity-70">Create Start Menu entry</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded bg-white/5 hover:bg-white/10 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={options.quickLaunch}
                    onChange={(e) => setOptions({ ...options, quickLaunch: e.target.checked })}
                    className="w-4 h-4 accent-[#0078D7]"
                  />
                  <div>
                    <div className="font-medium">Quick Launch toolbar</div>
                    <div className="text-xs opacity-70">Pin to taskbar</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded bg-white/5 hover:bg-white/10 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={options.fileAssociations}
                    onChange={(e) => setOptions({ ...options, fileAssociations: e.target.checked })}
                    className="w-4 h-4 accent-[#0078D7]"
                  />
                  <div>
                    <div className="font-medium">Register file associations</div>
                    <div className="text-xs opacity-70">Associate file types with this application</div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {stage === "installing" && (
          <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
            <div className="text-center space-y-4">
              <Download className="w-16 h-16 mx-auto text-[#0078D7] animate-pulse" />
              <h2 className="text-xl font-bold">Installing {installerData.appName}</h2>
              <p className="text-gray-300">Please wait while Setup installs {installerData.appName}...</p>
            </div>

            <div className="space-y-2">
              <div className="h-6 bg-white/10 rounded-full overflow-hidden border border-[#0078D7]/30">
                <div 
                  className="h-full bg-[#0078D7] transition-all duration-300 flex items-center justify-end pr-2"
                  style={{ width: `${progress}%` }}
                >
                  <span className="text-xs font-bold text-white">{progress}%</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 text-center">
                {progress < 30 && "Extracting files..."}
                {progress >= 30 && progress < 60 && "Installing components..."}
                {progress >= 60 && progress < 90 && "Configuring settings..."}
                {progress >= 90 && "Finalizing installation..."}
              </p>
            </div>
          </div>
        )}

        {stage === "complete" && (
          <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center border-2 border-green-500 animate-scale-in">
                <Check className="w-12 h-12 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold">Installation Complete</h2>
              <p className="text-gray-300">
                {installerData.appName} has been successfully installed on your computer.
              </p>
            </div>

            <div className="bg-[#0078D7]/10 border border-[#0078D7]/30 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500" />
                <span>Program files installed to <span className="font-mono text-xs">{installLocation}</span></span>
              </div>
              {options.desktopShortcut && (
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Desktop shortcut created</span>
                </div>
              )}
              {options.startMenu && (
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Added to Start Menu</span>
                </div>
              )}
              {options.quickLaunch && (
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Pinned to taskbar</span>
                </div>
              )}
              {options.fileAssociations && (
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>File associations registered</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-[#0078D7]/10 border-t border-[#0078D7]/30 p-4 flex justify-between items-center">
        <div className="text-xs opacity-50">
          {stage === "welcome" && "Setup Wizard"}
          {stage === "configure" && "Configuration"}
          {stage === "installing" && "Installation in progress..."}
          {stage === "complete" && "Setup Complete"}
        </div>
        <div className="flex gap-2">
          {stage === "welcome" && (
            <>
              <button
                onClick={() => onComplete?.()}
                className="px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setStage("configure")}
                className="px-4 py-2 bg-[#0078D7] hover:bg-[#0063B1] rounded-lg transition-colors"
              >
                Next
              </button>
            </>
          )}

          {stage === "configure" && (
            <>
              <button
                onClick={() => setStage("welcome")}
                className="px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleInstall}
                className="px-4 py-2 bg-[#0078D7] hover:bg-[#0063B1] rounded-lg transition-colors"
              >
                Install
              </button>
            </>
          )}

          {stage === "complete" && (
            <button
              onClick={handleFinish}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition-colors"
            >
              Finish
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
