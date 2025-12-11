import { useState, useRef, useEffect } from "react";
import { Settings as SettingsIcon, Monitor, Wifi, Volume2, HardDrive, Users, Clock, Shield, Palette, Accessibility, Bell, Power, Globe, Search, Upload, UserPlus, AlertTriangle, Download, ChevronDown, Code, FileText, Type, Cloud, RefreshCw, LogOut, Trash2, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { saveState, loadState } from "@/lib/persistence";
import { toast } from "sonner";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { useOnlineAccount } from "@/hooks/useOnlineAccount";
import { useAutoSync } from "@/hooks/useAutoSync";
import { SyncSettingsPanel } from "@/components/SyncSettingsPanel";
import { SyncConflictDialog } from "@/components/SyncConflictDialog";

export const Settings = ({ onUpdate }: { onUpdate?: () => void }) => {
  const { settings, updateSetting, resetToDefaults } = useSystemSettings();
  const { user, profile, isOnlineMode, signOut, updateProfile, loadCloudSettings } = useOnlineAccount();
  const { lastSyncTime, isSyncing, manualSync, isEnabled: syncEnabled, hasConflict, cloudSettings, resolveConflict } = useAutoSync();
  
  const [selectedCategory, setSelectedCategory] = useState("system");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFactoryResetDialog, setShowFactoryResetDialog] = useState(false);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [showAddAccountDialog, setShowAddAccountDialog] = useState(false);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [newAccountUsername, setNewAccountUsername] = useState("");
  const [newAccountPassword, setNewAccountPassword] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // System settings
  const [autoUpdates, setAutoUpdates] = useState(loadState("settings_auto_updates", true));
  const [telemetry, setTelemetry] = useState(loadState("settings_telemetry", false));
  const [powerMode, setPowerMode] = useState(loadState("settings_power_mode", "balanced"));
  const [oemUnlocked, setOemUnlocked] = useState(loadState("settings_oem_unlocked", false));
  const [showOemDialog, setShowOemDialog] = useState(false);
  const [developerOptionsOpen, setDeveloperOptionsOpen] = useState(false);
  const [developerMode, setDeveloperMode] = useState(loadState("settings_developer_mode", false));
  const [usbDebugging, setUsbDebugging] = useState(loadState("settings_usb_debugging", false));
  const [showTouches, setShowTouches] = useState(loadState("settings_show_touches", false));
  const [stayAwake, setStayAwake] = useState(loadState("settings_stay_awake", false));
  const [strictMode, setStrictMode] = useState(loadState("settings_strict_mode", false));
  const [gpuRendering, setGpuRendering] = useState(loadState("settings_gpu_rendering", false));
  
  // Display settings
  const [resolution, setResolution] = useState(loadState("settings_resolution", "1920x1080"));
  const [nightLight, setNightLight] = useState(loadState("settings_night_light", false));
  const [theme, setTheme] = useState(loadState("settings_theme", "dark"));
  
  // Network settings
  const [wifiEnabled, setWifiEnabled] = useState(loadState("settings_wifi", true));
  const [vpnEnabled, setVpnEnabled] = useState(loadState("settings_vpn", false));
  const [proxyEnabled, setProxyEnabled] = useState(loadState("settings_proxy", false));
  
  // Sound settings
  const [volume, setVolume] = useState(loadState("settings_volume", [70]));
  const [muteEnabled, setMuteEnabled] = useState(loadState("settings_mute", false));
  const [soundEffects, setSoundEffects] = useState(loadState("settings_sound_effects", true));
  
  // Time & Language
  const [timeZone, setTimeZone] = useState(loadState("settings_timezone", "UTC-5"));
  const [language, setLanguage] = useState(loadState("settings_language", "English"));
  const [dateFormat, setDateFormat] = useState(loadState("settings_date_format", "MM/DD/YYYY"));
  
  // Privacy
  const [locationTracking, setLocationTracking] = useState(loadState("settings_location", false));
  const [crashReports, setCrashReports] = useState(loadState("settings_crash_reports", true));
  
  // Notifications
  const [notificationsEnabled, setNotificationsEnabled] = useState(loadState("settings_notifications", true));
  const [doNotDisturb, setDoNotDisturb] = useState(loadState("settings_dnd", false));
  const [notificationSound, setNotificationSound] = useState(loadState("settings_notification_sound", true));

  const handleSave = (key: string, value: any) => {
    saveState(key, value);
  };

  const handleFactoryReset = () => {
    // Clear all localStorage
    localStorage.clear();
    toast.success("Factory reset initiated. Reloading system...");
    // Reload the page to restart the setup process
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const handleOemUnlockToggle = (checked: boolean) => {
    // Both turning on and off require factory reset
    setShowOemDialog(true);
  };

  const handleOemUnlockConfirm = () => {
    // Toggle OEM unlock and factory reset
    const newValue = !oemUnlocked;
    setOemUnlocked(newValue);
    handleSave("settings_oem_unlocked", newValue);
    setShowOemDialog(false);
    handleFactoryReset();
  };

  const handleExportSystemImage = () => {
    // Export all localStorage to a JSON file
    const systemImage: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        systemImage[key] = localStorage.getItem(key) || "";
      }
    }
    
    const blob = new Blob([JSON.stringify(systemImage, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `urbanshade_system_image_${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("System image exported successfully");
  };

  const handleImportSystemImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const systemImage = JSON.parse(e.target?.result as string);
        // Clear current localStorage
        localStorage.clear();
        // Import all keys
        Object.keys(systemImage).forEach(key => {
          localStorage.setItem(key, systemImage[key]);
        });
        toast.success("System image imported successfully. Reloading...");
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (error) {
        toast.error("Failed to import system image. Invalid file format.");
      }
    };
    reader.readAsText(file);
  };

  const handleAddAccount = () => {
    if (!newAccountUsername || !newAccountPassword) {
      toast.error("Please enter both username and password");
      return;
    }

    // Get existing accounts
    const accounts = loadState("accounts", []);
    
    // Check if username already exists
    if (accounts.some((acc: any) => acc.username === newAccountUsername)) {
      toast.error("Username already exists");
      return;
    }

    // Add new account
    const newAccount = {
      id: `P${String(accounts.length + 1).padStart(3, '0')}`,
      username: newAccountUsername,
      password: newAccountPassword,
      name: newAccountUsername,
      role: "User",
      clearance: 2,
      department: "General",
      location: "Facility",
      status: "active",
      phone: `x${2000 + accounts.length}`,
      email: `${newAccountUsername}@urbanshade.corp`,
      createdAt: new Date().toISOString()
    };

    accounts.push(newAccount);
    saveState("accounts", accounts);
    
    toast.success(`Account created for ${newAccountUsername}`);
    setShowAddAccountDialog(false);
    setNewAccountUsername("");
    setNewAccountPassword("");
  };

  const categories = [
    { id: "system", name: "System", icon: <Monitor className="w-5 h-5" /> },
    { id: "display", name: "Display", icon: <Palette className="w-5 h-5" /> },
    { id: "network", name: "Network & Internet", icon: <Wifi className="w-5 h-5" /> },
    { id: "sound", name: "Sound", icon: <Volume2 className="w-5 h-5" /> },
    { id: "storage", name: "Storage", icon: <HardDrive className="w-5 h-5" /> },
    { id: "accounts", name: "Accounts", icon: <Users className="w-5 h-5" /> },
    { id: "time", name: "Time & Language", icon: <Clock className="w-5 h-5" /> },
    { id: "privacy", name: "Privacy & Security", icon: <Shield className="w-5 h-5" /> },
    { id: "accessibility", name: "Accessibility", icon: <Accessibility className="w-5 h-5" /> },
    { id: "notifications", name: "Notifications", icon: <Bell className="w-5 h-5" /> },
    { id: "power", name: "Power & Battery", icon: <Power className="w-5 h-5" /> },
    { id: "about", name: "About Urbanshade OS", icon: <SettingsIcon className="w-5 h-5" /> },
  ];

  const renderContent = () => {
    switch (selectedCategory) {
      case "system":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">System</h2>
              <p className="text-muted-foreground mb-6">Manage system settings and information</p>
            </div>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">About</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Device name:</span>
                  <Input 
                    value={settings.deviceName} 
                    onChange={(e) => updateSetting("deviceName", e.target.value)}
                    className="w-48 h-8"
                  />
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">OS Version:</span>
                  <span className="font-mono">Urbanshade OS v2.1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">System Type:</span>
                  <span>64-bit Operating System</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Processor:</span>
                  <span>Quantum Core X9 @ 4.2GHz</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Installed RAM:</span>
                  <span>64 GB</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Windows Update</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Automatic updates</div>
                    <div className="text-sm text-muted-foreground">Keep your system up to date</div>
                  </div>
                  <Switch checked={autoUpdates} onCheckedChange={(checked) => { setAutoUpdates(checked); handleSave("settings_auto_updates", checked); }} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Send telemetry data</div>
                    <div className="text-sm text-muted-foreground">Help improve the system</div>
                  </div>
                  <Switch checked={telemetry} onCheckedChange={(checked) => { setTelemetry(checked); handleSave("settings_telemetry", checked); }} />
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => {
                    toast.success("Update available! Installing v2.2");
                    setTimeout(() => onUpdate?.(), 2000);
                  }}
                >
                  Check for updates
                </Button>
                <div className="text-sm text-muted-foreground">
                  Last checked: Just now
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Advanced system settings</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">System protection</Button>
                <Button variant="outline" className="w-full justify-start">Remote settings</Button>
                <Button variant="outline" className="w-full justify-start">Environment variables</Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => {
                    localStorage.setItem("urbanshade_reboot_to_bios", "true");
                    toast.success("Rebooting to BIOS Setup...");
                    setTimeout(() => window.location.reload(), 1000);
                  }}
                >
                  <Power className="w-4 h-4 mr-2" />
                  Reboot to BIOS
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <Collapsible open={developerOptionsOpen} onOpenChange={setDeveloperOptionsOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    <div className="flex items-center gap-2">
                      <Code className="w-5 h-5 text-amber-500" />
                      <span className="font-semibold text-amber-500">Developer Options</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${developerOptionsOpen ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="mt-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                      <div>
                        <div className="font-medium">Developer Mode</div>
                        <div className="text-sm text-muted-foreground">Enable DEF-DEV debug console access</div>
                      </div>
                      <Switch 
                        checked={developerMode} 
                        onCheckedChange={(checked) => {
                          setDeveloperMode(checked);
                          handleSave("settings_developer_mode", checked);
                          if (checked) {
                            toast.success("Developer Mode enabled - Opening DEF-DEV...");
                            // Open def-dev in new window first, then reload
                            window.open("/def-dev", "_blank");
                            setTimeout(() => window.location.reload(), 800);
                          } else {
                            toast.success("Developer Mode disabled");
                          }
                        }} 
                      />
                    </div>

                    {developerMode && (
                      <Button 
                        variant="outline" 
                        className="w-full border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                        onClick={() => window.open("/def-dev", "_blank")}
                      >
                        <Code className="w-4 h-4 mr-2" />
                        Launch DEF-DEV Console
                      </Button>
                    )}

                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                          OEM Unlocking
                        </div>
                        <div className="text-sm text-muted-foreground">Allow custom apps in BIOS (requires factory reset)</div>
                      </div>
                      <Switch checked={oemUnlocked} onCheckedChange={handleOemUnlockToggle} />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <div className="font-medium">USB Debugging</div>
                        <div className="text-sm text-muted-foreground">Allow debugging via USB connection</div>
                      </div>
                      <Switch 
                        checked={usbDebugging} 
                        onCheckedChange={(checked) => {
                          setUsbDebugging(checked);
                          handleSave("settings_usb_debugging", checked);
                          toast.success(checked ? "USB Debugging enabled" : "USB Debugging disabled");
                        }} 
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <div className="font-medium">Show Touches</div>
                        <div className="text-sm text-muted-foreground">Visual feedback for touch interactions</div>
                      </div>
                      <Switch 
                        checked={showTouches} 
                        onCheckedChange={(checked) => {
                          setShowTouches(checked);
                          handleSave("settings_show_touches", checked);
                        }} 
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <div className="font-medium">Stay Awake</div>
                        <div className="text-sm text-muted-foreground">Screen stays on while charging</div>
                      </div>
                      <Switch 
                        checked={stayAwake} 
                        onCheckedChange={(checked) => {
                          setStayAwake(checked);
                          handleSave("settings_stay_awake", checked);
                        }} 
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <div className="font-medium">Strict Mode</div>
                        <div className="text-sm text-muted-foreground">Flash screen on long operations</div>
                      </div>
                      <Switch 
                        checked={strictMode} 
                        onCheckedChange={(checked) => {
                          setStrictMode(checked);
                          handleSave("settings_strict_mode", checked);
                        }} 
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <div className="font-medium">Force GPU Rendering</div>
                        <div className="text-sm text-muted-foreground">Use GPU for 2D drawing</div>
                      </div>
                      <Switch 
                        checked={gpuRendering} 
                        onCheckedChange={(checked) => {
                          setGpuRendering(checked);
                          handleSave("settings_gpu_rendering", checked);
                        }} 
                      />
                    </div>

                    <p className="text-xs text-amber-500/70 mt-4">
                      ⚠️ Warning: These options are for advanced users. Incorrect settings may cause system instability.
                    </p>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">System Image</h3>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleExportSystemImage}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export System Image
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import System Image
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImportSystemImage}
                />
              </div>
            </Card>

            <Card className="p-6 border-destructive">
              <h3 className="font-semibold mb-4 text-destructive flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Danger Zone
              </h3>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Factory reset will erase all data, installed apps, and return the system to its initial setup state.
                </p>
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={() => setShowFactoryResetDialog(true)}
                >
                  Factory Reset
                </Button>
              </div>
            </Card>
          </div>
        );

      case "display":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Display</h2>
              <p className="text-muted-foreground mb-6">Adjust screen brightness, resolution, and color</p>
            </div>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Brightness</h3>
              <div className="space-y-4">
                <Slider 
                  value={[settings.brightness]} 
                  onValueChange={(value) => updateSetting("brightness", value[0])}
                  max={100} 
                  step={1}
                  className="w-full"
                />
                <div className="text-sm text-muted-foreground text-right">{settings.brightness}%</div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Appearance</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Theme</label>
                  <Select value={theme} onValueChange={(value) => { 
                    setTheme(value); 
                    handleSave("settings_theme", value);
                    document.documentElement.classList.remove('light', 'dark');
                    if (value !== 'auto') {
                      document.documentElement.classList.add(value);
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="auto">Auto (System)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Animations</div>
                    <div className="text-sm text-muted-foreground">Enable smooth transitions</div>
                  </div>
                  <Switch checked={settings.animationsEnabled} onCheckedChange={(checked) => updateSetting("animationsEnabled", checked)} />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Scale and layout</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Display resolution</label>
                  <Select value={resolution} onValueChange={(value) => { setResolution(value); handleSave("settings_resolution", value); }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1920x1080">1920 x 1080 (Recommended)</SelectItem>
                      <SelectItem value="2560x1440">2560 x 1440</SelectItem>
                      <SelectItem value="3840x2160">3840 x 2160 (4K)</SelectItem>
                      <SelectItem value="1280x720">1280 x 720</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Color</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Night light</div>
                    <div className="text-sm text-muted-foreground">Reduce blue light at night</div>
                  </div>
                  <Switch checked={nightLight} onCheckedChange={(checked) => { 
                    setNightLight(checked); 
                    handleSave("settings_night_light", checked);
                  }} />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Background</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Gradient Start Color</label>
                  <input
                    type="color"
                    value={settings.bgGradientStart}
                    onChange={(e) => updateSetting("bgGradientStart", e.target.value)}
                    className="w-full h-12 rounded-lg cursor-pointer border border-border"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Gradient End Color</label>
                  <input
                    type="color"
                    value={settings.bgGradientEnd}
                    onChange={(e) => updateSetting("bgGradientEnd", e.target.value)}
                    className="w-full h-12 rounded-lg cursor-pointer border border-border"
                  />
                </div>
                <div className="p-4 rounded-lg border border-border" style={{
                  background: `linear-gradient(135deg, ${settings.bgGradientStart}, ${settings.bgGradientEnd})`
                }}>
                  <p className="text-sm text-center text-white font-semibold">Preview</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Accent Color</label>
                  <Select value={settings.accentColor} onValueChange={(value) => updateSetting("accentColor", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cyan">Cyan</SelectItem>
                      <SelectItem value="purple">Purple</SelectItem>
                      <SelectItem value="green">Green</SelectItem>
                      <SelectItem value="orange">Orange</SelectItem>
                      <SelectItem value="pink">Pink</SelectItem>
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="red">Red</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Font Family</label>
                  <Select value={settings.fontFamily} onValueChange={(value) => updateSetting("fontFamily", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="JetBrains Mono">JetBrains Mono</SelectItem>
                      <SelectItem value="Fira Code">Fira Code</SelectItem>
                      <SelectItem value="Source Code Pro">Source Code Pro</SelectItem>
                      <SelectItem value="Roboto Mono">Roboto Mono</SelectItem>
                      <SelectItem value="Inter">Inter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Glass Opacity: {Math.round(settings.glassOpacity * 100)}%</label>
                  <Slider 
                    value={[settings.glassOpacity * 100]} 
                    onValueChange={(value) => updateSetting("glassOpacity", value[0] / 100)}
                    max={100} 
                    min={10}
                    step={5}
                    className="w-full"
                  />
                </div>
                <Button 
                  variant="outline"
                  onClick={resetToDefaults}
                  className="w-full"
                >
                  Reset to Defaults
                </Button>
              </div>
            </Card>
          </div>
        );

      case "network":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Network & Internet</h2>
              <p className="text-muted-foreground mb-6">Manage Wi-Fi, VPN, and network settings</p>
            </div>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Wi-Fi</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Wi-Fi enabled</div>
                    <div className="text-sm text-muted-foreground">Connected to: URBANSHADE-SECURE</div>
                  </div>
                  <Switch checked={wifiEnabled} onCheckedChange={(checked) => { setWifiEnabled(checked); handleSave("settings_wifi", checked); }} />
                </div>
                <Button variant="outline" className="w-full">Manage known networks</Button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">VPN</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">VPN connection</div>
                    <div className="text-sm text-muted-foreground">Secure your connection</div>
                  </div>
                  <Switch checked={vpnEnabled} onCheckedChange={(checked) => { setVpnEnabled(checked); handleSave("settings_vpn", checked); }} />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Proxy</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Use proxy server</div>
                    <div className="text-sm text-muted-foreground">Route traffic through proxy</div>
                  </div>
                  <Switch checked={proxyEnabled} onCheckedChange={(checked) => { setProxyEnabled(checked); handleSave("settings_proxy", checked); }} />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Network Status</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="text-green-500">Connected</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IP Address:</span>
                  <span className="font-mono">10.23.45.67</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Signal Strength:</span>
                  <span>Excellent</span>
                </div>
              </div>
            </Card>
          </div>
        );

      case "sound":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Sound</h2>
              <p className="text-muted-foreground mb-6">Manage audio devices and volume</p>
            </div>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Volume</h3>
              <div className="space-y-4">
                <Slider 
                  value={muteEnabled ? [0] : volume} 
                  onValueChange={(value) => { 
                    setVolume(value); 
                    handleSave("settings_volume", value);
                    if (value[0] > 0 && muteEnabled) {
                      setMuteEnabled(false);
                      handleSave("settings_mute", false);
                    }
                  }}
                  max={100} 
                  step={1}
                  className="w-full"
                />
                <div className="text-sm text-muted-foreground text-right">{muteEnabled ? 0 : volume[0]}%</div>
                <div className="flex items-center justify-between pt-2">
                  <div className="font-medium">Mute</div>
                  <Switch checked={muteEnabled} onCheckedChange={(checked) => { setMuteEnabled(checked); handleSave("settings_mute", checked); }} />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Output Device</h3>
              <Select defaultValue="speakers">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="speakers">Speakers (High Definition Audio)</SelectItem>
                  <SelectItem value="headphones">Headphones</SelectItem>
                  <SelectItem value="hdmi">HDMI Audio</SelectItem>
                </SelectContent>
              </Select>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Input Device</h3>
              <Select defaultValue="microphone">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="microphone">Microphone (Built-in)</SelectItem>
                  <SelectItem value="external">External Microphone</SelectItem>
                </SelectContent>
              </Select>
            </Card>
          </div>
        );

      case "storage":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Storage</h2>
              <p className="text-muted-foreground mb-6">Manage disk space and storage devices</p>
            </div>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Local Disk (C:)</h3>
              <div className="space-y-4">
                <div className="w-full h-4 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: "68%" }} />
                </div>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Used:</span>
                    <span className="font-mono">680 GB of 1 TB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Free:</span>
                    <span className="font-mono">320 GB</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full">Clean up disk</Button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Storage Categories</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">System files:</span>
                  <span className="font-mono">45 GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Applications:</span>
                  <span className="font-mono">320 GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Documents:</span>
                  <span className="font-mono">150 GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Temporary files:</span>
                  <span className="font-mono">15 GB</span>
                </div>
              </div>
            </Card>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Notifications</h2>
              <p className="text-muted-foreground mb-6">Manage system and app notifications</p>
            </div>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Notification Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Notifications</div>
                    <div className="text-sm text-muted-foreground">Show notifications from apps and system</div>
                  </div>
                  <Switch checked={notificationsEnabled} onCheckedChange={(checked) => { setNotificationsEnabled(checked); handleSave("settings_notifications", checked); }} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Do not disturb</div>
                    <div className="text-sm text-muted-foreground">Silence all notifications</div>
                  </div>
                  <Switch checked={doNotDisturb} onCheckedChange={(checked) => { setDoNotDisturb(checked); handleSave("settings_dnd", checked); }} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Notification sounds</div>
                    <div className="text-sm text-muted-foreground">Play sound for notifications</div>
                  </div>
                  <Switch checked={notificationSound} onCheckedChange={(checked) => { setNotificationSound(checked); handleSave("settings_notification_sound", checked); }} />
                </div>
              </div>
            </Card>
          </div>
        );
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Notifications</h2>
              <p className="text-muted-foreground mb-6">Manage system and app notifications</p>
            </div>

            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Notifications</div>
                    <div className="text-sm text-muted-foreground">Get notifications from apps and senders</div>
                  </div>
                  <Switch checked={notificationsEnabled} onCheckedChange={(checked) => { setNotificationsEnabled(checked); handleSave("settings_notifications", checked); }} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Do not disturb</div>
                    <div className="text-sm text-muted-foreground">Hide notifications and sounds</div>
                  </div>
                  <Switch checked={doNotDisturb} onCheckedChange={(checked) => { setDoNotDisturb(checked); handleSave("settings_dnd", checked); }} />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Notification Settings</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">Notification sounds</Button>
                <Button variant="outline" className="w-full justify-start">Focus assist</Button>
                <Button variant="outline" className="w-full justify-start">Notification history</Button>
              </div>
            </Card>
          </div>
        );

      case "accounts":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Accounts</h2>
              <p className="text-muted-foreground mb-6">Manage user accounts and sign-in options</p>
            </div>

            {/* Online Account Section - Only visible when signed in */}
            {isOnlineMode && user && (
              <Card className="p-6 border-blue-500/30 bg-blue-500/5">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Cloud className="w-5 h-5 text-blue-400" />
                  Online Account
                </h3>
                
                <div className="space-y-4">
                  {/* Account Info */}
                  <div className="flex items-center gap-4 p-4 bg-black/20 rounded-lg">
                    <div className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Cloud className="w-7 h-7 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-blue-400">{profile?.display_name || profile?.username || "Online User"}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                      <div className="text-xs text-green-400 mt-1">● Signed in</div>
                    </div>
                  </div>

                  {/* Sign Out */}
                  <Button 
                    variant="outline" 
                    className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
                    onClick={() => setShowSignOutDialog(true)}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </Card>
            )}

            {/* Cloud Sync Settings - New Enhanced Panel */}
            <SyncSettingsPanel 
              isOnlineMode={isOnlineMode}
              user={user}
              onManualSync={manualSync}
            />

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Your account</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <div className="font-bold">Administrator</div>
                  <div className="text-sm text-muted-foreground">
                    {isOnlineMode ? "Online Account" : "Local Account"}
                  </div>
                </div>
              </div>
              <Button variant="outline" className="w-full">Change account settings</Button>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Sign-in options</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">Password</Button>
                <Button variant="outline" className="w-full justify-start">PIN</Button>
                <Button variant="outline" className="w-full justify-start">Biometric</Button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Other accounts</h3>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground mb-3">
                  Add additional user accounts for other people who use this device.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setShowAddAccountDialog(true)}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Account
                </Button>
              </div>
            </Card>
          </div>
        );

      case "time":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Time & Language</h2>
              <p className="text-muted-foreground mb-6">Manage date, time, and regional settings</p>
            </div>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Date & Time</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Time zone</label>
                  <Select value={timeZone} onValueChange={(value) => { setTimeZone(value); handleSave("settings_timezone", value); }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC-8">Pacific Time (UTC-8)</SelectItem>
                      <SelectItem value="UTC-7">Mountain Time (UTC-7)</SelectItem>
                      <SelectItem value="UTC-6">Central Time (UTC-6)</SelectItem>
                      <SelectItem value="UTC-5">Eastern Time (UTC-5)</SelectItem>
                      <SelectItem value="UTC+0">GMT (UTC+0)</SelectItem>
                      <SelectItem value="UTC+1">Central European (UTC+1)</SelectItem>
                      <SelectItem value="UTC+8">China (UTC+8)</SelectItem>
                      <SelectItem value="UTC+9">Japan (UTC+9)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Date format</label>
                  <Select value={dateFormat} onValueChange={(value) => { setDateFormat(value); handleSave("settings_date_format", value); }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Language</h3>
              <div>
                <label className="text-sm font-medium mb-2 block">Display language</label>
                <Select value={language} onValueChange={(value) => { setLanguage(value); handleSave("settings_language", value); }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English (United States)</SelectItem>
                    <SelectItem value="Spanish">Spanish</SelectItem>
                    <SelectItem value="French">French</SelectItem>
                    <SelectItem value="German">German</SelectItem>
                    <SelectItem value="Japanese">Japanese</SelectItem>
                    <SelectItem value="Chinese">Chinese (Simplified)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>
          </div>
        );

      case "privacy":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Privacy & Security</h2>
              <p className="text-muted-foreground mb-6">Manage privacy settings and security features</p>
            </div>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Location Services</h3>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Allow apps to access location</div>
                  <div className="text-sm text-muted-foreground">Help apps provide location-based services</div>
                </div>
                <Switch checked={locationTracking} onCheckedChange={(checked) => { setLocationTracking(checked); handleSave("settings_location", checked); }} />
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Diagnostics & Feedback</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Send crash reports</div>
                    <div className="text-sm text-muted-foreground">Help improve system stability</div>
                  </div>
                  <Switch checked={crashReports} onCheckedChange={(checked) => { setCrashReports(checked); handleSave("settings_crash_reports", checked); }} />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Security Status</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Firewall:</span>
                  <span className="text-green-500">Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Antivirus:</span>
                  <span className="text-green-500">Up to date</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last scan:</span>
                  <span>Today, 2:15 PM</span>
                </div>
              </div>
            </Card>
          </div>
        );
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Privacy & Security</h2>
              <p className="text-muted-foreground mb-6">Manage privacy settings and security features</p>
            </div>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Security Status</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>Firewall is on</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>Virus protection is up to date</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <span>Account protection needs attention</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Privacy Options</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">App permissions</Button>
                <Button variant="outline" className="w-full justify-start">Location</Button>
                <Button variant="outline" className="w-full justify-start">Camera</Button>
                <Button variant="outline" className="w-full justify-start">Microphone</Button>
              </div>
            </Card>
          </div>
        );

      case "accessibility":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Accessibility</h2>
              <p className="text-muted-foreground mb-6">Make your device easier to use</p>
            </div>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Vision</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">Display</Button>
                <Button variant="outline" className="w-full justify-start">Text size</Button>
                <Button variant="outline" className="w-full justify-start">Magnifier</Button>
                <Button variant="outline" className="w-full justify-start">Color filters</Button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Hearing</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">Audio</Button>
                <Button variant="outline" className="w-full justify-start">Captions</Button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Interaction</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">Speech</Button>
                <Button variant="outline" className="w-full justify-start">Keyboard</Button>
                <Button variant="outline" className="w-full justify-start">Mouse</Button>
              </div>
            </Card>
          </div>
        );

      case "power":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Power & Battery</h2>
              <p className="text-muted-foreground mb-6">Manage power settings and battery usage</p>
            </div>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Power Mode</h3>
              <div>
                <label className="text-sm font-medium mb-3 block">Select power mode</label>
                <Select value={powerMode} onValueChange={(value) => { setPowerMode(value); handleSave("settings_power_mode", value); }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="power-saver">Power Saver</SelectItem>
                    <SelectItem value="balanced">Balanced (Recommended)</SelectItem>
                    <SelectItem value="high-performance">High Performance</SelectItem>
                    <SelectItem value="maximum">Maximum Performance</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-2">
                  {powerMode === "power-saver" && "Extends battery life by reducing performance"}
                  {powerMode === "balanced" && "Balances performance and energy consumption"}
                  {powerMode === "high-performance" && "Prioritizes performance over battery life"}
                  {powerMode === "maximum" && "Maximum performance, highest power consumption"}
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Power Status</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Battery:</span>
                  <span className="text-green-500">98% (Charging)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Power Source:</span>
                  <span>Fusion Reactor</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated Runtime:</span>
                  <span>72 hours</span>
                </div>
              </div>
            </Card>
          </div>
        );
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Power & Battery</h2>
              <p className="text-muted-foreground mb-6">Manage power settings and battery usage</p>
            </div>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Power Status</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Power mode:</span>
                  <span>Best performance</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Screen timeout:</span>
                  <span>15 minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sleep mode:</span>
                  <span>30 minutes</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Power Plan</h3>
              <Select defaultValue="balanced">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="power-saver">Power saver</SelectItem>
                  <SelectItem value="balanced">Balanced (Recommended)</SelectItem>
                  <SelectItem value="high-performance">High performance</SelectItem>
                </SelectContent>
              </Select>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Advanced Power Settings</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">Display and sleep</Button>
                <Button variant="outline" className="w-full justify-start">Lid and power button</Button>
              </div>
            </Card>
          </div>
        );

      case "about":
        return (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl font-bold mb-4">About Urbanshade OS</h2>
              <p className="text-muted-foreground mb-6">Information about your system</p>
            </div>

            <Card className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 bg-primary/20 rounded-lg flex items-center justify-center">
                  <SettingsIcon className="w-12 h-12 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">URBANSHADE OS</h3>
                  <p className="text-muted-foreground">Version 2.0.0</p>
                  <p className="text-xs text-muted-foreground mt-1">Build 20250116</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">System Information</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>© 2025 Urbanshade Corporation</p>
                    <p>Deep Sea Research Division</p>
                    <p>All Rights Reserved</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.open('https://github.com/yourusername/urbanshade-os', '_blank')}
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Visit GitHub Repository
                  </Button>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Contributors</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors animate-fade-in">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Lead Developer</p>
                        <p className="text-sm text-muted-foreground">Main contributor</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors animate-fade-in" style={{ animationDelay: '0.1s' }}>
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">UI/UX Designer</p>
                        <p className="text-sm text-muted-foreground">Interface design</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors animate-fade-in" style={{ animationDelay: '0.2s' }}>
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Quality Assurance</p>
                        <p className="text-sm text-muted-foreground">Testing & bug fixes</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-3">License & Legal</h4>
                  <p className="text-sm text-muted-foreground">
                    This software is provided as-is for research and development purposes. 
                    Urbanshade Corporation assumes no liability for any incidents, accidents, 
                    or anomalies that may occur during operation.
                  </p>
                </div>

                <div className="pt-4 border-t space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      localStorage.removeItem("urbanshade_last_seen_version");
                      window.location.reload();
                    }}
                  >
                    View Changelog
                  </Button>
                  <Button variant="outline" className="w-full">
                    View Open Source Licenses
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        );

      default:
        return <div>Select a category</div>;
    }
  };

  return (
    <>
      <div className="flex h-full bg-background">
        {/* Sidebar */}
        <div className="w-64 border-r border-border bg-muted/30 p-4 overflow-auto">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Find a setting" 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            {categories
              .filter(cat => cat.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
                  selectedCategory === category.id
                    ? "bg-primary/20 text-primary"
                    : "hover:bg-muted text-foreground"
                }`}
              >
                {category.icon}
                <span className="text-sm font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto p-8">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Factory Reset Confirmation Dialog */}
      <Dialog open={showFactoryResetDialog} onOpenChange={setShowFactoryResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Confirm Factory Reset
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. All data, settings, installed apps, and user accounts will be permanently deleted. 
              The system will restart and require setup again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFactoryResetDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleFactoryReset}>
              Reset System
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Account Dialog */}
      <Dialog open={showAddAccountDialog} onOpenChange={setShowAddAccountDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Account</DialogTitle>
            <DialogDescription>
              Create a new user account for this device.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Username</label>
              <Input
                value={newAccountUsername}
                onChange={(e) => setNewAccountUsername(e.target.value)}
                placeholder="Enter username"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                value={newAccountPassword}
                onChange={(e) => setNewAccountPassword(e.target.value)}
                placeholder="Enter password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddAccountDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAccount}>
              Create Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sign Out Confirmation Dialog */}
      <Dialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogOut className="w-5 h-5 text-red-400" />
              Sign Out of Online Account
            </DialogTitle>
            <DialogDescription>
              You will be signed out of your online account. Your local data will remain, but cloud sync will be disabled until you sign in again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSignOutDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={async () => {
                await signOut();
                setShowSignOutDialog(false);
                toast.success("Signed out successfully");
              }}
            >
              Sign Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sync Conflict Dialog */}
      <SyncConflictDialog
        open={showConflictDialog || hasConflict}
        onClose={() => setShowConflictDialog(false)}
        cloudSettings={cloudSettings}
        onUseLocal={() => resolveConflict("local")}
        onUseCloud={() => {
          resolveConflict("cloud");
          setTimeout(() => window.location.reload(), 500);
        }}
        onMerge={() => {
          resolveConflict("merge");
          setTimeout(() => window.location.reload(), 500);
        }}
      />
    </>
  );
};
