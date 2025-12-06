import { useState, useCallback } from "react";
import { BugcheckData, createBugcheck, BUGCHECK_CODES } from "@/components/BugcheckScreen";
import { commandQueue } from "@/lib/commandQueue";

export const useBugcheck = () => {
  const [activeBugcheck, setActiveBugcheck] = useState<BugcheckData | null>(null);

  const triggerBugcheck = useCallback((
    code: keyof typeof BUGCHECK_CODES,
    description: string,
    location?: string,
    stackTrace?: string
  ) => {
    // Check if bugchecks are disabled (via sudo set bugcheck 0)
    if (commandQueue.areBugchecksDisabled()) {
      console.warn(`[BUGCHECK SUPPRESSED] ${code}: ${description}`);
      return;
    }

    const bugcheck = createBugcheck(code, description, location, stackTrace);
    setActiveBugcheck(bugcheck);
    
    // Log to console for DEF-DEV
    console.error(`[BUGCHECK] ${code}: ${description}`);
  }, []);

  const clearBugcheck = useCallback(() => {
    setActiveBugcheck(null);
  }, []);

  const restartFromBugcheck = useCallback(() => {
    setActiveBugcheck(null);
    window.location.reload();
  }, []);

  const reportToDev = useCallback(() => {
    // Navigate to DEF-DEV if enabled
    const devEnabled = localStorage.getItem('settings_developer_mode') === 'true' || 
                       localStorage.getItem('urbanshade_dev_mode_install') === 'true';
    if (devEnabled) {
      window.open('/def-dev', '_blank');
    } else {
      // Just clear and continue
      setActiveBugcheck(null);
    }
  }, []);

  return {
    activeBugcheck,
    triggerBugcheck,
    clearBugcheck,
    restartFromBugcheck,
    reportToDev
  };
};
