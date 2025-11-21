import { useState, useEffect } from "react";
import { Folder, File, Trash2, Download, Lock, AlertTriangle, Home, Search, Grid3x3, List, ChevronRight, FileText, Image as ImageIcon, Music, Video, Archive } from "lucide-react";
import { toast } from "sonner";
import { saveState, loadState } from "@/lib/persistence";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FileItem {
  name: string;
  type: "file" | "folder";
  size?: string;
  modified: string;
  encrypted?: boolean;
  content?: string;
  critical?: boolean;
  virus?: boolean;
}

interface FileExplorerProps {
  onLog?: (action: string) => void;
  onVirusDetected?: () => void;
}

const initialFileSystem: Record<string, FileItem[]> = {
  "/": [
    { name: "system", type: "folder", modified: "2024-03-15 14:30" },
    { name: "archive", type: "folder", modified: "2024-03-14 09:15" },
    { name: "user", type: "folder", modified: "2024-03-16 11:45" },
    { name: "logs", type: "folder", modified: "2024-03-16 16:22" },
  ],
  "/system": [
    { name: "urbcore.dll", type: "file", size: "2.4 MB", modified: "2024-03-10 08:00", content: "[SYSTEM] Core system library - DO NOT DELETE", critical: true },
    { name: "bootmgr.sys", type: "file", size: "512 KB", modified: "2024-03-10 08:00", content: "[BOOT] Boot manager configuration", critical: true },
    { name: "recovery.dat", type: "file", size: "8.1 MB", modified: "2024-03-15 14:30", content: "[RECOVERY] Snapshot data for system restore", critical: true },
  ],
  "/archive": [
    { name: "pressure_001.txt", type: "file", size: "4 KB", modified: "2024-02-28 16:45", content: "EXPERIMENT LOG #001\nSubject: Z-13 'Pressure'\nStatus: Contained\nThreat Level: EXTREME\nNotes: Subject demonstrates adaptive behavior in high-pressure environments. Recommend increased security protocols." },
    { name: "experiment_log.dat", type: "file", size: "156 KB", modified: "2024-03-01 12:30", encrypted: true, content: "[ENCRYPTED] Access Level 4 Required" },
    { name: "specimen_data.xlsx", type: "file", size: "2.8 MB", modified: "2024-03-10 09:00", content: "[DATA] Specimen catalog and behavioral patterns" },
    { name: "VIRUS_SCANNER.exe", type: "file", size: "666 KB", modified: "████-██-██ ██:██", content: "[EXECUTING...]\n\n> Initializing system scan...\n> Analyzing memory...\n> Checking processes...\n\n[!] CRITICAL ERROR: MALICIOUS CODE DETECTED\n[!] SYSTEM CORRUPTION IN PROGRESS\n[!] ATTEMPTING TO QUARANTINE...\n\n[FAILED]\n\n█████████████ SYSTEM COMPROMISED █████████████\n\nAll your base are belong to us.", virus: true },
    { name: "DELETED_DO_NOT_OPEN.█████", type: "file", size: "??? MB", modified: "████-██-██ ██:██", content: "[FILE CORRUPTED]\n[WARNING: UNAUTHORIZED ACCESS DETECTED]\n[TRACING CONNECTION...]\n\n...they're watching...\n\n[CONNECTION TERMINATED]" },
    { name: "classified", type: "folder", modified: "2024-02-15 10:00" },
  ],
  "/user": [
    { name: "session.tmp", type: "file", size: "12 KB", modified: "2024-03-16 11:45", content: "[SESSION] Active user session data" },
    { name: "notes.txt", type: "file", size: "8 KB", modified: "2024-03-15 18:20", content: "Personal Notes:\n- Check pressure readings in Zone 7\n- Review specimen containment protocols\n- Meeting with Dr. Chen at 1400 hours" },
    { name: "downloads", type: "folder", modified: "2024-03-14 14:00" },
  ],
  "/logs": [
    { name: "system_log.txt", type: "file", size: "234 KB", modified: "2024-03-16 16:22", content: "[16:22:15] System boot successful\n[16:22:18] All core modules loaded\n[16:22:20] Network connection established\n[16:20:45] WARNING: Pressure anomaly detected in Zone 4" },
    { name: "access_log.txt", type: "file", size: "89 KB", modified: "2024-03-16 15:30", content: "[15:30:12] User 'Aswd' logged in\n[15:28:45] User 'Dr_Chen' accessed Archive\n[15:25:30] Failed login attempt from terminal T-07" },
  ],
  "/archive/classified": [
    { name: "project_hadal.pdf", type: "file", size: "45 MB", modified: "2024-01-20 22:00", encrypted: true, content: "[ENCRYPTED] Top Secret - Clearance Level 5 Required" },
  ],
};

