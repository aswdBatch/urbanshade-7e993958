import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Cloud, 
  RefreshCw, 
  History, 
  Check, 
  X, 
  AlertTriangle,
  Monitor,
  Palette,
  AppWindow,
  Settings,
  Trash2,
  Loader2,
  WifiOff
} from "lucide-react";
import { useSyncHistory, SyncPreferences } from "@/hooks/useSyncHistory";
import { useAutoSync } from "@/hooks/useAutoSync";

interface SyncSettingsPanelProps {
  isOnlineMode: boolean;
  user: any;
  onManualSync: () => Promise<boolean>;
}

export const SyncSettingsPanel = ({ isOnlineMode, user, onManualSync }: SyncSettingsPanelProps) => {
  const { 
    history, 
    preferences, 
    pendingChanges,
    isOnline,
    updatePreferences, 
    clearHistory 
  } = useSyncHistory();
  const { lastSyncTime, isSyncing } = useAutoSync();
  const [showHistory, setShowHistory] = useState(false);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const getStatusIcon = (type: string) => {
    switch (type) {
      case "success": return <Check className="w-4 h-4 text-green-500" />;
      case "error": return <X className="w-4 h-4 text-red-500" />;
      case "conflict": return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default: return <Cloud className="w-4 h-4" />;
    }
  };

  if (!isOnlineMode || !user) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          <Cloud className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">Cloud Sync Disabled</p>
          <p className="text-sm mt-1">Sign in with an online account to enable cloud sync.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sync Status Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Cloud className="w-5 h-5 text-cyan-500" />
            Cloud Sync
          </h3>
          <div className="flex items-center gap-2">
            {!isOnline && (
              <span className="flex items-center gap-1 text-xs text-amber-500 bg-amber-500/10 px-2 py-1 rounded">
                <WifiOff className="w-3 h-3" />
                Offline
              </span>
            )}
            {pendingChanges.length > 0 && (
              <span className="text-xs text-amber-500 bg-amber-500/10 px-2 py-1 rounded">
                {pendingChanges.length} pending
              </span>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div>
              <div className="font-medium">Sync Status</div>
              <div className="text-sm text-muted-foreground">
                {lastSyncTime 
                  ? `Last synced ${formatTime(lastSyncTime.toISOString())}`
                  : "Never synced"
                }
              </div>
            </div>
            <Button 
              size="sm" 
              onClick={onManualSync}
              disabled={isSyncing || !isOnline}
            >
              {isSyncing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              <span className="ml-2">{isSyncing ? "Syncing..." : "Sync Now"}</span>
            </Button>
          </div>

          {/* Sync History Toggle */}
          <Button 
            variant="outline" 
            className="w-full justify-between"
            onClick={() => setShowHistory(!showHistory)}
          >
            <span className="flex items-center gap-2">
              <History className="w-4 h-4" />
              Sync History
            </span>
            <span className="text-xs text-muted-foreground">
              {history.length} entries
            </span>
          </Button>

          {/* Sync History List */}
          {showHistory && (
            <Card className="p-0 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b">
                <span className="text-sm font-medium">Recent Sync Activity</span>
                {history.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearHistory}
                    className="h-7 text-xs"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
              <ScrollArea className="h-48">
                {history.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No sync history yet
                  </div>
                ) : (
                  <div className="divide-y">
                    {history.map((entry) => (
                      <div key={entry.id} className="px-3 py-2 text-sm">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(entry.type)}
                          <span className="font-medium">{entry.message}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 ml-6">
                          {formatTime(entry.timestamp)}
                          {entry.details?.synced && (
                            <span className="ml-2">
                              • Synced: {entry.details.synced.join(", ")}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </Card>
          )}
        </div>
      </Card>

      {/* Selective Sync Card */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">What to Sync</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Choose which settings sync to the cloud
        </p>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-3">
              <Monitor className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="font-medium">Desktop Icons</div>
                <div className="text-xs text-muted-foreground">Icon positions and shortcuts</div>
              </div>
            </div>
            <Switch 
              checked={preferences.desktopIcons}
              onCheckedChange={(checked) => updatePreferences({ desktopIcons: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-3">
              <AppWindow className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="font-medium">Installed Apps</div>
                <div className="text-xs text-muted-foreground">App list and preferences</div>
              </div>
            </div>
            <Switch 
              checked={preferences.installedApps}
              onCheckedChange={(checked) => updatePreferences({ installedApps: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-3">
              <Palette className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="font-medium">Theme & Appearance</div>
                <div className="text-xs text-muted-foreground">Colors, fonts, and visual settings</div>
              </div>
            </div>
            <Switch 
              checked={preferences.theme}
              onCheckedChange={(checked) => updatePreferences({ theme: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="font-medium">System Settings</div>
                <div className="text-xs text-muted-foreground">Device name, privacy, and more</div>
              </div>
            </div>
            <Switch 
              checked={preferences.systemSettings}
              onCheckedChange={(checked) => updatePreferences({ systemSettings: checked })}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};
