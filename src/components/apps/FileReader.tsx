import { useState, useEffect } from "react";
import { FileText, Search, Folder, AlertTriangle, Lock, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface FileContent {
  path: string;
  name: string;
  content: string;
  encrypted?: boolean;
  dangerous?: boolean;
}

const FILE_DATABASE: Record<string, FileContent> = {
  "VirusScanner.exe": {
    path: "/archive/VirusScanner.exe",
    name: "VirusScanner.exe",
    content: `[EXECUTING...]

> Initializing system scan...
> Analyzing memory...
> Checking processes...

[!] CRITICAL ERROR: MALICIOUS CODE DETECTED
[!] SYSTEM CORRUPTION IN PROGRESS
[!] ATTEMPTING TO QUARANTINE...

[FAILED]

█████████████ SYSTEM COMPROMISED █████████████

All your base are belong to us.

--- END OF FILE ---`,
    dangerous: true
  },
  "pressure_001.txt": {
    path: "/archive/pressure_001.txt",
    name: "pressure_001.txt",
    content: `EXPERIMENT LOG #001
Subject: Z-13 'Pressure'
Status: Contained
Threat Level: EXTREME

Notes: Subject demonstrates adaptive behavior in high-pressure 
environments. Recommend increased security protocols.

Behavioral Patterns:
- Responds to depth changes
- Exhibits territorial aggression
- Unknown communication method detected

Last Updated: 2024-02-28 16:45
Researcher: Dr. [REDACTED]

--- END OF FILE ---`
  },
  "urbcore.dll": {
    path: "/system/urbcore.dll",
    name: "urbcore.dll",
    content: `[SYSTEM LIBRARY FILE]

UrbanShade Core Library v2.4.1
Build: 2024-03-10 08:00

CRITICAL: DO NOT DELETE OR MODIFY

This file contains essential system functions:
- Boot management
- Memory allocation
- Process scheduling
- Security protocols
- Network communication
- Facility monitoring

Dependencies: bootmgr.sys, security.sys

--- END OF FILE ---`
  },
  "experiment_log.dat": {
    path: "/archive/experiment_log.dat",
    name: "experiment_log.dat",
    content: `[ENCRYPTED FILE]

Access Level: 4 Required
Encryption: AES-256

[FILE CONTENTS PROTECTED]

Please authenticate with security credentials to view contents.

--- END OF FILE ---`,
    encrypted: true
  },
  "project_hadal.pdf": {
    path: "/archive/classified/project_hadal.pdf",
    name: "project_hadal.pdf",
    content: `[TOP SECRET DOCUMENT]

Classification: Level 5
Project: HADAL

[DOCUMENT ENCRYPTED]

Access requires Top Secret clearance and biometric verification.

Unauthorized access will be logged and reported to security.

--- END OF FILE ---`,
    encrypted: true
  },
  "system_log.txt": {
    path: "/logs/system_log.txt",
    name: "system_log.txt",
    content: `[SYSTEM LOG]

[16:22:15] System boot successful
[16:22:18] All core modules loaded
[16:22:20] Network connection established
[16:20:45] WARNING: Pressure anomaly detected in Zone 4
[16:19:30] Containment check: All secure
[16:18:15] Temperature stable: 18.5°C
[16:17:00] Backup systems: Operational
[16:15:45] Security scan: Complete
[16:14:30] Database sync: Success

--- END OF LOG ---`
  },
  "notes.txt": {
    path: "/user/notes.txt",
    name: "notes.txt",
    content: `Personal Notes:

TODO:
- Check pressure readings in Zone 7
- Review specimen containment protocols
- Meeting with Dr. Chen at 1400 hours
- Update security clearances
- Inspect backup generators

Observations:
Subject behavior in Zone 4 has been unusual.
Need to monitor more closely.

--- END OF FILE ---`
  },
  "DELETED_DO_NOT_OPEN.█████": {
    path: "/archive/DELETED_DO_NOT_OPEN.█████",
    name: "DELETED_DO_NOT_OPEN.█████",
    content: `[FILE CORRUPTED]

[WARNING: UNAUTHORIZED ACCESS DETECTED]
[TRACING CONNECTION...]

...they're watching...
...always watching...
...in the dark...
...below...

[CONNECTION TERMINATED]
[ERROR: FILE INTEGRITY COMPROMISED]

--- CORRUPTED DATA ---`,
    dangerous: true
  }
};

export const FileReader = () => {
  const [selectedFile, setSelectedFile] = useState<FileContent | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [recentFiles, setRecentFiles] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("file_reader_recent");
    if (stored) {
      setRecentFiles(JSON.parse(stored));
    }
  }, []);

  const addToRecent = (filename: string) => {
    const updated = [filename, ...recentFiles.filter(f => f !== filename)].slice(0, 5);
    setRecentFiles(updated);
    localStorage.setItem("file_reader_recent", JSON.stringify(updated));
  };

  const openFile = (filename: string) => {
    const file = FILE_DATABASE[filename];
    if (file) {
      setSelectedFile(file);
      addToRecent(filename);
    }
  };

  const availableFiles = Object.values(FILE_DATABASE);
  const filteredFiles = searchQuery
    ? availableFiles.filter(f => 
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.path.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : availableFiles;

  return (
    <div className="h-full flex bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r bg-muted/30 flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            File Reader
          </h2>
          <p className="text-xs text-muted-foreground mt-1">View file contents</p>
        </div>

        {/* Search */}
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files..."
              className="pl-9 h-9"
            />
          </div>
        </div>

        {/* Recent Files */}
        {recentFiles.length > 0 && !searchQuery && (
          <div className="p-3 border-b">
            <div className="text-xs font-bold text-muted-foreground mb-2">RECENT</div>
            <div className="space-y-1">
              {recentFiles.map(filename => {
                const file = FILE_DATABASE[filename];
                if (!file) return null;
                return (
                  <button
                    key={filename}
                    onClick={() => openFile(filename)}
                    className="w-full flex items-center gap-2 p-2 rounded text-sm hover:bg-muted transition-colors text-left"
                  >
                    <FileText className="w-4 h-4 text-primary shrink-0" />
                    <span className="truncate">{filename}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* File List */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            <div className="text-xs font-bold text-muted-foreground px-2 py-1">
              ALL FILES ({filteredFiles.length})
            </div>
            {filteredFiles.map(file => (
              <button
                key={file.name}
                onClick={() => openFile(file.name)}
                className={`w-full flex items-center gap-2 p-2 rounded text-sm hover:bg-muted transition-colors text-left ${
                  selectedFile?.name === file.name ? 'bg-primary text-primary-foreground' : ''
                }`}
              >
                <FileText className="w-4 h-4 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="truncate font-medium">{file.name}</div>
                  <div className="text-xs opacity-70 truncate">{file.path}</div>
                </div>
                {file.encrypted && <Lock className="w-3 h-3 text-amber-500 shrink-0" />}
                {file.dangerous && <AlertTriangle className="w-3 h-3 text-destructive shrink-0" />}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col">
        {selectedFile ? (
          <>
            <div className="border-b bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Folder className="w-4 h-4" />
                {selectedFile.path.split('/').slice(0, -1).join('/')}
                <ChevronRight className="w-3 h-3" />
              </div>
              <h2 className="font-bold text-xl flex items-center gap-3">
                {selectedFile.name}
                {selectedFile.encrypted && (
                  <span className="text-xs bg-amber-500/20 text-amber-500 px-2 py-1 rounded border border-amber-500/30">
                    <Lock className="w-3 h-3 inline mr-1" />
                    ENCRYPTED
                  </span>
                )}
                {selectedFile.dangerous && (
                  <span className="text-xs bg-destructive/20 text-destructive px-2 py-1 rounded border border-destructive/30">
                    <AlertTriangle className="w-3 h-3 inline mr-1" />
                    DANGEROUS
                  </span>
                )}
              </h2>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-6">
                <Card className="p-6 bg-muted/50">
                  <pre className="font-mono text-sm whitespace-pre-wrap leading-relaxed">
                    {selectedFile.content}
                  </pre>
                </Card>
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center p-8">
            <div className="max-w-md">
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-bold mb-2">No File Selected</h3>
              <p className="text-sm text-muted-foreground">
                Select a file from the sidebar to view its contents
              </p>
              <div className="mt-6 p-4 bg-muted/50 rounded-lg text-xs text-left">
                <div className="font-bold mb-2">Available Files:</div>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• System files (urbcore.dll, bootmgr.sys)</li>
                  <li>• Experiment logs and research data</li>
                  <li>• Personal notes and documents</li>
                  <li>• Encrypted classified files</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
