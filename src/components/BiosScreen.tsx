import { useState, useEffect } from "react";
import { Settings, HardDrive, Shield, Zap, Upload, FileCode, Check, X, Lock as LockIcon } from "lucide-react";
import { toast } from "sonner";

interface BiosScreenProps {
  onExit: () => void;
}

interface CustomApp {
  id: string;
  name: string;
  code: string;
  enabled: boolean;
}

export const BiosScreen = ({ onExit }: BiosScreenProps) => {
  const [selectedMenu, setSelectedMenu] = useState<"main" | "boot" | "security" | "advanced" | "performance" | "hardware" | "apps">("main");
  const [countdown, setCountdown] = useState(10);
  const [exitRequested, setExitRequested] = useState(false);
  
  // BIOS Settings
  const [bootOrder, setBootOrder] = useState(() => 
    localStorage.getItem('bios_boot_order') || 'hdd,network,usb'
  );
  const [securityEnabled, setSecurityEnabled] = useState(() => 
    localStorage.getItem('bios_security_enabled') !== 'false'
  );
  const [fastBoot, setFastBoot] = useState(() => 
    localStorage.getItem('bios_fast_boot') === 'true'
  );
  const [biosPassword, setBiosPassword] = useState(() => 
    localStorage.getItem('bios_password') || ''
  );
  const [customApps, setCustomApps] = useState<CustomApp[]>(() => {
    const saved = localStorage.getItem('bios_custom_apps');
    return saved ? JSON.parse(saved) : [];
  });
  const [uploadingApp, setUploadingApp] = useState(false);

  // Performance settings
  const [cpuVirtualization, setCpuVirtualization] = useState(() =>
    localStorage.getItem('bios_cpu_virtualization') !== 'false'
  );
  const [overclocking, setOverclocking] = useState(() =>
    localStorage.getItem('bios_overclocking') === 'true'
  );
  const [fanSpeed, setFanSpeed] = useState(() =>
    localStorage.getItem('bios_fan_speed') || 'auto'
  );
  const [powerLimit, setPowerLimit] = useState(() =>
    parseInt(localStorage.getItem('bios_power_limit') || '100')
  );

  // Hardware settings
  const [usbPorts, setUsbPorts] = useState(() =>
    localStorage.getItem('bios_usb_ports') !== 'false'
  );
  const [audio, setAudio] = useState(() =>
    localStorage.getItem('bios_audio') !== 'false'
  );
  const [networkController, setNetworkController] = useState(() =>
    localStorage.getItem('bios_network') !== 'false'
  );

  // Exit countdown
  useEffect(() => {
    if (exitRequested) {
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            onExit();
            return 0;
          }
          return prev - 1;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [exitRequested, onExit]);

  // Check if OEM unlock is enabled
  const oemUnlocked = localStorage.getItem('settings_oem_unlocked') === 'true';

  const saveSetting = (key: string, value: string | boolean) => {
    localStorage.setItem(`bios_${key}`, String(value));
    toast.success("Setting saved");
  };

  const handleBootOrderChange = (order: string) => {
    setBootOrder(order);
    saveSetting('boot_order', order);
  };

  const handleSecurityToggle = () => {
    const newValue = !securityEnabled;
    setSecurityEnabled(newValue);
    saveSetting('security_enabled', newValue);
    if (!newValue) {
      toast.warning("⚠ SECURITY DISABLED - System is vulnerable!");
    }
  };

  const handleFastBootToggle = () => {
    const newValue = !fastBoot;
    setFastBoot(newValue);
    saveSetting('fast_boot', newValue);
  };

  const handlePasswordSet = () => {
    const password = prompt("Set BIOS password (or leave empty to remove):");
    if (password !== null) {
      setBiosPassword(password);
      saveSetting('password', password);
      toast.success(password ? "BIOS password set" : "BIOS password removed");
    }
  };

  const handleImportApp = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.tsx,.ts,.jsx,.js';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setUploadingApp(true);
      try {
        const code = await file.text();
        
        // Basic validation
        if (!code.includes('export') || code.length < 50) {
          toast.error("Invalid app file - must export a component");
          return;
        }

        const appName = prompt("Enter app name:", file.name.replace(/\.(tsx|ts|jsx|js)$/, ''));
        if (!appName) return;

        const newApp: CustomApp = {
          id: `custom-${Date.now()}`,
          name: appName,
          code: code,
          enabled: true
        };

        const updatedApps = [...customApps, newApp];
        setCustomApps(updatedApps);
        localStorage.setItem('bios_custom_apps', JSON.stringify(updatedApps));
        
        toast.success(`App "${appName}" imported successfully!`);
      } catch (error) {
        toast.error("Failed to import app: " + (error as Error).message);
      } finally {
        setUploadingApp(false);
      }
    };
    input.click();
  };

  const toggleCustomApp = (id: string) => {
    const updatedApps = customApps.map(app => 
      app.id === id ? { ...app, enabled: !app.enabled } : app
    );
    setCustomApps(updatedApps);
    localStorage.setItem('bios_custom_apps', JSON.stringify(updatedApps));
    toast.success("App status updated");
  };

  const deleteCustomApp = (id: string) => {
    if (confirm("Delete this custom app?")) {
      const updatedApps = customApps.filter(app => app.id !== id);
      setCustomApps(updatedApps);
      localStorage.setItem('bios_custom_apps', JSON.stringify(updatedApps));
      toast.success("App deleted");
    }
  };

  const handleExit = () => {
    setExitRequested(true);
  };

  if (exitRequested) {
    return (
      <div className="fixed inset-0 bg-black text-primary font-mono flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl font-bold mb-4">SAVING & EXITING</div>
          <div className="text-xl">Please wait...</div>
          <div className="mt-8 text-6xl font-bold text-green-400">
            {Math.ceil(countdown / 10)}
          </div>
        </div>
      </div>
    );
  }

  const renderMain = () => (
    <div className="space-y-4">
      <div className="text-2xl font-bold text-primary mb-6">URBANSHADE BIOS v3.7.2</div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-panel p-4">
          <div className="text-xs text-muted-foreground mb-2">SYSTEM</div>
          <div className="text-sm">Urbanshade OS</div>
          <div className="text-xs text-muted-foreground mt-1">Version 3.7.2-HADAL</div>
        </div>

        <div className="glass-panel p-4">
          <div className="text-xs text-muted-foreground mb-2">PROCESSOR</div>
          <div className="text-sm">HPU-8000 Series</div>
          <div className="text-xs text-muted-foreground mt-1">8 Cores @ 8247m depth</div>
        </div>

        <div className="glass-panel p-4">
          <div className="text-xs text-muted-foreground mb-2">MEMORY</div>
          <div className="text-sm">64 GB DDR5 ECC</div>
          <div className="text-xs text-muted-foreground mt-1">Tested OK</div>
        </div>

        <div className="glass-panel p-4">
          <div className="text-xs text-muted-foreground mb-2">STORAGE</div>
          <div className="text-sm">2TB NVMe SSD</div>
          <div className="text-xs text-muted-foreground mt-1">RAID-10 Configuration</div>
        </div>

        <div className="glass-panel p-4">
          <div className="text-xs text-muted-foreground mb-2">SECURITY</div>
          <div className={`text-sm font-bold ${securityEnabled ? 'text-green-400' : 'text-red-400'}`}>
            {securityEnabled ? '✓ ENABLED' : '✗ DISABLED'}
          </div>
        </div>

        <div className="glass-panel p-4">
          <div className="text-xs text-muted-foreground mb-2">CUSTOM APPS</div>
          <div className="text-sm">{customApps.filter(a => a.enabled).length} Active</div>
          <div className="text-xs text-muted-foreground mt-1">{customApps.length} Total</div>
        </div>

        <div className="glass-panel p-4">
          <div className="text-xs text-muted-foreground mb-2">BIOS DATE</div>
          <div className="text-sm">{new Date().toLocaleDateString()}</div>
          <div className="text-xs text-muted-foreground mt-1">Underwater Systems</div>
        </div>

        <div className="glass-panel p-4">
          <div className="text-xs text-muted-foreground mb-2">BOOT MODE</div>
          <div className="text-sm">{fastBoot ? 'Fast Boot' : 'Normal'}</div>
          <div className="text-xs text-muted-foreground mt-1">UEFI Compatible</div>
        </div>
      </div>

      <div className="glass-panel p-4 mt-6">
        <div className="text-xs text-yellow-500">
          ⚠ Use arrow keys or click to navigate. Changes are saved automatically.
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          Press F10 to save and exit • ESC to exit without saving
        </div>
      </div>
    </div>
  );

  const renderBoot = () => (
    <div className="space-y-4">
      <div className="text-xl font-bold text-primary mb-4">BOOT CONFIGURATION</div>

      <div className="glass-panel p-4">
        <label className="block text-sm font-bold text-primary mb-3">Boot Order</label>
        <div className="space-y-2">
          {[
            { value: 'hdd,network,usb', label: 'HDD → Network → USB' },
            { value: 'network,hdd,usb', label: 'Network → HDD → USB' },
            { value: 'usb,hdd,network', label: 'USB → HDD → Network' }
          ].map(option => (
            <button
              key={option.value}
              onClick={() => handleBootOrderChange(option.value)}
              className={`w-full px-4 py-2 rounded text-left text-sm border-2 transition-all ${
                bootOrder === option.value 
                  ? 'border-primary bg-primary/10' 
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-panel p-4">
        <button
          onClick={handleFastBootToggle}
          className="w-full px-4 py-3 rounded text-left text-sm border-2 border-white/10 hover:border-primary/30 transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold">Fast Boot</div>
              <div className="text-xs text-muted-foreground">Skip boot sequence messages</div>
            </div>
            <div className={`text-2xl ${fastBoot ? 'text-green-400' : 'text-muted-foreground'}`}>
              {fastBoot ? <Check /> : <X />}
            </div>
          </div>
        </button>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-4">
      <div className="text-xl font-bold text-primary mb-4">SECURITY SETTINGS</div>

      <div className="glass-panel p-4">
        <button
          onClick={handleSecurityToggle}
          className={`w-full px-4 py-3 rounded text-left text-sm border-2 transition-all ${
            securityEnabled 
              ? 'border-green-400 bg-green-400/10' 
              : 'border-red-400 bg-red-400/10'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-lg">System Security</div>
              <div className="text-xs text-muted-foreground">
                {securityEnabled 
                  ? 'Authentication, encryption, and access control enabled' 
                  : '⚠ ALL SECURITY FEATURES DISABLED - SYSTEM VULNERABLE'}
              </div>
            </div>
            <div className={`text-3xl ${securityEnabled ? 'text-green-400' : 'text-red-400'}`}>
              {securityEnabled ? <Check /> : <X />}
            </div>
          </div>
        </button>
      </div>

      <div className="glass-panel p-4">
        <button
          onClick={handlePasswordSet}
          className="w-full px-4 py-3 rounded text-left text-sm border-2 border-white/10 hover:border-primary/30 transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold">BIOS Password</div>
              <div className="text-xs text-muted-foreground">
                {biosPassword ? '✓ Password protected' : 'Not set'}
              </div>
            </div>
            <Shield className="w-6 h-6 text-primary" />
          </div>
        </button>
      </div>

      {!securityEnabled && (
        <div className="glass-panel p-4 border-2 border-red-400 bg-red-400/10">
          <div className="text-red-400 font-bold mb-2">⚠ SECURITY WARNING</div>
          <div className="text-xs text-muted-foreground">
            With security disabled, the system is vulnerable to:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Unauthorized access</li>
              <li>Data breaches</li>
              <li>Malware infections</li>
              <li>System tampering</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );

  const renderPerformance = () => (
    <div className="space-y-4">
      <div className="text-xl font-bold text-primary mb-4">PERFORMANCE CONFIGURATION</div>

      <div className="glass-panel p-4">
        <button
          onClick={() => {
            const newValue = !cpuVirtualization;
            setCpuVirtualization(newValue);
            saveSetting('cpu_virtualization', newValue);
          }}
          className="w-full px-4 py-3 rounded text-left text-sm border-2 border-white/10 hover:border-primary/30 transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold">CPU Virtualization (VT-x)</div>
              <div className="text-xs text-muted-foreground">Enable hardware virtualization support</div>
            </div>
            <div className={`text-2xl ${cpuVirtualization ? 'text-green-400' : 'text-muted-foreground'}`}>
              {cpuVirtualization ? <Check /> : <X />}
            </div>
          </div>
        </button>
      </div>

      <div className="glass-panel p-4">
        <button
          onClick={() => {
            const newValue = !overclocking;
            setOverclocking(newValue);
            saveSetting('overclocking', newValue);
            if (newValue) toast.warning("⚠ Overclocking enabled - Monitor temperatures!");
          }}
          className="w-full px-4 py-3 rounded text-left text-sm border-2 border-white/10 hover:border-primary/30 transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold">CPU Overclocking</div>
              <div className="text-xs text-muted-foreground">Run processor above rated speed</div>
            </div>
            <div className={`text-2xl ${overclocking ? 'text-red-400' : 'text-muted-foreground'}`}>
              {overclocking ? <Zap /> : <X />}
            </div>
          </div>
        </button>
      </div>

      <div className="glass-panel p-4">
        <label className="block text-sm font-bold text-primary mb-3">Fan Speed Control</label>
        <div className="space-y-2">
          {[
            { value: 'silent', label: 'Silent (Low Speed)' },
            { value: 'auto', label: 'Auto (Balanced)' },
            { value: 'performance', label: 'Performance (High Speed)' },
            { value: 'max', label: 'Maximum (100%)' }
          ].map(option => (
            <button
              key={option.value}
              onClick={() => {
                setFanSpeed(option.value);
                saveSetting('fan_speed', option.value);
              }}
              className={`w-full px-4 py-2 rounded text-left text-sm border-2 transition-all ${
                fanSpeed === option.value 
                  ? 'border-primary bg-primary/10' 
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-panel p-4">
        <label className="block text-sm font-bold text-primary mb-3">Power Limit: {powerLimit}W</label>
        <input
          type="range"
          min="50"
          max="150"
          value={powerLimit}
          onChange={(e) => {
            const val = parseInt(e.target.value);
            setPowerLimit(val);
            saveSetting('power_limit', val.toString());
          }}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>50W (Eco)</span>
          <span>150W (Extreme)</span>
        </div>
      </div>
    </div>
  );

  const renderHardware = () => (
    <div className="space-y-4">
      <div className="text-xl font-bold text-primary mb-4">HARDWARE CONFIGURATION</div>

      <div className="glass-panel p-4">
        <button
          onClick={() => {
            const newValue = !usbPorts;
            setUsbPorts(newValue);
            saveSetting('usb_ports', newValue);
          }}
          className="w-full px-4 py-3 rounded text-left text-sm border-2 border-white/10 hover:border-primary/30 transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold">USB Controllers</div>
              <div className="text-xs text-muted-foreground">Enable USB 2.0/3.0 ports</div>
            </div>
            <div className={`text-2xl ${usbPorts ? 'text-green-400' : 'text-red-400'}`}>
              {usbPorts ? <Check /> : <X />}
            </div>
          </div>
        </button>
      </div>

      <div className="glass-panel p-4">
        <button
          onClick={() => {
            const newValue = !audio;
            setAudio(newValue);
            saveSetting('audio', newValue);
          }}
          className="w-full px-4 py-3 rounded text-left text-sm border-2 border-white/10 hover:border-primary/30 transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold">Onboard Audio</div>
              <div className="text-xs text-muted-foreground">High Definition Audio Device</div>
            </div>
            <div className={`text-2xl ${audio ? 'text-green-400' : 'text-red-400'}`}>
              {audio ? <Check /> : <X />}
            </div>
          </div>
        </button>
      </div>

      <div className="glass-panel p-4">
        <button
          onClick={() => {
            const newValue = !networkController;
            setNetworkController(newValue);
            saveSetting('network', newValue);
          }}
          className="w-full px-4 py-3 rounded text-left text-sm border-2 border-white/10 hover:border-primary/30 transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold">Network Controller</div>
              <div className="text-xs text-muted-foreground">Gigabit Ethernet Adapter</div>
            </div>
            <div className={`text-2xl ${networkController ? 'text-green-400' : 'text-red-400'}`}>
              {networkController ? <Check /> : <X />}
            </div>
          </div>
        </button>
      </div>

      <div className="glass-panel p-4">
        <div className="text-sm font-bold text-primary mb-3">Hardware Information</div>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">BIOS Version:</span>
            <span>3.7.2-HADAL</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Firmware:</span>
            <span>UEFI</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Chipset:</span>
            <span>URBANSHADE HPU-8000</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">SATA Mode:</span>
            <span>AHCI</span>
          </div>
        </div>
      </div>
    </div>
  );


  const renderAdvanced = () => (
    <div className="space-y-4">
      <div className="text-xl font-bold text-primary mb-4">ADVANCED OPTIONS</div>

      <div className="space-y-3">
        <button
          onClick={() => {
            if (confirm("Reset all BIOS settings to defaults?")) {
              localStorage.removeItem('bios_boot_order');
              localStorage.removeItem('bios_security_enabled');
              localStorage.removeItem('bios_fast_boot');
              localStorage.removeItem('bios_password');
              toast.success("BIOS settings reset");
              setTimeout(() => window.location.reload(), 1000);
            }
          }}
          className="w-full glass-panel p-4 text-left hover:bg-white/5 transition-all"
        >
          <div className="font-bold text-yellow-500">Reset to Defaults</div>
          <div className="text-xs text-muted-foreground mt-1">
            Restore all BIOS settings to factory defaults
          </div>
        </button>

        <button
          onClick={() => {
            const data = {
              boot_order: bootOrder,
              security_enabled: securityEnabled,
              fast_boot: fastBoot,
              password: biosPassword,
              custom_apps: customApps
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `bios-config-${Date.now()}.json`;
            a.click();
            toast.success("BIOS configuration exported");
          }}
          className="w-full glass-panel p-4 text-left hover:bg-white/5 transition-all"
        >
          <div className="font-bold text-primary">Export Configuration</div>
          <div className="text-xs text-muted-foreground mt-1">
            Save current BIOS settings to file
          </div>
        </button>

        <button
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = async (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (!file) return;
              try {
                const text = await file.text();
                const data = JSON.parse(text);
                if (data.boot_order) setBootOrder(data.boot_order);
                if (data.security_enabled !== undefined) setSecurityEnabled(data.security_enabled);
                if (data.fast_boot !== undefined) setFastBoot(data.fast_boot);
                if (data.password) setBiosPassword(data.password);
                if (data.custom_apps) setCustomApps(data.custom_apps);
                Object.entries(data).forEach(([key, value]) => {
                  if (key !== 'custom_apps') {
                    localStorage.setItem(`bios_${key}`, String(value));
                  }
                });
                if (data.custom_apps) {
                  localStorage.setItem('bios_custom_apps', JSON.stringify(data.custom_apps));
                }
                toast.success("Configuration imported");
              } catch (error) {
                toast.error("Failed to import configuration");
              }
            };
            input.click();
          }}
          className="w-full glass-panel p-4 text-left hover:bg-white/5 transition-all"
        >
          <div className="font-bold text-primary">Import Configuration</div>
          <div className="text-xs text-muted-foreground mt-1">
            Load BIOS settings from file
          </div>
        </button>
      </div>
    </div>
  );

  const renderApps = () => (
    <div className="space-y-4">
      <div className="text-xl font-bold text-primary mb-4">CUSTOM APPLICATIONS</div>

      <button
        onClick={handleImportApp}
        disabled={uploadingApp}
        className="w-full glass-panel p-4 border-2 border-primary/30 hover:border-primary hover:bg-primary/10 transition-all"
      >
        <div className="flex items-center gap-3">
          <Upload className="w-6 h-6 text-primary" />
          <div className="text-left flex-1">
            <div className="font-bold text-primary">
              {uploadingApp ? 'Importing...' : 'Import TSX/JSX App'}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Load your own React component as an app
            </div>
          </div>
        </div>
      </button>

      {customApps.length === 0 ? (
        <div className="glass-panel p-8 text-center">
          <FileCode className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <div className="text-muted-foreground">No custom apps installed</div>
          <div className="text-xs text-muted-foreground mt-2">
            Import .tsx or .jsx files to add custom functionality
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {customApps.map(app => (
            <div key={app.id} className="glass-panel p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <FileCode className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-bold">{app.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {app.code.length} characters
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleCustomApp(app.id)}
                    className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                      app.enabled 
                        ? 'bg-green-400/20 text-green-400 border border-green-400/30' 
                        : 'bg-red-400/20 text-red-400 border border-red-400/30'
                    }`}
                  >
                    {app.enabled ? 'ENABLED' : 'DISABLED'}
                  </button>
                  <button
                    onClick={() => deleteCustomApp(app.id)}
                    className="px-3 py-1 rounded text-xs bg-destructive/20 text-destructive border border-destructive/30 hover:bg-destructive/30"
                  >
                    DELETE
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="glass-panel p-4 bg-yellow-500/10 border-2 border-yellow-500/30">
        <div className="text-yellow-500 text-xs font-bold mb-2">⚠ SECURITY NOTICE</div>
        <div className="text-xs text-muted-foreground">
          Custom apps run with full system access. Only import code you trust.
          Malicious code could compromise the entire system.
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black text-white font-mono">
      {/* Header */}
      <div className="bg-primary/20 border-b border-primary/30 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-primary" />
          <div>
            <div className="font-bold text-lg">URBANSHADE BIOS SETUP</div>
            <div className="text-xs text-muted-foreground">Version 3.7.2-HADAL</div>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          Press ESC or click EXIT to save and continue
        </div>
      </div>

      <div className="flex h-[calc(100vh-60px-60px)]">
        {/* Sidebar Menu */}
        <div className="w-64 bg-black/40 border-r border-white/10 p-4">
          <div className="space-y-2">
            {[
              { id: 'main' as const, label: 'Main', icon: <Settings /> },
              { id: 'boot' as const, label: 'Boot', icon: <HardDrive /> },
              { id: 'security' as const, label: 'Security', icon: <Shield /> },
              { id: 'performance' as const, label: 'Performance', icon: <Zap /> },
              { id: 'hardware' as const, label: 'Hardware', icon: <HardDrive /> },
              { id: 'apps' as const, label: 'Custom Apps', icon: <FileCode />, locked: !oemUnlocked }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.locked) {
                    toast.error("Enable OEM Unlocking in Settings → Developer Options to access custom apps");
                  } else {
                    setSelectedMenu(item.id);
                  }
                }}
                className={`w-full px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${
                  selectedMenu === item.id
                    ? 'bg-primary/20 border-2 border-primary text-primary'
                    : item.locked
                    ? 'border-2 border-transparent opacity-50 cursor-not-allowed'
                    : 'border-2 border-transparent hover:bg-white/5'
                }`}
                disabled={item.locked}
              >
                {item.icon}
                <span className="flex-1 text-left">{item.label}</span>
                {item.locked && <LockIcon className="w-4 h-4 text-amber-500" />}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {selectedMenu === 'main' && renderMain()}
          {selectedMenu === 'boot' && renderBoot()}
          {selectedMenu === 'security' && renderSecurity()}
          {selectedMenu === 'performance' && renderPerformance()}
          {selectedMenu === 'hardware' && renderHardware()}
          {selectedMenu === 'advanced' && renderAdvanced()}
          {selectedMenu === 'apps' && renderApps()}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-black/40 border-t border-white/10 px-6 py-3 flex items-center justify-between text-xs">
        <div className="text-muted-foreground">
          ← → Navigate | Enter Select | ESC Exit
        </div>
        <button
          onClick={handleExit}
          className="px-6 py-2 rounded bg-primary hover:bg-primary/80 text-black font-bold transition-all"
        >
          SAVE & EXIT
        </button>
      </div>
    </div>
  );
};