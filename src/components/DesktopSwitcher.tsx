import { useState } from "react";
import { Plus, X, Monitor, ChevronLeft, ChevronRight } from "lucide-react";

interface VirtualDesktop {
  id: string;
  name: string;
  windowIds: string[];
}

interface DesktopSwitcherProps {
  desktops: VirtualDesktop[];
  activeDesktopId: string;
  onSwitch: (id: string) => void;
  onCreate: (name?: string) => string;
  onDelete: (id: string) => boolean;
  onRename: (id: string, name: string) => void;
}

export const DesktopSwitcher = ({
  desktops,
  activeDesktopId,
  onSwitch,
  onCreate,
  onDelete,
  onRename
}: DesktopSwitcherProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const handleRename = (id: string) => {
    if (editName.trim()) {
      onRename(id, editName.trim());
    }
    setEditingId(null);
    setEditName("");
  };

  const activeIndex = desktops.findIndex(d => d.id === activeDesktopId);

  if (!isExpanded) {
    // Compact mode - just show current desktop and arrows
    return (
      <div className="fixed bottom-14 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-1 px-2 py-1 bg-slate-900/90 backdrop-blur-md border border-slate-700/50 rounded-lg shadow-xl">
          <button
            onClick={() => {
              const prevIndex = (activeIndex - 1 + desktops.length) % desktops.length;
              onSwitch(desktops[prevIndex].id);
            }}
            className="p-1 text-slate-400 hover:text-white transition-colors"
            title="Previous Desktop"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-2 px-2 py-1 text-xs text-slate-300 hover:text-white transition-colors"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>{desktops.find(d => d.id === activeDesktopId)?.name}</span>
            <span className="text-slate-500">({activeIndex + 1}/{desktops.length})</span>
          </button>
          
          <button
            onClick={() => {
              const nextIndex = (activeIndex + 1) % desktops.length;
              onSwitch(desktops[nextIndex].id);
            }}
            className="p-1 text-slate-400 hover:text-white transition-colors"
            title="Next Desktop"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Expanded mode - show all desktops
  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center"
      onClick={() => setIsExpanded(false)}
    >
      <div 
        className="bg-slate-900/95 border border-slate-700 rounded-xl p-6 shadow-2xl max-w-3xl w-full mx-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Monitor className="w-5 h-5 text-cyan-400" />
            Virtual Desktops
          </h3>
          <button
            onClick={() => setIsExpanded(false)}
            className="p-1 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {desktops.map((desktop, index) => (
            <div
              key={desktop.id}
              className={`relative group p-4 rounded-lg border-2 cursor-pointer transition-all ${
                desktop.id === activeDesktopId
                  ? 'bg-cyan-500/20 border-cyan-500'
                  : 'bg-slate-800/50 border-slate-700 hover:border-slate-500'
              }`}
              onClick={() => {
                onSwitch(desktop.id);
                setIsExpanded(false);
              }}
            >
              {/* Desktop preview */}
              <div className="aspect-video bg-slate-950 rounded mb-2 flex items-center justify-center border border-slate-700">
                <span className="text-2xl font-bold text-slate-600">{index + 1}</span>
              </div>
              
              {/* Desktop name */}
              {editingId === desktop.id ? (
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onBlur={() => handleRename(desktop.id)}
                  onKeyDown={e => e.key === 'Enter' && handleRename(desktop.id)}
                  className="w-full px-2 py-1 text-xs bg-slate-800 border border-slate-600 rounded text-white"
                  autoFocus
                  onClick={e => e.stopPropagation()}
                />
              ) : (
                <div 
                  className="text-xs text-center truncate text-slate-300"
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setEditingId(desktop.id);
                    setEditName(desktop.name);
                  }}
                >
                  {desktop.name}
                </div>
              )}
              
              {/* Window count */}
              <div className="text-[10px] text-center text-slate-500 mt-1">
                {desktop.windowIds.length} windows
              </div>
              
              {/* Delete button (not for first desktop) */}
              {desktops.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(desktop.id);
                  }}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
          
          {/* Add new desktop button */}
          {desktops.length < 8 && (
            <button
              onClick={() => onCreate()}
              className="p-4 rounded-lg border-2 border-dashed border-slate-700 hover:border-cyan-500 hover:bg-cyan-500/10 transition-all flex flex-col items-center justify-center gap-2"
            >
              <Plus className="w-8 h-8 text-slate-500" />
              <span className="text-xs text-slate-500">New Desktop</span>
            </button>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-slate-700 text-xs text-slate-500 text-center">
          <kbd className="px-2 py-0.5 bg-slate-800 rounded border border-slate-600">Ctrl</kbd>
          {" + "}
          <kbd className="px-2 py-0.5 bg-slate-800 rounded border border-slate-600">Win</kbd>
          {" + "}
          <kbd className="px-2 py-0.5 bg-slate-800 rounded border border-slate-600">←/→</kbd>
          {" to switch desktops"}
        </div>
      </div>
    </div>
  );
};
