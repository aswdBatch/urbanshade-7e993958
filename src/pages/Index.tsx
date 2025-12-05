import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Desktop } from "@/components/Desktop";
import { UserSelectionScreen } from "@/components/UserSelectionScreen";
import { BootScreen } from "@/components/BootScreen";
import { BiosScreen } from "@/components/BiosScreen";
import { ShutdownScreen } from "@/components/ShutdownScreen";
import { RebootScreen } from "@/components/RebootScreen";
import { CrashScreen, CrashType, CrashData, triggerCrash } from "@/components/CrashScreen";
import { InstallationScreen } from "@/components/InstallationScreen";
import { MaintenanceMode } from "@/components/MaintenanceMode";
import { LockdownScreen } from "@/components/LockdownScreen";
import { FirstTimeTour } from "@/components/FirstTimeTour";
import { RecoveryMode } from "@/components/RecoveryMode";
import { DisclaimerScreen } from "@/components/DisclaimerScreen";
import { OOBEScreen } from "@/components/OOBEScreen";
import { ChangelogDialog } from "@/components/ChangelogDialog";
import { UpdateScreen } from "@/components/UpdateScreen";
import { AdminPanel } from "@/components/AdminPanel";
import { LogoutScreen } from "@/components/LogoutScreen";
import { DevModeConsole } from "@/components/DevModeConsole";
import { BugcheckScreen, createBugcheck, BugcheckData } from "@/components/BugcheckScreen";
import { actionDispatcher } from "@/lib/actionDispatcher";
import { systemBus } from "@/lib/systemBus";
import { commandQueue, QueuedCommand } from "@/lib/commandQueue";

