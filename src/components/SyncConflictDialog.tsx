import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Cloud, Monitor, GitMerge, AlertTriangle, Check } from "lucide-react";

interface CloudSettings {
  install_type?: string;
  desktop_icons?: any[];
  installed_apps?: any[];
  system_settings?: Record<string, string>;
  last_sync?: string;
}

interface SyncConflictDialogProps {
  open: boolean;
  onClose: () => void;
  cloudSettings: CloudSettings | null;
  onUseLocal: () => void;
  onUseCloud: () => void;
  onMerge: () => void;
}

export const SyncConflictDialog = ({
  open,
  onClose,
  cloudSettings,
  onUseLocal,
  onUseCloud,
  onMerge,
}: SyncConflictDialogProps) => {
  const [selectedOption, setSelectedOption] = useState<"local" | "cloud" | "merge" | null>(null);

  const formatLastSync = (timestamp?: string) => {
    if (!timestamp) return "Unknown";
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getLocalStats = () => {
    const icons = JSON.parse(localStorage.getItem("urbanshade_desktop_icons") || "[]");
    const apps = JSON.parse(localStorage.getItem("urbanshade_installed_apps") || "[]");
    return {
      iconCount: icons.length,
      appCount: apps.length,
    };
  };

  const getCloudStats = () => {
    if (!cloudSettings) return { iconCount: 0, appCount: 0 };
    return {
      iconCount: cloudSettings.desktop_icons?.length || 0,
      appCount: cloudSettings.installed_apps?.length || 0,
    };
  };

  const localStats = getLocalStats();
  const cloudStats = getCloudStats();

  const handleConfirm = () => {
    if (selectedOption === "local") {
      onUseLocal();
    } else if (selectedOption === "cloud") {
      onUseCloud();
    } else if (selectedOption === "merge") {
      onMerge();
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Settings Conflict Detected
          </DialogTitle>
          <DialogDescription>
            Your local settings differ from your cloud settings. Choose how to resolve this.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {/* Use Local Option */}
          <button
            onClick={() => setSelectedOption("local")}
            className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
              selectedOption === "local"
                ? "border-cyan-500 bg-cyan-500/10"
                : "border-border hover:border-muted-foreground/50"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                selectedOption === "local" ? "bg-cyan-500/20" : "bg-muted"
              }`}>
                <Monitor className={`w-5 h-5 ${selectedOption === "local" ? "text-cyan-400" : "text-muted-foreground"}`} />
              </div>
              <div className="flex-1">
                <div className="font-semibold flex items-center gap-2">
                  Use Local Settings
                  {selectedOption === "local" && <Check className="w-4 h-4 text-cyan-400" />}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Keep your current device settings and upload them to the cloud.
                </p>
                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                  <span>{localStats.iconCount} icons</span>
                  <span>{localStats.appCount} apps</span>
                </div>
              </div>
            </div>
          </button>

          {/* Use Cloud Option */}
          <button
            onClick={() => setSelectedOption("cloud")}
            className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
              selectedOption === "cloud"
                ? "border-cyan-500 bg-cyan-500/10"
                : "border-border hover:border-muted-foreground/50"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                selectedOption === "cloud" ? "bg-cyan-500/20" : "bg-muted"
              }`}>
                <Cloud className={`w-5 h-5 ${selectedOption === "cloud" ? "text-cyan-400" : "text-muted-foreground"}`} />
              </div>
              <div className="flex-1">
                <div className="font-semibold flex items-center gap-2">
                  Use Cloud Settings
                  {selectedOption === "cloud" && <Check className="w-4 h-4 text-cyan-400" />}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Replace local settings with your cloud backup.
                </p>
                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                  <span>{cloudStats.iconCount} icons</span>
                  <span>{cloudStats.appCount} apps</span>
                  <span>Last sync: {formatLastSync(cloudSettings?.last_sync)}</span>
                </div>
              </div>
            </div>
          </button>

          {/* Merge Option */}
          <button
            onClick={() => setSelectedOption("merge")}
            className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
              selectedOption === "merge"
                ? "border-cyan-500 bg-cyan-500/10"
                : "border-border hover:border-muted-foreground/50"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                selectedOption === "merge" ? "bg-cyan-500/20" : "bg-muted"
              }`}>
                <GitMerge className={`w-5 h-5 ${selectedOption === "merge" ? "text-cyan-400" : "text-muted-foreground"}`} />
              </div>
              <div className="flex-1">
                <div className="font-semibold flex items-center gap-2">
                  Merge Both
                  {selectedOption === "merge" && <Check className="w-4 h-4 text-cyan-400" />}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Combine local and cloud settings, keeping unique items from both.
                </p>
              </div>
            </div>
          </button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Decide Later
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!selectedOption}
            className="bg-cyan-600 hover:bg-cyan-700"
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
