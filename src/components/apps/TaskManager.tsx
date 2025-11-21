import { useState, useEffect } from "react";
import { Cpu, X } from "lucide-react";

interface Process {
  pid: number;
  name: string;
  cpu: number;
  memory: string;
  status: "running" | "sleeping" | "critical";
  priority: "high" | "normal" | "low";
  isApp?: boolean;
  appId?: string;
}

interface TaskManagerProps {
  windows: Array<{ id: string; app: { id: string; name: string } }>;
  onCloseWindow: (id: string) => void;
  onCriticalKill: (processName: string, type?: "kernel" | "virus" | "bluescreen" | "memory" | "corruption" | "overload") => void;
}

export const TaskManager = ({ windows, onCloseWindow, onCriticalKill }: TaskManagerProps) => {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    // Only critical system processes
    const systemProcesses: Process[] = [
      { pid: 1, name: "urbcore.dll", cpu: 12, memory: "2.4 GB", status: "critical", priority: "high" },
      { pid: 2, name: "security.sys", cpu: 8, memory: "1.2 GB", status: "critical", priority: "high" },
      { pid: 3, name: "pressure_monitor", cpu: 15, memory: "890 MB", status: "critical", priority: "high" },
    ];

    // Convert open windows to processes
    const appProcesses: Process[] = windows.map((window, index) => ({
      pid: 1000 + index,
      name: window.app.name,
      cpu: Math.random() * 15 + 5,
      memory: `${Math.floor(Math.random() * 300 + 100)} MB`,
      status: "running" as const,
      priority: "normal" as const,
      isApp: true,
      appId: window.id
    }));

    setProcesses([...systemProcesses, ...appProcesses]);

    // Simulate CPU fluctuations
    const interval = setInterval(() => {
      setProcesses(prev => prev.map(proc => ({
        ...proc,
        cpu: Math.max(1, proc.cpu + (Math.random() - 0.5) * 4)
      })));
    }, 2000);

    return () => clearInterval(interval);
  }, [windows]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical": return "text-destructive";
      case "running": return "text-primary";
      case "sleeping": return "text-muted-foreground";
      default: return "text-foreground";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-destructive";
      case "normal": return "text-primary";
      case "low": return "text-muted-foreground";
      default: return "text-foreground";
    }
  };

  const totalCpu = processes.reduce((sum, proc) => sum + proc.cpu, 0).toFixed(1);

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-primary/10 via-background to-primary/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <Cpu className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Task Manager</h2>
              <p className="text-xs text-muted-foreground">System resource monitor</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Total CPU Usage</div>
            <div className="text-2xl font-bold font-mono text-primary">{totalCpu}%</div>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-muted-foreground">Processes:</span>
            <span className="font-mono font-bold">{processes.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
            <span className="text-muted-foreground">Critical:</span>
            <span className="font-mono font-bold text-destructive">
              {processes.filter(p => p.status === "critical").length}
            </span>
          </div>
        </div>
      </div>

      {/* Process List */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm border-b">
            <tr className="text-left text-xs">
              <th className="px-4 py-3 font-bold text-muted-foreground">PID</th>
              <th className="px-4 py-3 font-bold text-muted-foreground">PROCESS NAME</th>
              <th className="px-4 py-3 font-bold text-muted-foreground">CPU</th>
              <th className="px-4 py-3 font-bold text-muted-foreground">MEMORY</th>
              <th className="px-4 py-3 font-bold text-muted-foreground">STATUS</th>
              <th className="px-4 py-3 font-bold text-muted-foreground">PRIORITY</th>
              <th className="px-4 py-3 font-bold text-muted-foreground">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {processes.map((proc) => (
              <tr
                key={proc.pid}
                onClick={() => setSelected(proc.pid)}
                className={`border-b border-border cursor-pointer transition-all duration-200 ${
                  selected === proc.pid 
                    ? "bg-primary/20 shadow-sm scale-[1.01]" 
                    : "hover:bg-muted/50 hover:scale-[1.005]"
                }`}
              >
                <td className="px-4 py-3.5">
                  <span className="font-mono text-sm font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                    {proc.pid}
                  </span>
                </td>
                <td className="px-4 py-3.5 font-medium">{proc.name}</td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <span className={`font-mono font-bold ${
                      proc.cpu > 15 ? "text-destructive" : 
                      proc.cpu > 10 ? "text-amber-500" : 
                      "text-primary"
                    }`}>
                      {proc.cpu.toFixed(1)}%
                    </span>
                    <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${
                          proc.cpu > 15 ? "bg-destructive" :
                          proc.cpu > 10 ? "bg-amber-500" :
                          "bg-primary"
                        }`}
                        style={{ width: `${Math.min(100, proc.cpu * 5)}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5 font-mono text-sm text-muted-foreground">{proc.memory}</td>
                <td className="px-4 py-3.5">
                  <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${getStatusColor(proc.status)} ${
                    proc.status === "critical" ? "bg-destructive/10" :
                    proc.status === "running" ? "bg-primary/10" :
                    "bg-muted"
                  }`}>
                    {proc.status}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${getPriorityColor(proc.priority)} ${
                    proc.priority === "high" ? "bg-destructive/10" :
                    proc.priority === "normal" ? "bg-primary/10" :
                    "bg-muted"
                  }`}>
                    {proc.priority}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <button
                    className="p-2 rounded-lg hover:bg-destructive/20 text-destructive transition-all hover:scale-110 border border-transparent hover:border-destructive/30"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (proc.status === "critical") {
                        const crashTypes: Array<"kernel" | "memory" | "overload"> = ["kernel", "memory", "overload"];
                        const randomType = crashTypes[Math.floor(Math.random() * crashTypes.length)];
                        onCriticalKill(proc.name, randomType);
                      } else if (proc.isApp && proc.appId) {
                        onCloseWindow(proc.appId);
                      }
                    }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t bg-gradient-to-r from-muted/50 via-background to-muted/50">
        <div className="mb-4 p-3 bg-destructive/10 border-2 border-destructive/30 rounded-lg text-xs animate-pulse">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
            <span className="font-bold text-destructive">⚠ CRITICAL WARNING:</span>
          </div>
          <span className="text-destructive/90 ml-4">Terminating critical processes will cause immediate system crash.</span>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">Total CPU</div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-primary">{totalCpu}</span>
              <span className="text-sm text-muted-foreground">%</span>
            </div>
          </div>
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">Active Processes</div>
            <div className="text-2xl font-bold font-mono text-primary">{processes.length}</div>
          </div>
          <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">Critical Tasks</div>
            <div className="text-2xl font-bold font-mono text-destructive">
              {processes.filter(p => p.status === "critical").length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
