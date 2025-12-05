import { useEffect, useState } from "react";
import { AlertTriangle, Bug, RefreshCw, ExternalLink } from "lucide-react";

export type CrashType = 
  | "KERNEL_PANIC" 
  | "CRITICAL_PROCESS_DIED" 
  | "SYSTEM_SERVICE_EXCEPTION" 
  | "MEMORY_MANAGEMENT" 
  | "IRQL_NOT_LESS_OR_EQUAL"
  | "PAGE_FAULT_IN_NONPAGED_AREA"
  | "DRIVER_IRQL_NOT_LESS_OR_EQUAL"
  | "SYSTEM_THREAD_EXCEPTION_NOT_HANDLED"
  | "UNEXPECTED_KERNEL_MODE_TRAP"
  | "KMODE_EXCEPTION_NOT_HANDLED"
  | "INACCESSIBLE_BOOT_DEVICE"
  | "VIDEO_TDR_FAILURE"
  | "WHEA_UNCORRECTABLE_ERROR"
  | "DPC_WATCHDOG_VIOLATION"
  | "CLOCK_WATCHDOG_TIMEOUT"
  | "custom";

export interface CrashData {
  stopCode: CrashType;
  process?: string;
  module?: string;
  address?: string;
  description?: string;
  collectingData?: boolean;
}

interface CrashScreenProps {
  onReboot: () => void;
  crashData?: CrashData;
  // Legacy props for backwards compatibility
  killedProcess?: string;
  crashType?: "kernel" | "virus" | "bluescreen" | "memory" | "corruption" | "overload";
  customData?: { title: string; message: string } | null;
}

const STOP_CODES: Record<CrashType, { description: string; whatFailed?: string }> = {
  KERNEL_PANIC: {
    description: "Your device ran into a problem and needs to restart.",
    whatFailed: "ntoskrnl.exe"
  },
  CRITICAL_PROCESS_DIED: {
    description: "A critical system process has terminated unexpectedly.",
    whatFailed: "csrss.exe"
  },
  SYSTEM_SERVICE_EXCEPTION: {
    description: "An exception occurred in a system service.",
    whatFailed: "win32kfull.sys"
  },
  MEMORY_MANAGEMENT: {
    description: "A memory management error has occurred.",
    whatFailed: "ntoskrnl.exe"
  },
  IRQL_NOT_LESS_OR_EQUAL: {
    description: "A kernel-mode process attempted to access memory at an invalid address.",
    whatFailed: "ntoskrnl.exe"
  },
  PAGE_FAULT_IN_NONPAGED_AREA: {
    description: "Invalid system memory was referenced.",
    whatFailed: "ntfs.sys"
  },
  DRIVER_IRQL_NOT_LESS_OR_EQUAL: {
    description: "A driver accessed paged memory at an invalid IRQL.",
    whatFailed: "nvlddmkm.sys"
  },
  SYSTEM_THREAD_EXCEPTION_NOT_HANDLED: {
    description: "A system thread generated an exception that was not handled.",
    whatFailed: "atikmdag.sys"
  },
  UNEXPECTED_KERNEL_MODE_TRAP: {
    description: "The system encountered an unexpected kernel mode trap.",
    whatFailed: "ntoskrnl.exe"
  },
  KMODE_EXCEPTION_NOT_HANDLED: {
    description: "A kernel mode exception was not handled.",
    whatFailed: "ntoskrnl.exe"
  },
  INACCESSIBLE_BOOT_DEVICE: {
    description: "The boot device is inaccessible.",
    whatFailed: "storahci.sys"
  },
  VIDEO_TDR_FAILURE: {
    description: "The display driver failed to respond in time.",
    whatFailed: "nvlddmkm.sys"
  },
  WHEA_UNCORRECTABLE_ERROR: {
    description: "A fatal hardware error has occurred.",
    whatFailed: "hal.dll"
  },
  DPC_WATCHDOG_VIOLATION: {
    description: "A DPC routine exceeded the system watchdog timeout.",
    whatFailed: "storahci.sys"
  },
  CLOCK_WATCHDOG_TIMEOUT: {
    description: "A processor clock interrupt was not received within the allocated interval.",
    whatFailed: "ntoskrnl.exe"
  },
  custom: {
    description: "Your device ran into a problem and needs to restart."
  }
};