const Index = () => {
  const [adminSetupComplete, setAdminSetupComplete] = useState(false);
  const [showingBiosTransition, setShowingBiosTransition] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [biosComplete, setBiosComplete] = useState(() => {
    // Check if we should reboot to BIOS
    const rebootToBios = localStorage.getItem("urbanshade_reboot_to_bios");
    if (rebootToBios === "true") {
      localStorage.removeItem("urbanshade_reboot_to_bios");
      return false;
    }
    // Don't boot to BIOS by default - skip unless user explicitly enters it
    return true;
  });
  const [booted, setBooted] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [shuttingDown, setShuttingDown] = useState(false);
  const [rebooting, setRebooting] = useState(false);
  const [blackScreen, setBlackScreen] = useState(false);
  const [crashed, setCrashed] = useState(false);
  const [crashData, setCrashData] = useState<CrashData | null>(null);
  const [killedProcess, setKilledProcess] = useState<string>("");
  const [crashType, setCrashType] = useState<"kernel" | "virus" | "bluescreen" | "memory" | "corruption" | "overload">("kernel");
  const [loggingOut, setLoggingOut] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [customCrashData, setCustomCrashData] = useState<{ title: string; message: string } | null>(null);
  const [bugcheckData, setBugcheckData] = useState<BugcheckData | null>(null);
  const [lockdownMode, setLockdownMode] = useState(false);
  const [lockdownProtocol, setLockdownProtocol] = useState<string>("");
  const [showTour, setShowTour] = useState(false);
  const [safeMode, setSafeMode] = useState(false);
  const [needsRecovery, setNeedsRecovery] = useState(false);
  const [inRecoveryMode, setInRecoveryMode] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [keyBuffer, setKeyBuffer] = useState("");
  const [oobeComplete, setOobeComplete] = useState(() => {
    return localStorage.getItem("urbanshade_oobe_complete") === "true";
  });
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(() => {
    return localStorage.getItem("urbanshade_disclaimer_accepted") === "true";
  });
  const [devModeOpen, setDevModeOpen] = useState(false);

  // Check if admin setup is complete and setup key listeners
  useEffect(() => {
    try {
      const adminData = localStorage.getItem("urbanshade_admin");
      if (adminData) {
        // Validate admin data structure
        const parsed = JSON.parse(adminData);
        if (parsed && parsed.id && parsed.name && parsed.password) {
          setAdminSetupComplete(true);
        } else {
          console.warn("Invalid admin data structure, clearing...");
          localStorage.removeItem("urbanshade_admin");
          setAdminSetupComplete(false);
        }
      } else {
        setAdminSetupComplete(false);
      }
    } catch (e) {
      console.error("Error checking admin setup:", e);
      localStorage.removeItem("urbanshade_admin");
      setAdminSetupComplete(false);
    }

    // Keyboard shortcuts with chromebook-friendly typed keys
    const handleKeyDown = (e: KeyboardEvent) => {
      // Accumulate typed characters for chromebook-friendly shortcuts
      if (e.key.length === 1) {
        const newBuffer = (keyBuffer + e.key.toLowerCase()).slice(-10);
        setKeyBuffer(newBuffer);
        
        // Check for typed commands
        if (newBuffer.endsWith("del") || newBuffer.endsWith("delete")) {
          if (!booted && !inRecoveryMode) {
            e.preventDefault();
            if (rebooting) {
              setRebooting(false);
              setBlackScreen(false);
            }
            setShowingBiosTransition(true);
            setTimeout(() => {
              setBiosComplete(false);
              setShowingBiosTransition(false);
            }, 1500);
            toast.info("Entering BIOS Setup...");
            setKeyBuffer("");
          }
        }
      }
      
      // F2 for recovery mode during boot
      if (e.key === "F2" && !booted && !inRecoveryMode) {
        e.preventDefault();
        setInRecoveryMode(true);
        toast.info("Entering Recovery Mode...");
      }
      // DEL key to access BIOS (before boot or during reboot)
      if ((e.key === "Delete" || e.key === "Del") && !booted && !inRecoveryMode) {
        e.preventDefault();
        // If rebooting, interrupt and go to BIOS
        if (rebooting) {
          setRebooting(false);
          setBlackScreen(false);
        }
        setShowingBiosTransition(true);
        setTimeout(() => {
          setBiosComplete(false);
          setShowingBiosTransition(false);
        }, 1500);
        toast.info("Entering BIOS Setup...");
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Expose console commands to window object
    (window as any).adminPanel = () => {
      setShowAdminPanel(true);
      console.log("%c[SYSTEM] Admin Panel Opened", "color: #00ff00; font-weight: bold");
    };

    (window as any).maintenanceMode = () => {
      setMaintenanceMode(true);
      console.log("%c[SYSTEM] Entering Maintenance Mode...", "color: #ffff00; font-weight: bold");
    };

    (window as any).normalMode = () => {
      setMaintenanceMode(false);
      console.log("%c[SYSTEM] Returning to Normal Mode...", "color: #00ff00; font-weight: bold");
    };

    (window as any).devMode = () => {
      setDevModeOpen(true);
      console.log("%c[SYSTEM] Opening Developer Console...", "color: #ff00ff; font-weight: bold");
    };

    // Show available commands in console
    console.log(
      "%c[URBANSHADE OS] Console Commands Available",
      "color: #00ffff; font-weight: bold; font-size: 14px"
    );
    console.log(
      "%cadminPanel() - Access admin panel (password required)",
      "color: #888888"
    );
    console.log(
      "%cmaintenanceMode() - Enter maintenance mode",
      "color: #888888"
    );
    console.log(
      "%cnormalMode() - Return to normal mode",
      "color: #888888"
    );
    console.log(
      "%cdevMode() - Open developer console",
      "color: #ff00ff"
    );
    console.log(
      "%c\nHint: Check the HTML source for hidden secrets...",
      "color: #ffaa00; font-style: italic"
    );

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [loggedIn, lockdownMode, crashed, shuttingDown, rebooting, booted, biosComplete, inRecoveryMode, keyBuffer]);

  // Command Queue Polling - Check for commands from DEF-DEV 4 times per second
  useEffect(() => {
    const handleCommand = (cmd: QueuedCommand) => {
      actionDispatcher.system(`Executing queued command: ${cmd.type}`, { source: cmd.source });
      
      switch (cmd.type) {
        case 'CRASH':
          const crash = triggerCrash(cmd.payload.type as CrashType, { process: cmd.payload.process || 'queue.exe' });
          setCrashData(crash);
          setCrashed(true);
          break;
          
        case 'BUGCHECK':
          const bugcheck = createBugcheck(cmd.payload.code, cmd.payload.description, cmd.source);
          setBugcheckData(bugcheck);
          break;
          
        case 'REBOOT':
          handleReboot();
          break;
          
        case 'SHUTDOWN':
          handleShutdown();
          break;
          
        case 'LOCKDOWN':
          setLockdownProtocol(cmd.payload.protocol || 'ALPHA');
          setLockdownMode(true);
          break;
          
        case 'RECOVERY':
          setInRecoveryMode(true);
          break;
          
        case 'WIPE':
          localStorage.clear();
          window.location.reload();
          break;
          
        case 'WRITE_STORAGE':
          if (cmd.payload.key && cmd.payload.value !== undefined) {
            localStorage.setItem(cmd.payload.key, cmd.payload.value);
            actionDispatcher.file(`Storage write: ${cmd.payload.key}`);
          }
          break;
          
        case 'DELETE_STORAGE':
          if (cmd.payload.key) {
            localStorage.removeItem(cmd.payload.key);
            actionDispatcher.file(`Storage delete: ${cmd.payload.key}`);
          }
          break;
          
        case 'TOAST':
          const toastType = cmd.payload.type || 'info';
          if (toastType === 'success') toast.success(cmd.payload.message);
          else if (toastType === 'error') toast.error(cmd.payload.message);
          else if (toastType === 'warning') toast.warning(cmd.payload.message);
          else toast.info(cmd.payload.message);
          break;
          
        case 'CUSTOM':
          // Handle custom commands via system bus
          systemBus.emit('CUSTOM_COMMAND', cmd.payload);
          break;
      }
    };

    // Subscribe to command queue
    const unsubscribe = commandQueue.onAny(handleCommand);
    
    // Start polling (4 times per second = 250ms)
    commandQueue.startPolling(250);
    
    // Also check for legacy pending crashes/bugchecks (backwards compatibility)
    const pendingCrash = localStorage.getItem('urbanshade_pending_crash');
    if (pendingCrash) {
      localStorage.removeItem('urbanshade_pending_crash');
      try {
        const data = JSON.parse(pendingCrash);
        actionDispatcher.system(`Processing legacy pending crash: ${data.type}`);
        const crash = triggerCrash(data.type as CrashType, { process: data.process || 'admin.exe' });
        setCrashData(crash);
        setCrashed(true);
      } catch (e) {
        console.error("Failed to parse pending crash", e);
      }
    }

    const pendingBugcheck = localStorage.getItem('urbanshade_pending_bugcheck');
    if (pendingBugcheck) {
      localStorage.removeItem('urbanshade_pending_bugcheck');
      try {
        const data = JSON.parse(pendingBugcheck);
        actionDispatcher.system(`Processing legacy pending bugcheck: ${data.code}`);
        const bugcheck = createBugcheck(data.code, data.description, 'DEF-DEV Admin');
        setBugcheckData(bugcheck);
      } catch (e) {
        console.error("Failed to parse pending bugcheck", e);
      }
    }

    return () => {
      unsubscribe();
      commandQueue.stopPolling();
    };
  }, []);

  // System Bus listeners for cross-component communication
  useEffect(() => {
    const unsubCrash = systemBus.on("TRIGGER_CRASH", (event) => {
      const { crashType, process } = event.payload || {};
      if (crashType) {
        const crash = triggerCrash(crashType, { process: process || 'systembus.exe' });
        setCrashData(crash);
        setCrashed(true);
        setShowAdminPanel(false);
      }
    });

    const unsubBugcheck = systemBus.on("TRIGGER_BUGCHECK", (event) => {
      const { code, description } = event.payload || {};
      if (code) {
        const bugcheck = createBugcheck(code, description || 'System Bus triggered bugcheck', 'SystemBus');
        setBugcheckData(bugcheck);
        setShowAdminPanel(false);
      }
    });

    const unsubRecovery = systemBus.on("ENTER_RECOVERY", () => {
      setInRecoveryMode(true);
      setShowAdminPanel(false);
    });

    const unsubReboot = systemBus.on("TRIGGER_REBOOT", () => {
      handleReboot();
      setShowAdminPanel(false);
    });

    const unsubShutdown = systemBus.on("TRIGGER_SHUTDOWN", () => {
      handleShutdown();
      setShowAdminPanel(false);
    });

    const unsubDevMode = systemBus.on("OPEN_DEV_MODE", () => {
      setDevModeOpen(true);
    });

    const unsubCloseAdmin = systemBus.on("CLOSE_ADMIN_PANEL", () => {
      setShowAdminPanel(false);
    });

    return () => {
      unsubCrash();
      unsubBugcheck();
      unsubRecovery();
      unsubReboot();
      unsubShutdown();
      unsubDevMode();
      unsubCloseAdmin();
    };
  }, []);

  // Check for first time tour
  useEffect(() => {
    if (loggedIn && !crashed && !lockdownMode) {
      const tourCompleted = localStorage.getItem("urbanshade_tour_completed");
      if (!tourCompleted) {
        setTimeout(() => setShowTour(true), 2000);
      }
    }
  }, [loggedIn, crashed, lockdownMode]);

  const handleReboot = () => {
    setLoggedIn(false);
    setRebooting(true);
  };

  const handleRebootComplete = () => {
    setRebooting(false);
    setLoggedIn(false);
    setBlackScreen(true);
    // Black screen for 3 seconds
    setTimeout(() => {
      setBlackScreen(false);
      setBooted(false);
    }, 3000);
  };

  const handleEnterBios = () => {
    setShowingBiosTransition(true);
    setTimeout(() => {
      setBiosComplete(false);
      setBooted(false);
      setShowingBiosTransition(false);
    }, 1500);
  };

  const handleInstallationComplete = (adminData: { username: string; password: string }) => {
    try {
      const fullAdminData = {
        username: adminData.username,
        password: adminData.password,
        id: "P000",
        name: `Administrator (${adminData.username})`,
        role: "System Administrator",
        clearance: 5,
        department: "Administration",
        location: "Control Room",
        status: "active",
        phone: "x1000",
        email: "admin@urbanshade.corp",
        createdAt: new Date().toISOString()
      };

      localStorage.setItem("urbanshade_admin", JSON.stringify(fullAdminData));
      setAdminSetupComplete(true);
      
      // Show OOBE after installation if not already complete
      if (!oobeComplete) {
        localStorage.removeItem("urbanshade_oobe_complete");
      }
    } catch (e) {
      // If setup fails, create admin with NO PASSWORD so user can still log in
      console.error("Setup failed, creating passwordless admin:", e);
      const fallbackAdmin = {
        username: "Admin",
        password: "", // No password
        id: "P000",
        name: "Administrator (Admin)",
        role: "System Administrator",
        clearance: 5,
        department: "Administration",
        location: "Control Room",
        status: "active",
        createdAt: new Date().toISOString()
      };
      localStorage.setItem("urbanshade_admin", JSON.stringify(fallbackAdmin));
      setAdminSetupComplete(true);
    }
  };

  const handleShutdownComplete = () => {
    setShuttingDown(false);
    // Wait 3 seconds before showing nothing
    setTimeout(() => {
      setBooted(false);
    }, 3000);
  };

  const handleLogout = () => {
    setLoggingOut(true);
  };

  const handleLogoutComplete = () => {
    setLoggingOut(false);
    setLoggedIn(false);
    setIsGuestMode(false);
    localStorage.removeItem("urbanshade_current_user");
  };

  const handleShutdown = () => {
    setLoggedIn(false);
    setShuttingDown(true);
  };

  const handleCriticalKill = (processName: string, type: "kernel" | "virus" | "bluescreen" | "memory" | "corruption" | "overload" = "kernel") => {
    setKilledProcess(processName);
    setCrashType(type);
    setCustomCrashData(null);
    setCrashed(true);
    
    // Some crash types require recovery mode
    if (type === "corruption" || type === "virus" || Math.random() < 0.3) {
      setNeedsRecovery(true);
    }
  };

  const handleCustomCrash = (title: string, message: string, type: "kernel" | "virus" | "bluescreen" | "memory" | "corruption" | "overload") => {
    setCustomCrashData({ title, message });
    setKilledProcess("admin.custom");
    setCrashType(type);
    setCrashed(true);
  };

  const handleAdminCrash = (type: string) => {
    const crashTypes: any = {
      kernel: "kernel",
      bluescreen: "bluescreen",
      memory: "memory",
      corruption: "corruption",
      overload: "overload",
      virus: "virus"
    };
    handleCriticalKill("admin.panel", crashTypes[type] || "kernel");
  };

  const handleCrashReboot = () => {
    if (needsRecovery) {
      setInRecoveryMode(true);
      setCrashed(false);
    } else {
      setCrashed(false);
      setLoggedIn(false);
      setBooted(false);
      setKilledProcess("");
      setCrashType("kernel");
      setCustomCrashData(null);
    }
  };

  const handleLockdown = (protocolName: string) => {
    setLockdownMode(true);
    setLockdownProtocol(protocolName);
  };

  const handleLockdownAuthorized = () => {
    setLockdownMode(false);
    setLockdownProtocol("");
  };

  if (!disclaimerAccepted) {
    return <DisclaimerScreen onAccept={(skipInstall) => {
      localStorage.setItem("urbanshade_disclaimer_accepted", "true");
      setDisclaimerAccepted(true);
      
      if (skipInstall) {
        // Create default admin and skip installation
        const defaultAdmin = {
          username: "Admin",
          password: "admin",
          id: "P000",
          name: "Administrator (Admin)",
          role: "System Administrator",
          clearance: 5,
          department: "Administration",
          location: "Control Room",
          status: "active",
          phone: "x1000",
          email: "admin@urbanshade.corp",
          createdAt: new Date().toISOString()
        };
        localStorage.setItem("urbanshade_admin", JSON.stringify(defaultAdmin));
        setAdminSetupComplete(true);
      }
    }} />;
  }

  if (!adminSetupComplete) {
    return <InstallationScreen onComplete={handleInstallationComplete} />;
  }

  if (lockdownMode) {
    return <LockdownScreen onAuthorized={handleLockdownAuthorized} protocolName={lockdownProtocol} />;
  }

  if (bugcheckData) {
    return <BugcheckScreen 
      bugcheck={bugcheckData} 
      onRestart={() => {
        setBugcheckData(null);
        setBooted(false);
        setLoggedIn(false);
      }}
      onReportToDev={() => {
        setBugcheckData(null);
        window.open('/def-dev', '_blank');
      }}
    />;
  }

  if (crashed) {
    return <CrashScreen onReboot={handleCrashReboot} crashData={crashData || undefined} killedProcess={killedProcess} crashType={crashType} customData={customCrashData} />;
  }

  if (loggingOut) {
    const currentUser = localStorage.getItem("urbanshade_current_user");
    const username = currentUser ? JSON.parse(currentUser).name : "User";
    return <LogoutScreen onComplete={handleLogoutComplete} username={username} />;
  }

  if (shuttingDown) {
    return <ShutdownScreen onComplete={handleShutdownComplete} />;
  }

  if (rebooting) {
    return <RebootScreen onComplete={handleRebootComplete} />;
  }

  if (blackScreen) {
    return <div className="fixed inset-0 bg-black" />;
  }

  if (inRecoveryMode) {
    return <RecoveryMode onExit={() => {
      setInRecoveryMode(false);
      setNeedsRecovery(false);
      setBooted(false);
      setLoggedIn(false);
      setKilledProcess("");
      setCrashType("kernel");
      setCustomCrashData(null);
    }} />;
  }

  if (!biosComplete) {
    return <BiosScreen onExit={() => setBiosComplete(true)} />;
  }

  if (!booted) {
    return <BootScreen 
      onComplete={() => setBooted(true)} 
      onSafeMode={() => {
        setSafeMode(true);
        setBooted(true);
      }}
    />;
  }

  // Skip login on first boot after installation
  const isFirstBoot = localStorage.getItem("urbanshade_first_boot") === "true";
  
  if (!loggedIn) {
    if (isFirstBoot) {
      // Auto-login on first boot, then clear the flag
      localStorage.removeItem("urbanshade_first_boot");
      setLoggedIn(true);
      return null;
    }
    return (
      <UserSelectionScreen 
        onLogin={(guest) => {
          setIsGuestMode(guest || false);
          setLoggedIn(true);
        }} 
        onShutdown={handleShutdown}
        onRestart={handleReboot}
      />
    );
  }

  // Show OOBE after first login
  if (!oobeComplete) {
    return <OOBEScreen onComplete={() => setOobeComplete(true)} />;
  }

  if (isUpdating) {
    return <UpdateScreen onComplete={() => {
      setIsUpdating(false);
      setBooted(false);
      setLoggedIn(false);
    }} />;
  }

  return (
    <>
      <Desktop 
        onLogout={handleLogout} 
        onReboot={handleReboot}
        onShutdown={handleShutdown}
        onCriticalKill={handleCriticalKill}
        onLockdown={handleLockdown}
        onEnterBios={handleEnterBios}
        onUpdate={() => setIsUpdating(true)}
      />
      <ChangelogDialog />
      {maintenanceMode && <MaintenanceMode onExit={() => setMaintenanceMode(false)} />}
      {showTour && <FirstTimeTour onComplete={() => setShowTour(false)} />}
      {showAdminPanel && (
        <AdminPanel 
          onExit={() => setShowAdminPanel(false)} 
          onCrash={handleAdminCrash}
          onCustomCrash={handleCustomCrash}
        />
      )}
      {devModeOpen && <DevModeConsole onClose={() => setDevModeOpen(false)} />}
    </>
  );
};

export default Index;
