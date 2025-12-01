import { useState, useEffect } from "react";
import { Download, Play, Trash2, FolderDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface Installer {
  id: string;
  name: string;
  appId: string;
  appName: string;
  size: string;
  downloaded: string;
}

export const Downloads = () => {
  const [installers, setInstallers] = useState<Installer[]>(() => {
    const saved = localStorage.getItem('downloads_installers');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem('downloads_installers');
      setInstallers(saved ? JSON.parse(saved) : []);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleRunInstaller = (installer: Installer) => {
    // Store installer data for the installer window
    localStorage.setItem('current_installer', JSON.stringify(installer));
    
    // Dispatch event to open installer window
    window.dispatchEvent(new CustomEvent('open-installer', { 
      detail: { 
        appName: installer.appName,
        appId: installer.appId,
        installerId: installer.id
      } 
    }));
  };

  const handleDelete = (installerId: string) => {
    if (!window.confirm("Delete this installer?")) return;
    
    const newInstallers = installers.filter(i => i.id !== installerId);
    setInstallers(newInstallers);
    localStorage.setItem('downloads_installers', JSON.stringify(newInstallers));
    toast.success("Installer deleted");
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="border-b border-border p-4">
        <div className="flex items-center gap-3">
          <FolderDown className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold">Downloads</h1>
          <span className="ml-auto text-sm text-muted-foreground">
            {installers.length} {installers.length === 1 ? 'file' : 'files'}
          </span>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {installers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <Download className="w-16 h-16 mb-4 opacity-50" />
              <p>No downloads</p>
              <p className="text-sm">Downloaded installers will appear here</p>
            </div>
          ) : (
            installers.map(installer => (
              <div
                key={installer.id}
                className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <Download className="w-8 h-8 text-primary" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{installer.name}</h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{installer.size}</span>
                        <span>•</span>
                        <span>{new Date(installer.downloaded).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleRunInstaller(installer)}
                      size="sm"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Run Installer
                    </Button>
                    <Button 
                      onClick={() => handleDelete(installer.id)}
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