export const CrashScreen = ({ 
  onReboot, 
  crashData,
  killedProcess, 
  crashType = "kernel", 
  customData 
}: CrashScreenProps) => {
  const [showScreen, setShowScreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [qrVisible, setQrVisible] = useState(false);

  useEffect(() => {
    const showTimeout = setTimeout(() => {
      setShowScreen(true);
    }, 500);

    return () => clearTimeout(showTimeout);
  }, []);

  useEffect(() => {
    if (showScreen) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + Math.random() * 3;
        });
      }, 150);

      const qrTimeout = setTimeout(() => setQrVisible(true), 800);

      return () => {
        clearInterval(interval);
        clearTimeout(qrTimeout);
      };
    }
  }, [showScreen]);

  if (!showScreen) {
    return <div className="fixed inset-0 bg-black" />;
  }

  // Convert legacy props to new format
  const resolvedCrashData: CrashData = crashData || {
    stopCode: crashType === "bluescreen" ? "CRITICAL_PROCESS_DIED" :
              crashType === "memory" ? "MEMORY_MANAGEMENT" :
              crashType === "overload" ? "DPC_WATCHDOG_VIOLATION" :
              crashType === "virus" ? "SYSTEM_SERVICE_EXCEPTION" :
              "KERNEL_PANIC",
    process: killedProcess || customData?.title,
    description: customData?.message
  };

  const stopInfo = STOP_CODES[resolvedCrashData.stopCode] || STOP_CODES.KERNEL_PANIC;
  const displayProgress = Math.min(100, Math.floor(progress));

  return (
    <div className="fixed inset-0 bg-[#0078d4] text-white font-sans overflow-hidden">
      {/* Subtle scan lines effect */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]" 
        style={{ 
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.3) 1px, rgba(0,0,0,0.3) 2px)' 
        }} 
      />

      <div className="flex flex-col items-start justify-center h-full p-8 md:p-16 max-w-4xl mx-auto animate-fade-in">
        {/* Emoticon */}
        <div className="text-[100px] md:text-[140px] leading-none mb-4 font-light">:(</div>
        
        {/* Main message */}
        <div className="space-y-6 mb-8 md:mb-12">
          <p className="text-xl md:text-2xl leading-relaxed">
            {resolvedCrashData.description || stopInfo.description}
          </p>
          
          {/* CRITICAL: NOT A SIMULATION */}
          <div className="bg-white/15 border-2 border-white/30 rounded-lg p-5 max-w-2xl">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-7 h-7 text-yellow-300 flex-shrink-0 mt-0.5" />
              <div className="space-y-3">
                <p className="text-base md:text-lg leading-relaxed font-semibold text-yellow-200">
                  This is NOT a simulation — a real error occurred.
                </p>
                <p className="text-sm md:text-base leading-relaxed opacity-90">
                  Something went wrong that the system couldn't recover from automatically. This could be 
                  a bug in the code, an unexpected state, or a resource issue.
                </p>
                <div className="pt-2 border-t border-white/20">
                  <p className="text-xs md:text-sm opacity-70">
                    <strong>What you can do:</strong> Click "Restart now" to reboot the system. If this keeps 
                    happening, try entering Recovery Mode (F2 during boot) or report the issue via Debug Error.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="h-1 w-32 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-150" 
                style={{ width: `${displayProgress}%` }}
              />
            </div>
            <p className="text-lg md:text-xl">
              {displayProgress}% complete
            </p>
          </div>
        </div>

        {/* QR Code and info */}
        <div className="flex flex-col md:flex-row items-start gap-6 mb-8 md:mb-12">
          {/* Fake QR Code */}
          <div className={`transition-opacity duration-500 ${qrVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="w-20 h-20 md:w-24 md:h-24 bg-white p-2 rounded-sm">
              <div className="w-full h-full grid grid-cols-5 gap-0.5">
                {Array.from({ length: 25 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`${Math.random() > 0.5 ? 'bg-black' : 'bg-white'}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Technical info */}
          <div className="text-sm leading-relaxed space-y-3 opacity-90">
            <p>
              For more information about this issue and possible fixes, visit<br />
              <span className="underline">https://www.urbanshade.dev/stopcode</span>
            </p>
            <p>
              If you call a support person, give them this info:
            </p>
            <div className="font-mono space-y-1 bg-black/20 p-3 rounded">
              <p>Stop code: {resolvedCrashData.stopCode.replace(/_/g, ' ')}</p>
              {(stopInfo.whatFailed || resolvedCrashData.module) && (
                <p>What failed: {resolvedCrashData.module || stopInfo.whatFailed}</p>
              )}
              {resolvedCrashData.process && (
                <p>Process: {resolvedCrashData.process}</p>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={onReboot}
            className="flex items-center gap-2 px-6 md:px-8 py-3 bg-white/20 hover:bg-white/30 text-white font-semibold transition-colors text-base md:text-lg rounded"
          >
            <RefreshCw className="w-5 h-5" />
            Restart now
          </button>
          <button
            onClick={() => {
              // Store crash data for def-dev
              localStorage.setItem('urbanshade_crash_entry', JSON.stringify({
                stopCode: resolvedCrashData.stopCode,
                process: resolvedCrashData.process,
                module: resolvedCrashData.module || stopInfo.whatFailed,
                timestamp: new Date().toISOString()
              }));
              window.location.href = "/def-dev?from=crash";
            }}
            className="flex items-center gap-2 px-6 md:px-8 py-3 bg-amber-500/30 hover:bg-amber-500/40 text-amber-100 font-semibold transition-colors text-base md:text-lg border border-amber-400/50 rounded"
          >
            <Bug className="w-5 h-5" />
            Debug Error
          </button>
        </div>

        {/* Debug info at bottom */}
        <div className="absolute bottom-6 md:bottom-8 left-8 md:left-16 right-8 md:right-16 text-xs font-mono opacity-50">
          <div className="flex flex-col md:flex-row justify-between gap-2">
            <span>URBANSHADE OS Build 22621.2428</span>
            <span>{new Date().toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to trigger crashes programmatically
export const triggerCrash = (type: CrashType, options?: Partial<CrashData>) => {
  return {
    stopCode: type,
    ...options
  } as CrashData;
};