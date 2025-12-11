import { useState, useCallback, useEffect } from "react";

export interface SyncHistoryEntry {
  id: string;
  timestamp: string;
  type: "success" | "error" | "conflict";
  message: string;
  details?: {
    synced?: string[];
    failed?: string[];
    deviceName?: string;
  };
}

export interface SyncPreferences {
  desktopIcons: boolean;
  installedApps: boolean;
  theme: boolean;
  systemSettings: boolean;
}

const DEFAULT_PREFERENCES: SyncPreferences = {
  desktopIcons: true,
  installedApps: true,
  theme: true,
  systemSettings: true,
};

export const useSyncHistory = () => {
  const [history, setHistory] = useState<SyncHistoryEntry[]>(() => {
    const saved = localStorage.getItem("sync_history");
    return saved ? JSON.parse(saved) : [];
  });

  const [preferences, setPreferences] = useState<SyncPreferences>(() => {
    const saved = localStorage.getItem("sync_preferences");
    return saved ? JSON.parse(saved) : DEFAULT_PREFERENCES;
  });

  const [pendingChanges, setPendingChanges] = useState<string[]>(() => {
    const saved = localStorage.getItem("sync_pending_changes");
    return saved ? JSON.parse(saved) : [];
  });

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Persist history
  useEffect(() => {
    localStorage.setItem("sync_history", JSON.stringify(history.slice(0, 50)));
  }, [history]);

  // Persist preferences
  useEffect(() => {
    localStorage.setItem("sync_preferences", JSON.stringify(preferences));
  }, [preferences]);

  // Persist pending changes
  useEffect(() => {
    localStorage.setItem("sync_pending_changes", JSON.stringify(pendingChanges));
  }, [pendingChanges]);

  const addHistoryEntry = useCallback((entry: Omit<SyncHistoryEntry, "id" | "timestamp">) => {
    const newEntry: SyncHistoryEntry = {
      ...entry,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    setHistory(prev => [newEntry, ...prev].slice(0, 50));
    return newEntry;
  }, []);

  const updatePreferences = useCallback((updates: Partial<SyncPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  }, []);

  const addPendingChange = useCallback((changeType: string) => {
    setPendingChanges(prev => {
      if (!prev.includes(changeType)) {
        return [...prev, changeType];
      }
      return prev;
    });
  }, []);

  const clearPendingChanges = useCallback(() => {
    setPendingChanges([]);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return {
    history,
    preferences,
    pendingChanges,
    isOnline,
    addHistoryEntry,
    updatePreferences,
    addPendingChange,
    clearPendingChanges,
    clearHistory,
  };
};
