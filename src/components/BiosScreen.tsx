import { useState, useEffect } from "react";

interface BiosScreenProps {
  onExit: () => void;
}

export const BiosScreen = ({ onExit }: BiosScreenProps) => {
  const [selectedTab, setSelectedTab] = useState<"main" | "boot" | "advanced" | "security" | "exit">("main");
  const [selectedOption, setSelectedOption] = useState(0);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'F10') {
        setShowingExit(true);
        setExitCountdown(3);
      } else if (e.key === 'ArrowLeft' && !showingExit) {
        setSelectedTab(prev => Math.max(0, prev - 1));
        setSelectedOption(0);
      } else if (e.key === 'ArrowRight' && !showingExit) {
        const maxTab = oemUnlocked ? 5 : 4;
        setSelectedTab(prev => Math.min(maxTab, prev + 1));
        setSelectedOption(0);
      } else if (e.key === 'ArrowUp' && !showingExit) {
        setSelectedOption(prev => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowDown' && !showingExit) {
        const maxOptions = getMaxOptions();
        setSelectedOption(prev => Math.min(maxOptions - 1, prev + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showingExit, selectedTab, oemUnlocked]);

  useEffect(() => {
    if (exitCountdown !== null && exitCountdown > 0) {
      const timer = setTimeout(() => setExitCountdown(exitCountdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (exitCountdown === 0) {
      onExit();
    }
  }, [exitCountdown, onExit]);

  const getMaxOptions = () => {
    switch (selectedTab) {
      case 0: return 5; // Main
      case 1: return 4; // Advanced
      case 2: return 3; // Boot
      case 3: return 2; // Security
      case 4: return 3; // Exit
      case 5: return oemUnlocked ? 2 : 0; // Custom Apps
      default: return 0;
    }
  };

  const tabs = ["Main", "Advanced", "Boot", "Security", "Exit"];
  if (oemUnlocked) tabs.push("Custom Apps");

  const renderMainTab = () => (
    <div className="grid grid-cols-2 gap-8 h-full animate-fade-in">
      <div className="space-y-2">
        <div className="bg-cyan-400 text-black px-2 py-1 font-bold">System Information</div>
        <div className={selectedOption === 0 ? 'bg-cyan-400 text-black px-2' : 'px-2'}>BIOS Version: 3.2.1</div>
        <div className={selectedOption === 1 ? 'bg-cyan-400 text-black px-2' : 'px-2'}>CPU: Urbanshade Quantum Core v4</div>
        <div className={selectedOption === 2 ? 'bg-cyan-400 text-black px-2' : 'px-2'}>Memory: 32GB DDR5-6400</div>
        <div className={selectedOption === 3 ? 'bg-cyan-400 text-black px-2' : 'px-2'}>Storage: 2TB NVMe SSD</div>
        <div className={selectedOption === 4 ? 'bg-cyan-400 text-black px-2' : 'px-2'}>Boot Device: URBANSHADE-SSD-01</div>
      </div>
      <div className="space-y-2">
        <div className="bg-cyan-400 text-black px-2 py-1 font-bold">System Time</div>
        <div className="px-2">{new Date().toLocaleDateString()}</div>
        <div className="px-2">{new Date().toLocaleTimeString()}</div>
        <div className="mt-4 bg-cyan-400 text-black px-2 py-1 font-bold">System Status</div>
        <div className="px-2">Temperature: 42°C</div>
        <div className="px-2">Fan Speed: 1200 RPM</div>
        <div className="px-2">Voltage: 12.0V</div>
      </div>
    </div>
  );

  const renderAdvancedTab = () => (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-cyan-400 text-black px-2 py-1 font-bold">Advanced Settings</div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className={selectedOption === 0 ? 'bg-cyan-400 text-black px-2' : 'px-2'}>
            CPU Configuration: [Enabled]
          </div>
          <div className={selectedOption === 1 ? 'bg-cyan-400 text-black px-2' : 'px-2'}>
            Virtualization: [Enabled]
          </div>
          <div className={selectedOption === 2 ? 'bg-cyan-400 text-black px-2' : 'px-2'}>
            SATA Configuration: [AHCI Mode]
          </div>
          <div className={selectedOption === 3 ? 'bg-cyan-400 text-black px-2' : 'px-2'}>
            USB Configuration: [Enabled]
          </div>
        </div>
        <div className="text-sm px-2 text-cyan-300">
          <div className="mb-2">Advanced CPU and chipset settings.</div>
          <div>Use arrow keys to navigate.</div>
          <div className="mt-4 p-2 border border-cyan-400">
            WARNING: Modifying these settings may cause system instability.
          </div>
        </div>
      </div>
    </div>
  );

  const renderBootTab = () => (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-cyan-400 text-black px-2 py-1 font-bold">Boot Configuration</div>
      <div className="space-y-2">
        <div className={selectedOption === 0 ? 'bg-cyan-400 text-black px-2' : 'px-2'}>
          Boot Option #1: URBANSHADE-SSD-01
        </div>
        <div className={selectedOption === 1 ? 'bg-cyan-400 text-black px-2' : 'px-2'}>
          Boot Option #2: Network Boot
        </div>
        <div className={selectedOption === 2 ? 'bg-cyan-400 text-black px-2' : 'px-2'}>
          Fast Boot: [Enabled]
        </div>
      </div>
      <div className="mt-4 text-sm text-cyan-300 px-2">
        <div>Configure boot device priority.</div>
        <div className="mt-2">Press F2 during startup to enter BIOS.</div>
        <div>Press DEL for advanced boot options.</div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-cyan-400 text-black px-2 py-1 font-bold">Security Settings</div>
      <div className="space-y-2">
        <div className={selectedOption === 0 ? 'bg-cyan-400 text-black px-2' : 'px-2'}>
          Secure Boot: [Enabled]
        </div>
        <div className={selectedOption === 1 ? 'bg-cyan-400 text-black px-2' : 'px-2'}>
          TPM Device: [Enabled]
        </div>
      </div>
      <div className="mt-4 p-2 border border-cyan-400 text-sm text-cyan-300">
        <div className="mb-2">SECURITY NOTICE:</div>
        <div>Urbanshade Corporation requires all systems</div>
        <div>to maintain maximum security protocols.</div>
        <div className="mt-2">Unauthorized modifications will be logged.</div>
      </div>
    </div>
  );

  const renderExitTab = () => (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-cyan-400 text-black px-2 py-1 font-bold">Exit Options</div>
      <div className="space-y-2">
        <div className={selectedOption === 0 ? 'bg-cyan-400 text-black px-2' : 'px-2'}>
          Exit Saving Changes
        </div>
        <div className={selectedOption === 1 ? 'bg-cyan-400 text-black px-2' : 'px-2'}>
          Exit Discarding Changes
        </div>
        <div className={selectedOption === 2 ? 'bg-cyan-400 text-black px-2' : 'px-2'}>
          Load Setup Defaults
        </div>
      </div>
      <div className="mt-4 text-sm text-cyan-300 px-2">
        <div>Press F10 to save changes and exit.</div>
        <div>Press ESC to exit without saving.</div>
      </div>
    </div>
  );

  const renderCustomAppsTab = () => (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-cyan-400 text-black px-2 py-1 font-bold">Custom Applications (OEM Unlocked)</div>
      <div className="space-y-2">
        <div className={selectedOption === 0 ? 'bg-cyan-400 text-black px-2' : 'px-2'}>
          Custom Boot Loader: [Disabled]
        </div>
        <div className={selectedOption === 1 ? 'bg-cyan-400 text-black px-2' : 'px-2'}>
          Unsigned Drivers: [Disabled]
        </div>
      </div>
      <div className="mt-4 p-2 border border-amber-400 text-sm text-amber-300 animate-pulse">
        <div className="mb-2">⚠️ WARNING: OEM UNLOCK ACTIVE</div>
        <div>This device has been unlocked for custom modifications.</div>
        <div className="mt-2">Urbanshade Corporation is not responsible for</div>
        <div>system instability or security breaches resulting</div>
        <div>from unauthorized modifications.</div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (selectedTab) {
      case 0: return renderMainTab();
      case 1: return renderAdvancedTab();
      case 2: return renderBootTab();
      case 3: return renderSecurityTab();
      case 4: return renderExitTab();
      case 5: return oemUnlocked ? renderCustomAppsTab() : null;
      default: return null;
    }
  };

  if (showingExit) {
    return (
      <div className="h-screen w-full bg-[#0000AA] text-white font-mono flex items-center justify-center animate-fade-in">
        <div className="text-center">
          <div className="text-2xl mb-4">Exiting BIOS Setup...</div>
          <div className="text-xl">{exitCountdown}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-[#0000AA] text-white font-mono flex flex-col p-4 select-none">
      {/* Header */}
      <div className="text-center border-b border-white pb-2 mb-4 animate-fade-in">
        <h1 className="text-xl font-bold">URBANSHADE BIOS SETUP UTILITY</h1>
        <p className="text-sm">Version 3.2.1 - Copyright (C) 2025 Urbanshade Corporation</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-white mb-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        {tabs.map((tab, i) => (
          <button
            key={tab}
            onClick={() => {
              setSelectedTab(i);
              setSelectedOption(0);
            }}
            className={`px-4 py-2 transition-colors ${
              selectedTab === i 
                ? 'bg-cyan-400 text-black font-bold' 
                : 'hover:bg-white/10'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden mb-4">
        {renderContent()}
      </div>

      {/* Footer */}
      <div className="border-t border-white pt-2 text-xs animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div>↑↓: Select Item</div>
            <div>←→: Select Menu</div>
          </div>
          <div>
            <div>F1: Help</div>
            <div>F10: Save & Exit</div>
          </div>
          <div>
            <div>ESC: Exit</div>
            <div>Enter: Select</div>
          </div>
        </div>
      </div>
    </div>
  );
};
