import { useState, useEffect } from "react";
import { Taskbar } from "./Taskbar";
import { DesktopIcon } from "./DesktopIcon";
import { StartMenu } from "./StartMenu";
import { WindowManager } from "./WindowManager";
import { RecoveryMode } from "./RecoveryMode";
import { FileText, Database, Activity, Radio, FileBox, AlertTriangle, Terminal, Users, Wifi, Cpu, Mail, Globe, Music, Camera, Shield, MapPin, BookOpen, Zap, Wind, Calculator as CalcIcon, Lock, FileWarning, Grid3x3, ShoppingBag, StickyNote, Palette, Volume2, CloudRain, Clock as ClockIcon, Calendar, Newspaper, Key, HardDrive, FileArchive, FileText as PdfIcon, Sheet, Presentation, Video, Image, Mic, Gamepad2, MessageSquare, VideoIcon, MailOpen, FolderUp, TerminalSquare, Network, HardDrive as DiskIcon, Settings as SettingsIcon, Activity as PerformanceIcon, ScanLine, Languages, BookOpenCheck, Globe2, MapPinned, Telescope, Beaker, Calculator as PhysicsIcon, Fingerprint, Lock as EncryptionIcon, KeyRound, Download, Puzzle, Skull } from "lucide-react";

export interface App {
  id: string;
  name: string;
  icon: React.ReactNode;
  run: () => void;
  minimalInclude?: boolean;
  standardInclude?: boolean;
  downloadable?: boolean;
}
export const Desktop = ({ 
  onLogout, 
  onReboot, 
  onShutdown,
  onCriticalKill, 
  onLockdown, 
  onEnterBios, 
  onUpdate 
}: { 
  onLogout: () => void; 
  onReboot: () => void; 
  onShutdown?: () => void;
  onCriticalKill: (processName: string, type?: "kernel" | "virus" | "bluescreen" | "memory" | "corruption" | "overload") => void; 
  onLockdown?: (protocolName: string) => void; 
  onEnterBios?: () => void; 
  onUpdate?: () => void; 
}) => {
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [windows, setWindows] = useState<Array<{ id: string; app: App; zIndex: number; minimized?: boolean }>>([]);
  const [nextZIndex, setNextZIndex] = useState(100);
  
  // Load background gradient from settings
  const [bgGradient, setBgGradient] = useState(() => {
    const start = localStorage.getItem('settings_bg_gradient_start') || '#1a1a2e';
    const end = localStorage.getItem('settings_bg_gradient_end') || '#16213e';
    return { start, end };
  });

  // Listen for settings changes
  useEffect(() => {
    const handleStorageChange = () => {
      const start = localStorage.getItem('settings_bg_gradient_start') || '#1a1a2e';
      const end = localStorage.getItem('settings_bg_gradient_end') || '#16213e';
      setBgGradient({ start, end });
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  const [draggedIcon, setDraggedIcon] = useState<string | null>(null);
  const [iconPositions, setIconPositions] = useState<Record<string, { x: number; y: number }>>(() => {
    const saved = localStorage.getItem('icon_positions');
    return saved ? JSON.parse(saved) : {};
  });
  const [installedApps, setInstalledApps] = useState<string[]>(() => {
    const installed = localStorage.getItem('urbanshade_installed_apps');
    return installed ? JSON.parse(installed) : [];
  });

  const openWindow = (app: App) => {
    const existing = windows.find(w => w.id === app.id);
    if (existing) {
      // Bring to front
      setWindows(prev => prev.map(w => 
        w.id === app.id ? { ...w, zIndex: nextZIndex } : w
      ));
      setNextZIndex(prev => prev + 1);
    } else {
      setWindows(prev => [...prev, { id: app.id, app, zIndex: nextZIndex }]);
      setNextZIndex(prev => prev + 1);
    }
    setStartMenuOpen(false);
  };

  const closeWindow = (id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
  };

  const minimizeWindow = (id: string) => {
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, minimized: true } : w
    ));
  };

  const restoreWindow = (id: string) => {
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, minimized: false, zIndex: nextZIndex } : w
    ));
    setNextZIndex(prev => prev + 1);
  };

  const focusWindow = (id: string) => {
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, zIndex: nextZIndex, minimized: false } : w
    ));
    setNextZIndex(prev => prev + 1);
  };

  // Get installation type to filter apps
  const installType = localStorage.getItem('urbanshade_install_type') || 'standard';
  
  const allApps: App[] = [
    {
      id: "app-store",
      name: "App Store",
      icon: <ShoppingBag className="w-11 h-11" />,
      run: () => openWindow(allApps[0]),
      minimalInclude: true
    },
    {
      id: "explorer",
      name: "File Explorer",
      icon: <FileText className="w-11 h-11" />,
      run: () => openWindow(allApps[1]),
      minimalInclude: true
    },
    {
      id: "monitor",
      name: "System Monitor",
      icon: <Activity className="w-11 h-11" />,
      run: () => openWindow(allApps[2]),
      minimalInclude: true
    },
    {
      id: "personnel",
      name: "Personnel",
      icon: <Users className="w-11 h-11" />,
      run: () => openWindow(allApps[3]),
      standardInclude: true
    },
    {
      id: "logger",
      name: "Action Logger",
      icon: <Database className="w-11 h-11" />,
      run: () => openWindow(allApps[4]),
      minimalInclude: true
    },
    {
      id: "network",
      name: "Network Scanner",
      icon: <Wifi className="w-11 h-11" />,
      run: () => openWindow(allApps[5]),
      standardInclude: true
    },
    {
      id: "terminal",
      name: "Terminal",
      icon: <Terminal className="w-11 h-11" />,
      run: () => openWindow(allApps[6]),
      minimalInclude: true
    },
    {
      id: "task-manager",
      name: "Task Manager",
      icon: <Cpu className="w-11 h-11" />,
      run: () => openWindow(allApps[7]),
      minimalInclude: true
    },
    {
      id: "messages",
      name: "Messages",
      icon: <Mail className="w-11 h-11" />,
      run: () => openWindow(allApps[8]),
      standardInclude: true
    },
    {
      id: "incidents",
      name: "Incidents",
      icon: <FileWarning className="w-11 h-11" />,
      run: () => openWindow(allApps[9]),
      standardInclude: true
    },
    {
      id: "database",
      name: "Specimen DB",
      icon: <Database className="w-11 h-11" />,
      run: () => openWindow(allApps[10]),
      standardInclude: true
    },
    {
      id: "browser",
      name: "Browser",
      icon: <Globe className="w-11 h-11" />,
      run: () => openWindow(allApps[11]),
      minimalInclude: true
    },
    {
      id: "audio-logs",
      name: "Audio Logs",
      icon: <Music className="w-11 h-11" />,
      run: () => openWindow(allApps[12])
    },
    {
      id: "cameras",
      name: "Security Cameras",
      icon: <Camera className="w-11 h-11" />,
      run: () => openWindow(allApps[13]),
      standardInclude: true
    },
    {
      id: "protocols",
      name: "Emergency Protocols",
      icon: <Shield className="w-11 h-11" />,
      run: () => openWindow(allApps[14]),
      standardInclude: true
    },
    {
      id: "map",
      name: "Facility Map",
      icon: <MapPin className="w-11 h-11" />,
      run: () => openWindow(allApps[15]),
      standardInclude: true
    },
    {
      id: "research",
      name: "Research Notes",
      icon: <BookOpen className="w-11 h-11" />,
      run: () => openWindow(allApps[16])
    },
    {
      id: "power",
      name: "Power Grid",
      icon: <Zap className="w-11 h-11" />,
      run: () => openWindow(allApps[17])
    },
    {
      id: "containment",
      name: "Containment",
      icon: <Lock className="w-11 h-11" />,
      run: () => openWindow(allApps[18])
    },
    {
      id: "environment",
      name: "Environment",
      icon: <Wind className="w-11 h-11" />,
      run: () => openWindow(allApps[19])
    },
    {
      id: "calculator",
      name: "Calculator",
      icon: <CalcIcon className="w-11 h-11" />,
      run: () => openWindow(allApps[20]),
      minimalInclude: true
    },
    {
      id: "planner",
      name: "Facility Planner",
      icon: <Grid3x3 className="w-11 h-11" />,
      run: () => openWindow(allApps[21]),
      standardInclude: true
    },
    {
      id: "downloads",
      name: "Downloads",
      icon: <Download className="w-11 h-11" />,
      run: () => openWindow(allApps[22]),
      minimalInclude: true
    },
    {
      id: "plugin-store",
      name: "Plugin Store",
      icon: <Puzzle className="w-11 h-11" />,
      run: () => openWindow(allApps[23]),
      minimalInclude: true
    },
    {
      id: "crash-app",
      name: "System Crash",
      icon: <Skull className="w-11 h-11" />,
      run: () => openWindow(allApps[24])
    },
    {
      id: "settings",
      name: "Settings",
      icon: <SettingsIcon className="w-11 h-11" />,
      run: () => openWindow(allApps[25]),
      minimalInclude: true
    },
    {
      id: "file-reader",
      name: "File Reader",
      icon: <FileText className="w-11 h-11" />,
      run: () => openWindow(allApps[26]),
      standardInclude: true
    },
    // Downloadable Apps
    {
      id: "notepad",
      name: "Notepad",
      icon: <StickyNote className="w-11 h-11" />,
      run: () => openWindow(allApps[27]),
      downloadable: true
    },
    {
      id: "paint",
      name: "Paint Tool",
      icon: <Palette className="w-11 h-11" />,
      run: () => openWindow(allApps[28]),
      downloadable: true
    },
    {
      id: "music-player",
      name: "Media Player",
      icon: <Volume2 className="w-11 h-11" />,
      run: () => openWindow(allApps[29]),
      downloadable: true
    },
    {
      id: "weather",
      name: "Weather Monitor",
      icon: <CloudRain className="w-11 h-11" />,
      run: () => openWindow(allApps[30]),
      downloadable: true
    },
    {
      id: "clock",
      name: "World Clock",
      icon: <ClockIcon className="w-11 h-11" />,
      run: () => openWindow(allApps[31]),
      downloadable: true
    },
    {
      id: "calendar",
      name: "Event Calendar",
      icon: <Calendar className="w-11 h-11" />,
      run: () => openWindow(allApps[32]),
      downloadable: true
    },
    {
      id: "notes",
      name: "Advanced Notes",
      icon: <Newspaper className="w-11 h-11" />,
      run: () => openWindow(allApps[33]),
      downloadable: true
    },
    {
      id: "vpn",
      name: "Secure VPN",
      icon: <Shield className="w-11 h-11" />,
      run: () => openWindow(allApps[34]),
      downloadable: true
    },
    {
      id: "firewall",
      name: "Network Firewall",
      icon: <Shield className="w-11 h-11" />,
      run: () => openWindow(allApps[35]),
      downloadable: true
    },
    {
      id: "antivirus",
      name: "Virus Scanner",
      icon: <Shield className="w-11 h-11" />,
      run: () => openWindow(allApps[36]),
      downloadable: true
    },
    {
      id: "backup",
      name: "Data Backup",
      icon: <HardDrive className="w-11 h-11" />,
      run: () => openWindow(allApps[37]),
      downloadable: true
    },
    {
      id: "compression",
      name: "File Compressor",
      icon: <FileArchive className="w-11 h-11" />,
      run: () => openWindow(allApps[38]),
      downloadable: true
    },
    {
      id: "pdf-reader",
      name: "PDF Viewer",
      icon: <PdfIcon className="w-11 h-11" />,
      run: () => openWindow(allApps[39]),
      downloadable: true
    },
    {
      id: "spreadsheet",
      name: "Data Sheets",
      icon: <Sheet className="w-11 h-11" />,
      run: () => openWindow(allApps[40]),
      downloadable: true
    },
    {
      id: "presentation",
      name: "Slide Maker",
      icon: <Presentation className="w-11 h-11" />,
      run: () => openWindow(allApps[41]),
      downloadable: true
    },
    {
      id: "video-editor",
      name: "Video Editor",
      icon: <Video className="w-11 h-11" />,
      run: () => openWindow(allApps[42]),
      downloadable: true
    },
    {
      id: "image-viewer",
      name: "Photo Gallery",
      icon: <Image className="w-11 h-11" />,
      run: () => openWindow(allApps[43]),
      downloadable: true
    },
    {
      id: "audio-editor",
      name: "Sound Editor",
      icon: <Mic className="w-11 h-11" />,
      run: () => openWindow(allApps[44]),
      downloadable: true
    },
    {
      id: "game-center",
      name: "Game Hub",
      icon: <Gamepad2 className="w-11 h-11" />,
      run: () => openWindow(allApps[45]),
      downloadable: true
    },
    {
      id: "chat",
      name: "Instant Chat",
      icon: <MessageSquare className="w-11 h-11" />,
      run: () => openWindow(allApps[46]),
      downloadable: true
    },
    {
      id: "video-call",
      name: "Video Conference",
      icon: <VideoIcon className="w-11 h-11" />,
      run: () => openWindow(allApps[47]),
      downloadable: true
    },
    {
      id: "email-client",
      name: "Mail Client Pro",
      icon: <MailOpen className="w-11 h-11" />,
      run: () => openWindow(allApps[48]),
      downloadable: true
    },
    {
      id: "ftp",
      name: "FTP Manager",
      icon: <FolderUp className="w-11 h-11" />,
      run: () => openWindow(allApps[49]),
      downloadable: true
    },
    {
      id: "ssh",
      name: "SSH Terminal",
      icon: <TerminalSquare className="w-11 h-11" />,
      run: () => openWindow(allApps[50]),
      downloadable: true
    },
    {
      id: "packet-analyzer",
      name: "Packet Sniffer",
      icon: <Network className="w-11 h-11" />,
      run: () => openWindow(allApps[51]),
      downloadable: true
    },
    {
      id: "disk-manager",
      name: "Disk Utility",
      icon: <DiskIcon className="w-11 h-11" />,
      run: () => openWindow(allApps[52]),
      downloadable: true
    },
    {
      id: "registry",
      name: "Registry Editor",
      icon: <Key className="w-11 h-11" />,
      run: () => openWindow(allApps[53]),
      downloadable: true
    },
    {
      id: "performance",
      name: "Performance Analyzer",
      icon: <PerformanceIcon className="w-11 h-11" />,
      run: () => openWindow(allApps[54]),
      downloadable: true
    },
    {
      id: "scanner",
      name: "Document Scanner",
      icon: <ScanLine className="w-11 h-11" />,
      run: () => openWindow(allApps[55]),
      downloadable: true
    },
    {
      id: "translator",
      name: "Language Translator",
      icon: <Languages className="w-11 h-11" />,
      run: () => openWindow(allApps[56]),
      downloadable: true
    },
    {
      id: "dictionary",
      name: "Digital Dictionary",
      icon: <BookOpenCheck className="w-11 h-11" />,
      run: () => openWindow(allApps[57]),
      downloadable: true
    },
    {
      id: "encyclopedia",
      name: "Encyclopedia",
      icon: <Globe2 className="w-11 h-11" />,
      run: () => openWindow(allApps[58]),
      downloadable: true
    },
    {
      id: "map-viewer",
      name: "Map Navigator",
      icon: <MapPinned className="w-11 h-11" />,
      run: () => openWindow(allApps[59]),
      downloadable: true
    },
    {
      id: "gps",
      name: "GPS Tracker",
      icon: <MapPin className="w-11 h-11" />,
      run: () => openWindow(allApps[60]),
      downloadable: true
    },
    {
      id: "astronomy",
      name: "Star Chart",
      icon: <Telescope className="w-11 h-11" />,
      run: () => openWindow(allApps[61]),
      downloadable: true
    },
    {
      id: "chemistry",
      name: "Chemistry Lab",
      icon: <Beaker className="w-11 h-11" />,
      run: () => openWindow(allApps[62]),
      downloadable: true
    },
    {
      id: "physics",
      name: "Physics Simulator",
      icon: <PhysicsIcon className="w-11 h-11" />,
      run: () => openWindow(allApps[63]),
      downloadable: true
    },
    {
      id: "biometric",
      name: "Biometric Scanner",
      icon: <Fingerprint className="w-11 h-11" />,
      run: () => openWindow(allApps[64]),
      downloadable: true
    },
    {
      id: "encryption",
      name: "File Encryptor",
      icon: <EncryptionIcon className="w-11 h-11" />,
      run: () => openWindow(allApps[65]),
      downloadable: true
    },
    {
      id: "password-manager",
      name: "Password Vault",
      icon: <KeyRound className="w-11 h-11" />,
      run: () => openWindow(allApps[66]),
      downloadable: true
    }
  ];

  // Listen for app installations
  useEffect(() => {
    const handleStorage = () => {
      const installed = localStorage.getItem('urbanshade_installed_apps');
      setInstalledApps(installed ? JSON.parse(installed) : []);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Filter apps based on installation type and installed apps
  const apps = allApps.filter(app => {
    // If app is downloadable, only show if installed
    if (app.downloadable) {
      return installedApps.includes(app.id);
    }
    
    // For base apps, filter by install type
    if (installType === 'minimal') {
      return app.minimalInclude === true || app.id === 'app-store';
    } else if (installType === 'standard') {
      return app.minimalInclude === true || app.standardInclude === true || app.id === 'app-store';
    } else {
      // Full installation shows all base (non-downloadable) apps
      return true;
    }
  });

  const desktopApps = apps;

  const handleIconDragStart = (appId: string) => {
    setDraggedIcon(appId);
  };

  const handleIconDragEnd = (appId: string, x: number, y: number) => {
    const gridSize = 120;
    const snappedX = Math.round(x / gridSize) * gridSize;
    const snappedY = Math.round(y / gridSize) * gridSize;
    
    const newPositions = {
      ...iconPositions,
      [appId]: { x: snappedX, y: snappedY }
    };
    
    setIconPositions(newPositions);
    localStorage.setItem('icon_positions', JSON.stringify(newPositions));
    setDraggedIcon(null);
  };

  return (
    <div 
      className="relative h-screen w-full overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${bgGradient.start} 0%, ${bgGradient.end} 100%)`
      }}
    >
      {/* Desktop Icons */}
      <div className="relative z-10 p-7">
        <div className="relative" style={{ minHeight: '100vh' }}>
          {desktopApps.map((app, index) => {
            const position = iconPositions[app.id];
            const gridSize = 120;
            const defaultX = (index % 10) * gridSize + 20;
            const defaultY = Math.floor(index / 10) * gridSize + 20;
            
            return (
              <div
                key={app.id}
                style={{
                  position: 'absolute',
                  left: position?.x ?? defaultX,
                  top: position?.y ?? defaultY,
                  width: gridSize,
                }}
              >
                <DesktopIcon 
                  app={app} 
                  onOpen={openWindow}
                  onDragStart={handleIconDragStart}
                  onDragEnd={handleIconDragEnd}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Windows */}
      <WindowManager 
        windows={windows} 
        onClose={closeWindow}
        onFocus={focusWindow}
        onMinimize={minimizeWindow}
        allWindows={windows}
        onCloseWindow={closeWindow}
        onCriticalKill={onCriticalKill}
        onLockdown={onLockdown}
        onUpdate={onUpdate}
      />

      {/* Start Menu */}
      <StartMenu 
        open={startMenuOpen} 
        apps={apps}
        onClose={() => setStartMenuOpen(false)}
        onOpenApp={openWindow}
        onReboot={onReboot}
        onShutdown={onShutdown}
        onLogout={onLogout}
      />

      {/* Taskbar */}
      <Taskbar 
        onStartClick={() => setStartMenuOpen(!startMenuOpen)}
        pinnedApps={apps.slice(0, 4)}
        onPinnedClick={openWindow}
        windows={windows}
        onRestoreWindow={restoreWindow}
      />
    </div>
  );
};
