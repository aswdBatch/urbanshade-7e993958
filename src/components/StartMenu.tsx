import { useState, useEffect, useRef } from "react";
import { App } from "./Desktop";
import { LogOut, Activity, RotateCcw, Power, ChevronUp, Shield, HardDrive } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface StartMenuProps {
  open: boolean;
  apps: App[];
  onClose: () => void;
  onOpenApp: (app: App) => void;
  onReboot: () => void;
  onShutdown: () => void;
  onLogout: () => void;
}

export const StartMenu = ({ open, apps, onClose, onOpenApp, onReboot, onShutdown, onLogout }: StartMenuProps) => {
  const [search, setSearch] = useState("");
  const [rebootMenuOpen, setRebootMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        const startBtn = document.querySelector('[data-start-button]');
        if (startBtn && !startBtn.contains(e.target as Node)) {
          onClose();
        }
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, onClose]);

  if (!open) return null;

  const filteredApps = apps.filter(app => 
    app.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      ref={menuRef}
      className="fixed left-3 bottom-[78px] w-[680px] h-[740px] rounded-2xl backdrop-blur-2xl bg-background/95 border border-border/50 z-[900] shadow-2xl overflow-hidden animate-slide-in-right"
    >
      {/* Search Bar at Top */}
      <div className="p-6 border-b border-border/30">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for apps, settings, and documents"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-muted/50 border border-border/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col h-[calc(100%-120px)]">
        {/* Pinned Apps Section */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">Pinned</h3>
              <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                All apps →
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-6 gap-3">
            {filteredApps.slice(0, 18).map((app, index) => (
              <button
                key={app.id}
                onClick={() => {
                  onOpenApp(app);
                  onClose();
                }}
                className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-muted/50 transition-all group animate-fade-in hover-scale"
                style={{ animationDelay: `${index * 20}ms` }}
              >
                <div className="w-8 h-8 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  {app.icon}
                </div>
                <div className="text-[10px] text-center text-foreground leading-tight line-clamp-2">
                  {app.name}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer with User and Power */}
        <div className="border-t border-border/30 p-4 bg-muted/20">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-muted/50 transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold text-sm">
                U
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-foreground">User</div>
                <div className="text-xs text-muted-foreground">Administrator</div>
              </div>
            </button>

            <div className="flex gap-2">
              <a
                href="/admin"
                target="_blank"
                className="w-10 h-10 rounded-lg hover:bg-muted/50 flex items-center justify-center transition-all group"
                title="Admin Panel"
                onClick={onClose}
              >
                <Shield className="w-4 h-4 text-yellow-500 group-hover:text-yellow-400 transition-colors" />
              </a>
              
              <button 
                onClick={() => {
                  onShutdown();
                  onClose();
                }}
                className="w-10 h-10 rounded-lg hover:bg-muted/50 flex items-center justify-center transition-all group"
                title="Shut down"
              >
                <Power className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>
              
              <Popover open={rebootMenuOpen} onOpenChange={setRebootMenuOpen}>
                <PopoverTrigger asChild>
                  <button 
                    className="w-10 h-10 rounded-lg hover:bg-muted/50 flex items-center justify-center transition-all group"
                    title="Reboot options"
                  >
                    <RotateCcw className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </button>
                </PopoverTrigger>
                <PopoverContent 
                  side="top" 
                  align="end"
                  className="w-56 p-2 bg-background/95 backdrop-blur-xl border border-border/50 shadow-2xl animate-scale-in"
                >
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        onReboot();
                        onClose();
                        setRebootMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-all text-left group"
                    >
                      <RotateCcw className="w-4 h-4 text-primary group-hover:text-primary/80" />
                      <div>
                        <div className="text-sm font-medium text-foreground">Restart</div>
                        <div className="text-xs text-muted-foreground">Standard reboot</div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => {
                        // TODO: Implement restart to BIOS
                        console.log("Restart to BIOS");
                        setRebootMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-all text-left group"
                    >
                      <Shield className="w-4 h-4 text-primary group-hover:text-primary/80" />
                      <div>
                        <div className="text-sm font-medium text-foreground">Restart to BIOS</div>
                        <div className="text-xs text-muted-foreground">Enter system setup</div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => {
                        // TODO: Implement restart to Recovery
                        console.log("Restart to Recovery");
                        setRebootMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-all text-left group"
                    >
                      <HardDrive className="w-4 h-4 text-primary group-hover:text-primary/80" />
                      <div>
                        <div className="text-sm font-medium text-foreground">Restart to Recovery</div>
                        <div className="text-xs text-muted-foreground">Advanced options</div>
                      </div>
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
              
              <button 
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-10 h-10 rounded-lg hover:bg-muted/50 flex items-center justify-center transition-all group"
                title="Sign out"
              >
                <LogOut className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
