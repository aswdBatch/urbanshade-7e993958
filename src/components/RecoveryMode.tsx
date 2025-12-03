import { useState, useRef } from "react";
import { Terminal, RotateCcw, HardDrive, Image, Settings, ArrowLeft, Download, Upload, FileImage, Edit, Trash2, Zap, Shield } from "lucide-react";
import { toast } from "sonner";

interface RecoveryModeProps {
  onExit: () => void;
}

interface RecoveryImage {
  name: string;
  data: Record<string, string>;
  created: string;
  size: number;
}

export const RecoveryMode = ({ onExit }: RecoveryModeProps) => {
  const [view, setView] = useState<"menu" | "restore" | "flash" | "cmd" | "advanced" | "processing" | "image-editor" | "emergency-admin">("menu");
  const [cmdOutput, setCmdOutput] = useState<string[]>([
    "URBANSHADE Recovery Console v3.7",
    "Type 'help' for available commands",
    ""
  ]);
  const [cmdInput, setCmdInput] = useState("");
  const [restorePoints, setRestorePoints] = useState<string[]>(() => {
    const saved = localStorage.getItem('recovery_restore_points');
    return saved ? JSON.parse(saved) : ['2025-01-15 14:30:00 - Initial Setup', '2025-01-14 09:15:00 - System Update'];
  });
  const [recoveryImages, setRecoveryImages] = useState<RecoveryImage[]>(() => {
    const saved = localStorage.getItem('urbanshade_recovery_images_data');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedImage, setSelectedImage] = useState<RecoveryImage | null>(null);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [processingMessage, setProcessingMessage] = useState("");
  const [processingProgress, setProcessingProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recoveryDiscInputRef = useRef<HTMLInputElement>(null);

  const handleQuickReset = () => {
    if (!window.confirm("⚠️ QUICK RESET\n\nThis will PERMANENTLY delete ALL saved data and restart the system.\n\nAre you absolutely sure?")) return;
    
    setProcessingMessage("Performing quick reset...");
    setProcessingProgress(0);
    setView("processing");
    
    const interval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            localStorage.clear();
            toast.success("System reset complete. Restarting...");
            setTimeout(() => window.location.reload(), 500);
          }, 300);
          return 100;
        }
        return prev + 10;
      });
    }, 50);
  };

  const handleExportRecoveryDisc = () => {
    // Create a special recovery disc with emergency admin access
    const recoveryDisc = {
      type: "urbanshade_recovery_disc",
      version: "2.2.0",
      created: new Date().toISOString(),
      emergency_admin: true,
      auth_key: btoa(`emergency_${Date.now()}_${Math.random().toString(36)}`),
      system_snapshot: {} as Record<string, string>
    };
    
    // Include critical system data
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !key.startsWith('urbanshade_recovery_images')) {
        recoveryDisc.system_snapshot[key] = localStorage.getItem(key) || "";
      }
    }
    
    const blob = new Blob([JSON.stringify(recoveryDisc, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `urbanshade_recovery_disc_${new Date().getTime()}.usd`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Recovery disc exported! This file contains emergency admin access.");
  };

  const handleImportRecoveryDisc = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const disc = JSON.parse(e.target?.result as string);
        if (disc.type !== "urbanshade_recovery_disc") {
          toast.error("Invalid recovery disc format");
          return;
        }
        
        // Store the disc data for emergency admin access
        localStorage.setItem("urbanshade_emergency_disc", JSON.stringify(disc));
        setView("emergency-admin");
        toast.success("Recovery disc loaded! Emergency admin panel available.");
      } catch (error) {
        toast.error("Failed to parse recovery disc");
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const saveRecoveryImages = (images: RecoveryImage[]) => {
    localStorage.setItem('urbanshade_recovery_images_data', JSON.stringify(images));
    setRecoveryImages(images);
  };

  const handleExportCurrentSystem = () => {
    const systemImage: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !key.startsWith('urbanshade_recovery_images')) {
        systemImage[key] = localStorage.getItem(key) || "";
      }
    }
    
    const blob = new Blob([JSON.stringify(systemImage, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `urbanshade_recovery_${new Date().getTime()}.img`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Recovery image exported!");
  };

  const handleSaveToRecoveryStorage = () => {
    const systemImage: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !key.startsWith('urbanshade_recovery_images')) {
        systemImage[key] = localStorage.getItem(key) || "";
      }
    }
    
    const newImage: RecoveryImage = {
      name: `Recovery_${new Date().toLocaleString().replace(/[/:]/g, '-')}`,
      data: systemImage,
      created: new Date().toISOString(),
      size: JSON.stringify(systemImage).length
    };
    
    saveRecoveryImages([...recoveryImages, newImage]);
    toast.success("Recovery image saved to storage!");
  };

  const handleImportImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        const newImage: RecoveryImage = {
          name: file.name.replace(/\.(img|json)$/, ''),
          data,
          created: new Date().toISOString(),
          size: JSON.stringify(data).length
        };
        saveRecoveryImages([...recoveryImages, newImage]);
        toast.success(`Imported ${file.name}`);
      } catch (error) {
        toast.error("Failed to parse recovery image file");
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleApplyImage = (image: RecoveryImage) => {
    if (!window.confirm(`Apply recovery image "${image.name}"? This will replace your current system state.`)) return;
    
    setProcessingMessage(`Applying recovery image: ${image.name}`);
    setProcessingProgress(0);
    setView("processing");
    
    const interval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            localStorage.clear();
            Object.entries(image.data).forEach(([key, value]) => {
              localStorage.setItem(key, value);
            });
            toast.success("Recovery image applied. Reloading...");
            setTimeout(() => window.location.reload(), 1000);
          }, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };

  const handleDeleteImage = (imageName: string) => {
    if (!window.confirm(`Delete recovery image "${imageName}"?`)) return;
    saveRecoveryImages(recoveryImages.filter(img => img.name !== imageName));
    if (selectedImage?.name === imageName) setSelectedImage(null);
    toast.success("Recovery image deleted");
  };

  const handleEditImageValue = (key: string, value: string) => {
    if (!selectedImage) return;
    const updatedImage = {
      ...selectedImage,
      data: { ...selectedImage.data, [key]: value }
    };
    setSelectedImage(updatedImage);
    saveRecoveryImages(recoveryImages.map(img => 
      img.name === selectedImage.name ? updatedImage : img
    ));
    setEditingKey(null);
    toast.success(`Updated ${key}`);
  };

  const handleCmdCommand = (cmd: string) => {
    const newOutput = [...cmdOutput, `> ${cmd}`];
    
    const commands: Record<string, () => string[]> = {
      help: () => [
        "Available commands:",
        "  help       - Show this help",
        "  sfc        - System File Checker",
        "  chkdsk     - Check disk",
        "  bootrec    - Boot recovery",
        "  export     - Export recovery image",
        "  list       - List recovery images",
        "  clear      - Clear screen",
        "  exit       - Exit console",
        ""
      ],
      export: () => {
        handleExportCurrentSystem();
        return ["Exporting current system state..."];
      },
      list: () => {
        if (recoveryImages.length === 0) return ["No recovery images found.", ""];
        return ["Recovery Images:", ...recoveryImages.map(img => `  - ${img.name} (${(img.size / 1024).toFixed(1)} KB)`), ""];
      },
      sfc: () => {
        setTimeout(() => {
          setProcessingMessage("Running System File Checker...");
          setProcessingProgress(0);
          setView("processing");
          const interval = setInterval(() => {
            setProcessingProgress(prev => {
              if (prev >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                  setView("cmd");
                  setCmdOutput(prev => [...prev, "[OK] System files integrity verified.", ""]);
                }, 500);
                return 100;
              }
              return prev + 5;
            });
          }, 100);
        }, 500);
        return ["Initializing System File Checker..."];
      },
      chkdsk: () => {
        setTimeout(() => {
          setProcessingMessage("Checking disk integrity...");
          setProcessingProgress(0);
          setView("processing");
          const interval = setInterval(() => {
            setProcessingProgress(prev => {
              if (prev >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                  setView("cmd");
                  setCmdOutput(prev => [...prev, "[OK] Disk check complete. No errors found.", ""]);
                }, 500);
                return 100;
              }
              return prev + 4;
            });
          }, 120);
        }, 500);
        return ["Starting disk check..."];
      },
      bootrec: () => {
        setTimeout(() => {
          setProcessingMessage("Rebuilding boot configuration...");
          setProcessingProgress(0);
          setView("processing");
          const interval = setInterval(() => {
            setProcessingProgress(prev => {
              if (prev >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                  setView("cmd");
                  setCmdOutput(prev => [...prev, "[OK] Boot files successfully repaired.", ""]);
                }, 500);
                return 100;
              }
              return prev + 3;
            });
          }, 100);
        }, 500);
        return ["Repairing boot configuration..."];
      },
      clear: () => [""],
      exit: () => {
        setView("menu");
        return ["Exiting console..."];
      }
    };

    if (cmd.toLowerCase() === 'clear') {
      setCmdOutput(["URBANSHADE Recovery Console v3.7", "Type 'help' for available commands", ""]);
    } else if (commands[cmd.toLowerCase()]) {
      setCmdOutput([...newOutput, ...commands[cmd.toLowerCase()]()]);
    } else {
      setCmdOutput([...newOutput, `'${cmd}' is not recognized as a command.`, ""]);
    }
    setCmdInput("");
  };

  const createRestorePoint = () => {
    const timestamp = new Date().toLocaleString();
    const newPoint = `${timestamp} - Manual Restore Point`;
    const updated = [newPoint, ...restorePoints];
    setRestorePoints(updated);
    localStorage.setItem('recovery_restore_points', JSON.stringify(updated));
    toast.success("Restore point created");
  };

  const handleRestoreSystem = (point: string) => {
    setProcessingMessage(`Restoring system to: ${point}`);
    setProcessingProgress(0);
    setView("processing");
    
    const interval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setView("menu");
            toast.success("System restored successfully!");
          }, 1000);
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };

  const renderMenu = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#0a1929] to-[#001f3f]">
      <div className="mb-8 text-center animate-fade-in">
        <h1 className="text-4xl font-bold mb-2 text-cyan-400">URBANSHADE Recovery</h1>
        <p className="text-lg opacity-80 text-gray-300">Advanced System Recovery Environment</p>
      </div>

      <div className="grid gap-4 w-full max-w-2xl px-8">
        <button
          onClick={onExit}
          className="bg-gradient-to-r from-cyan-500/20 to-cyan-600/20 hover:from-cyan-500/30 hover:to-cyan-600/30 border border-cyan-500/50 rounded-lg p-6 text-left transition-all hover:scale-[1.02]"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-cyan-500/30 rounded flex items-center justify-center">
              <ArrowLeft className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <div className="font-bold text-lg text-white">Continue</div>
              <div className="text-sm opacity-70 text-gray-300">Exit recovery and continue to system</div>
            </div>
          </div>
        </button>

        <button
          onClick={() => setView("restore")}
          className="bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg p-6 text-left transition-all hover:scale-[1.02]"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-cyan-500/20 rounded flex items-center justify-center">
              <RotateCcw className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <div className="font-bold text-lg text-white">System Restore</div>
              <div className="text-sm opacity-70 text-gray-300">Restore system to a previous restore point</div>
            </div>
          </div>
        </button>

        <button
          onClick={() => setView("flash")}
          className="bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg p-6 text-left transition-all hover:scale-[1.02]"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-cyan-500/20 rounded flex items-center justify-center">
              <Image className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <div className="font-bold text-lg text-white">Recovery Images</div>
              <div className="text-sm opacity-70 text-gray-300">Export, import, or apply recovery images</div>
            </div>
          </div>
        </button>

        <button
          onClick={() => setView("image-editor")}
          className="bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg p-6 text-left transition-all hover:scale-[1.02]"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500/20 rounded flex items-center justify-center">
              <Edit className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="font-bold text-lg text-white">Edit Recovery Image</div>
              <div className="text-sm opacity-70 text-gray-300">Modify values in saved recovery images</div>
            </div>
          </div>
        </button>

        <button
          onClick={() => setView("cmd")}
          className="bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg p-6 text-left transition-all hover:scale-[1.02]"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-cyan-500/20 rounded flex items-center justify-center">
              <Terminal className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <div className="font-bold text-lg text-white">Command Prompt</div>
              <div className="text-sm opacity-70 text-gray-300">Open command line for advanced tasks</div>
            </div>
          </div>
        </button>

        <button
          onClick={() => setView("advanced")}
          className="bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg p-6 text-left transition-all hover:scale-[1.02]"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-cyan-500/20 rounded flex items-center justify-center">
              <Settings className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <div className="font-bold text-lg text-white">Advanced Options</div>
              <div className="text-sm opacity-70 text-gray-300">Startup settings, safe mode, and more</div>
            </div>
          </div>
        </button>

        {/* Separator */}
        <div className="border-t border-cyan-500/20 my-2" />

        {/* Quick Reset */}
        <button
          onClick={handleQuickReset}
          className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg p-6 text-left transition-all hover:scale-[1.02]"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-500/20 rounded flex items-center justify-center">
              <Zap className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <div className="font-bold text-lg text-red-400">Quick Reset</div>
              <div className="text-sm opacity-70 text-gray-300">Instantly wipe ALL data and restart fresh</div>
            </div>
          </div>
        </button>

        {/* Recovery Disc */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleExportRecoveryDisc}
            className="bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-lg p-4 text-left transition-all hover:scale-[1.02]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded flex items-center justify-center">
                <Download className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <div className="font-bold text-sm text-purple-400">Export Recovery Disc</div>
                <div className="text-xs opacity-70 text-gray-300">Create emergency admin access file</div>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => recoveryDiscInputRef.current?.click()}
            className="bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-lg p-4 text-left transition-all hover:scale-[1.02]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <div className="font-bold text-sm text-purple-400">Load Recovery Disc</div>
                <div className="text-xs opacity-70 text-gray-300">Access emergency admin panel</div>
              </div>
            </div>
          </button>
        </div>
        
        <input
          ref={recoveryDiscInputRef}
          type="file"
          accept=".usd,.json"
          onChange={handleImportRecoveryDisc}
          className="hidden"
        />
      </div>
    </div>
  );

  const renderRestore = () => (
    <div className="p-8 max-w-4xl mx-auto">
      <button onClick={() => setView("menu")} className="mb-6 flex items-center gap-2 hover:opacity-70 text-cyan-400">
        <ArrowLeft className="w-4 h-4" />
        Back to menu
      </button>
      <h2 className="text-3xl font-bold mb-4 text-cyan-400">System Restore</h2>
      <p className="mb-6 opacity-80">Select a restore point to restore your system to a previous state</p>
      
      <div className="bg-white/10 border border-cyan-500/30 rounded-lg p-6 mb-4">
        <button
          onClick={createRestorePoint}
          className="bg-cyan-500/20 hover:bg-cyan-500/30 px-4 py-2 rounded mb-4 border border-cyan-500/50"
        >
          + Create New Restore Point
        </button>
        <div className="space-y-2">
          {restorePoints.map((point, i) => (
            <button 
              key={i} 
              onClick={() => handleRestoreSystem(point)}
              className="w-full bg-white/5 border border-white/20 rounded p-3 hover:bg-cyan-500/10 transition-all text-left"
            >
              {point}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFlash = () => (
    <div className="p-8 max-w-4xl mx-auto">
      <button onClick={() => setView("menu")} className="mb-6 flex items-center gap-2 hover:opacity-70 text-cyan-400">
        <ArrowLeft className="w-4 h-4" />
        Back to menu
      </button>
      <h2 className="text-3xl font-bold mb-4 text-cyan-400">Recovery Images</h2>
      <p className="mb-6 opacity-80">Manage system recovery images</p>
      
      <input
        ref={fileInputRef}
        type="file"
        accept=".img,.json"
        onChange={handleImportImage}
        className="hidden"
      />
      
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={handleExportCurrentSystem}
          className="bg-cyan-500/20 hover:bg-cyan-500/30 px-4 py-2 rounded border border-cyan-500/50 flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export Current State
        </button>
        <button
          onClick={handleSaveToRecoveryStorage}
          className="bg-green-500/20 hover:bg-green-500/30 px-4 py-2 rounded border border-green-500/50 flex items-center gap-2"
        >
          <HardDrive className="w-4 h-4" />
          Save to Storage
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-amber-500/20 hover:bg-amber-500/30 px-4 py-2 rounded border border-amber-500/50 flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Import .img File
        </button>
      </div>

      <div className="bg-white/10 border border-cyan-500/30 rounded-lg p-6">
        <h3 className="font-bold mb-4">Saved Recovery Images</h3>
        <div className="space-y-2">
          {recoveryImages.length === 0 ? (
            <div className="text-center py-8 opacity-50">No recovery images saved</div>
          ) : (
            recoveryImages.map((img) => (
              <div
                key={img.name}
                className="bg-white/5 border border-white/20 rounded p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <FileImage className="w-5 h-5 text-cyan-400" />
                  <div>
                    <div className="font-medium">{img.name}</div>
                    <div className="text-xs text-gray-400">
                      {(img.size / 1024).toFixed(1)} KB • {new Date(img.created).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApplyImage(img)}
                    className="px-3 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 rounded text-sm"
                  >
                    Apply
                  </button>
                  <button
                    onClick={() => handleDeleteImage(img.name)}
                    className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 rounded text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const renderImageEditor = () => (
    <div className="p-8 max-w-5xl mx-auto">
      <button onClick={() => { setView("menu"); setSelectedImage(null); }} className="mb-6 flex items-center gap-2 hover:opacity-70 text-cyan-400">
        <ArrowLeft className="w-4 h-4" />
        Back to menu
      </button>
      <h2 className="text-3xl font-bold mb-4 text-amber-400">Edit Recovery Image</h2>
      
      {!selectedImage ? (
        <div className="bg-white/10 border border-amber-500/30 rounded-lg p-6">
          <h3 className="font-bold mb-4">Select an image to edit</h3>
          <div className="space-y-2">
            {recoveryImages.length === 0 ? (
              <div className="text-center py-8 opacity-50">
                No recovery images available. Create one from the Recovery Images menu.
              </div>
            ) : (
              recoveryImages.map((img) => (
                <button
                  key={img.name}
                  onClick={() => setSelectedImage(img)}
                  className="w-full bg-white/5 border border-white/20 rounded p-3 hover:bg-amber-500/10 transition-all text-left flex items-center gap-3"
                >
                  <FileImage className="w-5 h-5 text-amber-400" />
                  <div>
                    <div className="font-medium">{img.name}</div>
                    <div className="text-xs text-gray-400">{Object.keys(img.data).length} entries</div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <FileImage className="w-6 h-6 text-amber-400" />
              <span className="font-bold text-lg">{selectedImage.name}</span>
              <span className="text-sm text-gray-400">({Object.keys(selectedImage.data).length} entries)</span>
            </div>
            <button
              onClick={() => setSelectedImage(null)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded"
            >
              Select Different Image
            </button>
          </div>
          
          <div className="bg-white/10 border border-amber-500/30 rounded-lg p-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              {Object.entries(selectedImage.data).map(([key, value]) => (
                <div key={key} className="bg-white/5 border border-white/10 rounded p-3">
                  <div className="font-mono text-sm text-amber-400 mb-2">{key}</div>
                  {editingKey === key ? (
                    <div className="space-y-2">
                      <textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full h-32 bg-black/50 border border-white/20 rounded p-2 font-mono text-xs"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditImageValue(key, editValue)}
                          className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 rounded text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingKey(null)}
                          className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-mono text-xs text-gray-400 truncate flex-1">
                        {value.length > 100 ? value.substring(0, 100) + "..." : value}
                      </div>
                      <button
                        onClick={() => { setEditingKey(key); setEditValue(value); }}
                        className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 rounded text-xs flex-shrink-0"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderCmd = () => (
    <div className="fixed inset-0 bg-black text-green-400 font-mono p-4 flex flex-col">
      <button onClick={() => setView("menu")} className="mb-2 text-sm hover:opacity-70 self-start text-cyan-400">
        ← Back to menu
      </button>
      <div className="flex-1 overflow-auto mb-2">
        {cmdOutput.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap">{line}</div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-cyan-400">&gt;</span>
        <input
          type="text"
          value={cmdInput}
          onChange={(e) => setCmdInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && cmdInput.trim()) {
              handleCmdCommand(cmdInput.trim());
            }
          }}
          className="flex-1 bg-transparent border-none outline-none text-green-400"
          autoFocus
        />
      </div>
    </div>
  );

  const renderAdvanced = () => (
    <div className="p-8 max-w-4xl mx-auto">
      <button onClick={() => setView("menu")} className="mb-6 flex items-center gap-2 hover:opacity-70 text-cyan-400">
        <ArrowLeft className="w-4 h-4" />
        Back to menu
      </button>
      <h2 className="text-3xl font-bold mb-4 text-cyan-400">Advanced Options</h2>
      
      <div className="space-y-3">
        <div className="bg-white/10 border border-cyan-500/30 rounded-lg p-4 hover:bg-cyan-500/10 cursor-pointer transition-all">
          Startup Repair - Fix problems that prevent system from loading
        </div>
        <div className="bg-white/10 border border-cyan-500/30 rounded-lg p-4 hover:bg-cyan-500/10 cursor-pointer transition-all">
          Startup Settings - Change startup behavior
        </div>
        <div 
          onClick={() => {
            localStorage.setItem("urbanshade_reboot_to_bios", "true");
            window.location.reload();
          }}
          className="bg-white/10 border border-cyan-500/30 rounded-lg p-4 hover:bg-cyan-500/10 cursor-pointer transition-all"
        >
          BIOS Settings - Access BIOS setup
        </div>
      </div>
    </div>
  );

  const renderProcessing = () => (
    <div className="flex flex-col items-center justify-center min-h-screen animate-fade-in">
      <div className="w-24 h-24 relative animate-spin mb-8" style={{ animationDuration: '2s' }}>
        <div className="absolute inset-0 rounded-full border-8 border-cyan-500/20"></div>
        <div className="absolute inset-0 rounded-full border-8 border-transparent border-t-cyan-400"></div>
      </div>
      <h2 className="text-2xl font-bold mb-4 text-cyan-400">{processingMessage}</h2>
      <div className="w-96 h-2 bg-white/20 rounded-full overflow-hidden">
        <div 
          className="h-full bg-cyan-400 transition-all duration-300"
          style={{ width: `${processingProgress}%` }}
        />
      </div>
      <p className="mt-4 text-lg">{processingProgress}%</p>
    </div>
  );

  const renderEmergencyAdmin = () => {
    const discData = localStorage.getItem("urbanshade_emergency_disc");
    let disc: any = null;
    try {
      disc = discData ? JSON.parse(discData) : null;
    } catch (e) {
      disc = null;
    }

    if (!disc) {
      return (
        <div className="p-8 max-w-4xl mx-auto">
          <button onClick={() => setView("menu")} className="mb-6 flex items-center gap-2 hover:opacity-70 text-cyan-400">
            <ArrowLeft className="w-4 h-4" />
            Back to menu
          </button>
          <div className="text-center py-12 text-red-400">
            No recovery disc loaded. Please load a recovery disc first.
          </div>
        </div>
      );
    }

    const handleRestoreFromDisc = () => {
      if (!window.confirm("Restore system from recovery disc? This will replace all current data.")) return;
      
      setProcessingMessage("Restoring from recovery disc...");
      setProcessingProgress(0);
      setView("processing");
      
      const interval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              localStorage.clear();
              Object.entries(disc.system_snapshot || {}).forEach(([key, value]) => {
                localStorage.setItem(key, value as string);
              });
              toast.success("System restored from disc. Restarting...");
              setTimeout(() => window.location.reload(), 1000);
            }, 500);
            return 100;
          }
          return prev + 3;
        });
      }, 80);
    };

    const handleCreateEmergencyAdmin = () => {
      const adminData = {
        id: "EMERGENCY_ADMIN",
        name: "Emergency Administrator",
        username: "emergency_admin",
        password: "",
        role: "Emergency Admin",
        clearance: 5,
        department: "Recovery",
        isEmergency: true
      };
      
      localStorage.setItem("urbanshade_admin", JSON.stringify(adminData));
      localStorage.setItem("urbanshade_first_boot", "true");
      toast.success("Emergency admin created. You can now login without password.");
    };

    const handleClearAllAccounts = () => {
      if (!window.confirm("Clear all user accounts? You will need to create a new admin account.")) return;
      localStorage.removeItem("urbanshade_admin");
      localStorage.removeItem("urbanshade_accounts");
      localStorage.removeItem("urbanshade_current_user");
      toast.success("All accounts cleared.");
    };

    const handleResetPermissions = () => {
      localStorage.removeItem("urbanshade_lockdown");
      localStorage.removeItem("urbanshade_maintenance");
      toast.success("All restrictions cleared.");
    };

    return (
      <div className="p-8 max-w-4xl mx-auto">
        <button onClick={() => setView("menu")} className="mb-6 flex items-center gap-2 hover:opacity-70 text-purple-400">
          <ArrowLeft className="w-4 h-4" />
          Back to menu
        </button>
        
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-8 h-8 text-purple-400" />
          <div>
            <h2 className="text-3xl font-bold text-purple-400">Emergency Admin Panel</h2>
            <p className="text-sm text-gray-400">Recovery disc loaded: {new Date(disc.created).toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 mb-6 text-sm text-purple-300">
          <strong>⚠️ Warning:</strong> These are emergency recovery tools. Use with caution.
        </div>

        <div className="grid gap-4">
          {/* Account Recovery */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <h3 className="font-bold text-lg mb-3 text-cyan-400">Account Recovery</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleCreateEmergencyAdmin}
                className="p-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded text-left"
              >
                <div className="font-bold text-green-400">Create Emergency Admin</div>
                <div className="text-xs text-gray-400">Create a new admin with no password</div>
              </button>
              <button
                onClick={handleClearAllAccounts}
                className="p-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded text-left"
              >
                <div className="font-bold text-red-400">Clear All Accounts</div>
                <div className="text-xs text-gray-400">Remove all user accounts</div>
              </button>
            </div>
          </div>

          {/* System Recovery */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <h3 className="font-bold text-lg mb-3 text-cyan-400">System Recovery</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleRestoreFromDisc}
                className="p-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded text-left"
              >
                <div className="font-bold text-cyan-400">Restore From Disc</div>
                <div className="text-xs text-gray-400">Restore system snapshot from this disc</div>
              </button>
              <button
                onClick={handleResetPermissions}
                className="p-3 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded text-left"
              >
                <div className="font-bold text-amber-400">Reset Restrictions</div>
                <div className="text-xs text-gray-400">Clear lockdown and maintenance modes</div>
              </button>
            </div>
          </div>

          {/* Data Tools */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <h3 className="font-bold text-lg mb-3 text-cyan-400">Data Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleQuickReset}
                className="p-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded text-left"
              >
                <div className="font-bold text-red-400">Factory Reset</div>
                <div className="text-xs text-gray-400">Wipe everything and start fresh</div>
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem("urbanshade_emergency_disc");
                  setView("menu");
                  toast.success("Recovery disc ejected");
                }}
                className="p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded text-left"
              >
                <div className="font-bold">Eject Recovery Disc</div>
                <div className="text-xs text-gray-400">Remove loaded disc from memory</div>
              </button>
            </div>
          </div>

          {/* Disc Info */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <h3 className="font-bold text-lg mb-3 text-cyan-400">Disc Information</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-400">Version:</span> {disc.version}</div>
              <div><span className="text-gray-400">Created:</span> {new Date(disc.created).toLocaleDateString()}</div>
              <div><span className="text-gray-400">Snapshot Size:</span> {Object.keys(disc.system_snapshot || {}).length} entries</div>
              <div><span className="text-gray-400">Auth Key:</span> <span className="font-mono text-xs">{disc.auth_key?.substring(0, 16)}...</span></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#0a1929] to-[#001f3f] text-white overflow-auto">
      {view === "menu" && renderMenu()}
      {view === "restore" && renderRestore()}
      {view === "flash" && renderFlash()}
      {view === "image-editor" && renderImageEditor()}
      {view === "cmd" && renderCmd()}
      {view === "advanced" && renderAdvanced()}
      {view === "processing" && renderProcessing()}
      {view === "emergency-admin" && renderEmergencyAdmin()}
    </div>
  );
};