const getFileIcon = (item: FileItem) => {
  if (item.type === "folder") return <Folder className="w-5 h-5" />;
  const ext = item.name.split('.').pop()?.toLowerCase();
  if (ext === 'txt') return <FileText className="w-5 h-5" />;
  if (['jpg', 'png', 'gif'].includes(ext || '')) return <ImageIcon className="w-5 h-5" />;
  if (['mp3', 'wav'].includes(ext || '')) return <Music className="w-5 h-5" />;
  if (['mp4', 'avi'].includes(ext || '')) return <Video className="w-5 h-5" />;
  if (['zip', 'rar'].includes(ext || '')) return <Archive className="w-5 h-5" />;
  return <File className="w-5 h-5" />;
};

export const FileExplorer = ({ onLog, onVirusDetected }: FileExplorerProps) => {
  const [currentPath, setCurrentPath] = useState("/");
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [fileSystem, setFileSystem] = useState<Record<string, FileItem[]>>(() => 
    loadState('file_system', initialFileSystem)
  );
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    saveState('file_system', fileSystem);
  }, [fileSystem]);

  const currentFiles = fileSystem[currentPath] || [];
  const filteredFiles = searchQuery 
    ? currentFiles.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : currentFiles;

  const navigateToPath = (path: string) => {
    setCurrentPath(path);
    setSelectedFile(null);
    setSearchQuery("");
  };

  const openItem = (item: FileItem) => {
    if (item.virus && onVirusDetected) {
      toast.error("VIRUS DETECTED!");
      onVirusDetected();
      return;
    }

    if (item.type === "folder") {
      const newPath = currentPath === "/" ? `/${item.name}` : `${currentPath}/${item.name}`;
      navigateToPath(newPath);
      onLog?.(`Opened folder: ${newPath}`);
    } else {
      setSelectedFile(item);
      onLog?.(`Opened file: ${item.name}`);
    }
  };

  const goBack = () => {
    if (currentPath === "/") return;
    const parts = currentPath.split("/");
    parts.pop();
    navigateToPath(parts.join("/") || "/");
  };

  const deleteItem = (item: FileItem) => {
    if (item.critical) {
      toast.error("Cannot delete critical system file!");
      return;
    }
    
    const newFiles = currentFiles.filter(f => f.name !== item.name);
    setFileSystem({ ...fileSystem, [currentPath]: newFiles });
    if (selectedFile?.name === item.name) setSelectedFile(null);
    toast.success(`Deleted ${item.name}`);
    onLog?.(`Deleted: ${item.name}`);
  };

  const quickAccessFolders = [
    { name: "Home", path: "/" },
    { name: "System", path: "/system" },
    { name: "Archive", path: "/archive" },
    { name: "User", path: "/user" },
    { name: "Logs", path: "/logs" },
  ];

  const pathParts = currentPath.split("/").filter(p => p);

  return (
    <div className="h-full flex bg-background">
      {/* Sidebar */}
      <div className="w-56 border-r bg-gradient-to-b from-muted/50 to-muted/30 flex flex-col">
        <div className="p-4 border-b">
          <h3 className="font-bold flex items-center gap-2">
            <Home className="w-4 h-4 text-primary" />
            Quick Access
          </h3>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-0.5">
            {quickAccessFolders.map((folder) => (
              <button
                key={folder.path}
                onClick={() => navigateToPath(folder.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all ${
                  currentPath === folder.path
                    ? 'bg-primary text-primary-foreground shadow-lg scale-[1.02]'
                    : 'hover:bg-muted hover:translate-x-1'
                }`}
              >
                <Folder className={`w-4 h-4 ${currentPath === folder.path ? '' : 'text-primary'}`} />
                <span className="font-medium">{folder.name}</span>
              </button>
            ))}
          </div>
          
          <div className="p-3 mt-4 border-t">
            <div className="text-xs font-bold text-muted-foreground mb-2">STORAGE</div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Used:</span>
                <span className="font-mono">42.8 GB</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: '65%' }} />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Free:</span>
                <span className="font-mono">23.2 GB</span>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="border-b bg-muted/30 p-2 flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={goBack} disabled={currentPath === "/"}>
            <ChevronRight className="w-4 h-4 rotate-180" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigateToPath("/")}>
            <Home className="w-4 h-4" />
          </Button>
          
          {/* Breadcrumb */}
          <div className="flex items-center gap-1 flex-1">
            <button
              onClick={() => navigateToPath("/")}
              className="px-2 py-1 hover:bg-muted rounded text-sm font-mono"
            >
              /
            </button>
            {pathParts.map((part, i) => (
              <div key={i} className="flex items-center gap-1">
                <ChevronRight className="w-3 h-3 text-muted-foreground" />
                <button
                  onClick={() => {
                    const path = "/" + pathParts.slice(0, i + 1).join("/");
                    navigateToPath(path);
                  }}
                  className="px-2 py-1 hover:bg-muted rounded text-sm font-mono"
                >
                  {part}
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              onClick={() => setViewMode('grid')}
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'list' ? 'default' : 'outline'}
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files..."
              className="pl-9"
            />
          </div>
        </div>

        {/* File List */}
        <div className="flex-1 flex overflow-hidden">
          <ScrollArea className="flex-1">
            <div className={`p-3 ${viewMode === 'grid' ? 'grid grid-cols-4 gap-3' : 'space-y-1'}`}>
              {filteredFiles.length === 0 ? (
                <div className="col-span-4 text-center py-12 text-muted-foreground">
                  {searchQuery ? 'No files match your search' : 'Folder is empty'}
                </div>
              ) : (
                filteredFiles.map((item) => (
                  viewMode === 'grid' ? (
                    <Card
                      key={item.name}
                      className={`p-3 cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedFile?.name === item.name ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => {
                        if (item.type === 'folder') openItem(item);
                        else setSelectedFile(item);
                      }}
                      onDoubleClick={() => openItem(item)}
                    >
                      <div className="flex flex-col items-center gap-2 text-center">
                        <div className="text-primary">{getFileIcon(item)}</div>
                        <div className="text-xs truncate w-full">{item.name}</div>
                        {item.encrypted && <Lock className="w-3 h-3 text-amber-500" />}
                        {item.critical && <AlertTriangle className="w-3 h-3 text-destructive" />}
                      </div>
                    </Card>
                  ) : (
                    <div
                      key={item.name}
                      className={`flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedFile?.name === item.name ? 'bg-muted' : ''
                      }`}
                      onClick={() => {
                        if (item.type === 'folder') openItem(item);
                        else setSelectedFile(item);
                      }}
                      onDoubleClick={() => openItem(item)}
                    >
                      <div className="text-primary">{getFileIcon(item)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{item.name}</div>
                        <div className="text-xs text-muted-foreground">{item.size || 'Folder'}</div>
                      </div>
                      <div className="text-xs text-muted-foreground">{item.modified}</div>
                      <div className="flex gap-1">
                        {item.encrypted && <Lock className="w-4 h-4 text-amber-500" />}
                        {item.critical && <AlertTriangle className="w-4 h-4 text-destructive" />}
                        {!item.critical && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteItem(item);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                ))
              )}
            </div>
          </ScrollArea>

          {/* Preview Panel */}
          {selectedFile && (
            <div className="w-80 border-l bg-muted/30 flex flex-col">
              <div className="p-3 border-b">
                <h3 className="font-bold text-sm">File Details</h3>
              </div>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  <div className="flex flex-col items-center gap-2 py-4">
                    <div className="text-primary">{getFileIcon(selectedFile)}</div>
                    <div className="font-bold text-center break-all">{selectedFile.name}</div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span>{selectedFile.type === 'folder' ? 'Folder' : 'File'}</span>
                    </div>
                    {selectedFile.size && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Size:</span>
                        <span>{selectedFile.size}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Modified:</span>
                      <span>{selectedFile.modified}</span>
                    </div>
                    {selectedFile.encrypted && (
                      <div className="p-2 bg-amber-500/20 border border-amber-500/30 rounded text-amber-500 text-xs">
                        <Lock className="w-3 h-3 inline mr-1" />
                        Encrypted
                      </div>
                    )}
                    {selectedFile.critical && (
                      <div className="p-2 bg-destructive/20 border border-destructive/30 rounded text-destructive text-xs">
                        <AlertTriangle className="w-3 h-3 inline mr-1" />
                        Critical System File
                      </div>
                    )}
                  </div>
                  {selectedFile.content && (
                    <div className="pt-4 border-t">
                      <div className="text-xs font-bold mb-2 text-muted-foreground">CONTENT:</div>
                      <pre className="text-xs font-mono bg-muted p-3 rounded whitespace-pre-wrap">
                        {selectedFile.content}
                      </pre>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
