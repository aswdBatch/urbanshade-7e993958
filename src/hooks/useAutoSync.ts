import { useEffect, useState, useRef, useCallback } from "react";
import { useOnlineAccount } from "./useOnlineAccount";
import { useNotifications } from "./useNotifications";
import { useSyncHistory } from "./useSyncHistory";
import { toast } from "sonner";

export const useAutoSync = () => {
  const { isOnlineMode, isDevMode, user, syncSettings, loadCloudSettings, checkForConflict } = useOnlineAccount();
  const { addNotification } = useNotifications();
  const { addHistoryEntry, preferences, pendingChanges, clearPendingChanges, isOnline } = useSyncHistory();
  
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [hasConflict, setHasConflict] = useState(false);
  const [cloudSettings, setCloudSettings] = useState<any>(null);
  const lastSettingsHash = useRef<string>("");

  // Generate hash of current settings to detect changes
  const getSettingsHash = useCallback(() => {
    const settings: Record<string, string | null> = {};
    
    if (preferences.desktopIcons) {
      settings.desktop_icons = localStorage.getItem("urbanshade_desktop_icons");
    }
    if (preferences.installedApps) {
      settings.installed_apps = localStorage.getItem("urbanshade_installed_apps");
    }
    if (preferences.theme) {
      settings.theme = localStorage.getItem("settings_theme");
      settings.bg_gradient_start = localStorage.getItem("settings_bg_gradient_start");
      settings.bg_gradient_end = localStorage.getItem("settings_bg_gradient_end");
      settings.accent_color = localStorage.getItem("settings_accent_color");
    }
    if (preferences.systemSettings) {
      settings.device_name = localStorage.getItem("settings_device_name");
      settings.animations = localStorage.getItem("settings_animations");
    }
    
    return JSON.stringify(settings);
  }, [preferences]);

  // Get synced items list for history
  const getSyncedItems = useCallback(() => {
    const items: string[] = [];
    if (preferences.desktopIcons) items.push("Desktop Icons");
    if (preferences.installedApps) items.push("Apps");
    if (preferences.theme) items.push("Theme");
    if (preferences.systemSettings) items.push("Settings");
    return items;
  }, [preferences]);

  // Perform sync with change detection
  const performSync = useCallback(async (force = false, silent = false) => {
    if (isDevMode || !isOnlineMode || !user) return false;
    
    // Don't sync if offline (queue changes instead)
    if (!isOnline && !force) {
      return false;
    }

    const currentHash = getSettingsHash();
    
    // Skip if no changes (unless forced)
    if (!force && currentHash === lastSettingsHash.current) {
      return false;
    }

    setIsSyncing(true);
    setSyncError(null);

    try {
      await syncSettings(preferences);
      lastSettingsHash.current = currentHash;
      setLastSyncTime(new Date());
      clearPendingChanges();
      
      // Add to history
      addHistoryEntry({
        type: "success",
        message: "Settings synced to cloud",
        details: {
          synced: getSyncedItems(),
          deviceName: localStorage.getItem("settings_device_name") || "Unknown Device"
        }
      });
      
      // Show notification (not for silent syncs)
      if (!silent) {
        addNotification({
          title: "Cloud Sync Complete",
          message: "Your settings have been synced to the cloud",
          type: "success"
        });
      }
      
      return true;
    } catch (err) {
      console.error("Auto-sync failed:", err);
      setSyncError("Sync failed");
      
      // Add to history
      addHistoryEntry({
        type: "error",
        message: "Sync failed",
        details: {
          deviceName: localStorage.getItem("settings_device_name") || "Unknown Device"
        }
      });
      
      // Show notification
      addNotification({
        title: "Sync Failed",
        message: "Unable to sync settings. Will retry in 2 minutes.",
        type: "error"
      });
      
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [isDevMode, isOnlineMode, user, isOnline, syncSettings, getSettingsHash, preferences, getSyncedItems, addHistoryEntry, addNotification, clearPendingChanges]);

  // Check for conflicts on login
  const checkConflict = useCallback(async () => {
    if (isDevMode || !isOnlineMode || !user) return null;
    
    try {
      const result = await checkForConflict();
      if (result?.hasConflict) {
        setHasConflict(true);
        setCloudSettings(result.cloudSettings);
        
        addHistoryEntry({
          type: "conflict",
          message: "Settings conflict detected",
        });
        
        return result;
      }
    } catch (err) {
      console.error("Conflict check failed:", err);
    }
    return null;
  }, [isDevMode, isOnlineMode, user, checkForConflict, addHistoryEntry]);

  // Manual sync with toast feedback
  const manualSync = useCallback(async () => {
    const success = await performSync(true);
    if (success) {
      toast.success("Settings synced to cloud");
    } else if (!isOnlineMode) {
      toast.error("Online mode not enabled");
    } else if (!user) {
      toast.error("Not signed in");
    } else if (!isOnline) {
      toast.error("You're offline. Changes will sync when reconnected.");
    }
    return success;
  }, [performSync, isOnlineMode, user, isOnline]);

  // Resolve conflict
  const resolveConflict = useCallback(async (resolution: "local" | "cloud" | "merge") => {
    if (!cloudSettings) return;
    
    if (resolution === "cloud") {
      await loadCloudSettings();
      addHistoryEntry({
        type: "success",
        message: "Applied cloud settings",
      });
      addNotification({
        title: "Cloud Settings Applied",
        message: "Your settings have been updated from the cloud",
        type: "success"
      });
    } else if (resolution === "local") {
      await performSync(true, true);
      addHistoryEntry({
        type: "success",
        message: "Uploaded local settings",
      });
    } else if (resolution === "merge") {
      // Merge: combine unique items from both
      const localIcons = JSON.parse(localStorage.getItem("urbanshade_desktop_icons") || "[]");
      const cloudIcons = cloudSettings.desktop_icons || [];
      const mergedIcons = [...localIcons];
      cloudIcons.forEach((icon: any) => {
        if (!mergedIcons.some((i: any) => i.id === icon.id)) {
          mergedIcons.push(icon);
        }
      });
      localStorage.setItem("urbanshade_desktop_icons", JSON.stringify(mergedIcons));
      
      const localApps = JSON.parse(localStorage.getItem("urbanshade_installed_apps") || "[]");
      const cloudApps = cloudSettings.installed_apps || [];
      const mergedApps = [...new Set([...localApps, ...cloudApps])];
      localStorage.setItem("urbanshade_installed_apps", JSON.stringify(mergedApps));
      
      await performSync(true, true);
      addHistoryEntry({
        type: "success",
        message: "Merged local and cloud settings",
      });
      addNotification({
        title: "Settings Merged",
        message: "Local and cloud settings have been combined",
        type: "success"
      });
    }
    
    setHasConflict(false);
    setCloudSettings(null);
  }, [cloudSettings, loadCloudSettings, performSync, addHistoryEntry, addNotification]);

  // Auto-sync every 2 minutes
  useEffect(() => {
    if (isDevMode || !isOnlineMode || !user) return;

    // Initial sync on mount (silent)
    performSync(true, true);

    // Set up interval (2 minutes = 120000ms)
    const interval = setInterval(() => {
      performSync(false, true);
    }, 120000);

    return () => clearInterval(interval);
  }, [isDevMode, isOnlineMode, user, performSync]);

  // Sync pending changes when coming back online
  useEffect(() => {
    if (isOnline && pendingChanges.length > 0 && isOnlineMode && user && !isDevMode) {
      performSync(true, false);
    }
  }, [isOnline, pendingChanges.length, isOnlineMode, user, isDevMode, performSync]);

  // Sync on beforeunload (save before closing)
  useEffect(() => {
    if (isDevMode || !isOnlineMode || !user) return;

    const handleBeforeUnload = () => {
      performSync(true, true);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDevMode, isOnlineMode, user, performSync]);

  return {
    lastSyncTime,
    isSyncing,
    syncError,
    manualSync,
    performSync,
    checkConflict,
    resolveConflict,
    hasConflict,
    cloudSettings,
    isEnabled: isOnlineMode && !!user && !isDevMode,
  };
};
