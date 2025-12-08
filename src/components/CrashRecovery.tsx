import { useState, useEffect } from "react";
import { AlertTriangle, RotateCcw, Trash2, Download, Clock, Shield, CheckCircle } from "lucide-react";

interface CrashRecoveryData {
  timestamp: string;
  code: string;
  description: string;
  windowState?: Array<{ id: string; appId: string; appName: string }>;
  localStorage?: Record<string, string>;
}

const CRASH_RECOVERY_KEY = 'urbanshade_crash_recovery';
const RECOVERY_POINTS_KEY = 'urbanshade_recovery_points';

interface RecoveryPoint {
  id: string;
  name: string;
  timestamp: string;
  data: Record<string, string>;
  autoCreated: boolean;
}

interface CrashRecoveryProps {
  onRecover: () => void;
  onSkip: () => void;
}

export const saveCrashRecoveryData = (data: CrashRecoveryData) => {
  try {
    localStorage.setItem(CRASH_RECOVERY_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save crash recovery data:', e);
  }
};

export const getCrashRecoveryData = (): CrashRecoveryData | null => {
  try {
    const stored = localStorage.getItem(CRASH_RECOVERY_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const clearCrashRecoveryData = () => {
  localStorage.removeItem(CRASH_RECOVERY_KEY);
};

export const getRecoveryPoints = (): RecoveryPoint[] => {
  try {
    const stored = localStorage.getItem(RECOVERY_POINTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const saveRecoveryPoint = (name: string, autoCreated: boolean = false): RecoveryPoint => {
  const points = getRecoveryPoints();
  
  // Collect all localStorage data
  const data: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && !key.startsWith('urbanshade_recovery') && !key.startsWith('urbanshade_crash')) {
      data[key] = localStorage.getItem(key) || '';
    }
  }
  
  const newPoint: RecoveryPoint = {
    id: `recovery-${Date.now()}`,
    name,
    timestamp: new Date().toISOString(),
    data,
    autoCreated
  };
  
  // Keep only last 10 recovery points
  const updated = [newPoint, ...points].slice(0, 10);
  localStorage.setItem(RECOVERY_POINTS_KEY, JSON.stringify(updated));
  
  return newPoint;
};

export const restoreFromRecoveryPoint = (point: RecoveryPoint) => {
  // Clear current localStorage (except recovery data)
  const keysToKeep = [RECOVERY_POINTS_KEY];
  const keysToRemove: string[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && !keysToKeep.includes(key)) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  // Restore data from recovery point
  Object.entries(point.data).forEach(([key, value]) => {
    localStorage.setItem(key, value);
  });
};

export const deleteRecoveryPoint = (pointId: string) => {
  const points = getRecoveryPoints();
  const updated = points.filter(p => p.id !== pointId);
  localStorage.setItem(RECOVERY_POINTS_KEY, JSON.stringify(updated));
};

export const CrashRecoveryDialog = ({ onRecover, onSkip }: CrashRecoveryProps) => {
  const [recoveryData, setRecoveryData] = useState<CrashRecoveryData | null>(null);
  const [recoveryPoints, setRecoveryPoints] = useState<RecoveryPoint[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<RecoveryPoint | null>(null);
  const [showPoints, setShowPoints] = useState(false);

  useEffect(() => {
    setRecoveryData(getCrashRecoveryData());
    setRecoveryPoints(getRecoveryPoints());
  }, []);

  const handleRecover = () => {
    if (selectedPoint) {
      restoreFromRecoveryPoint(selectedPoint);
    }
    clearCrashRecoveryData();
    onRecover();
  };

  const handleSkip = () => {
    clearCrashRecoveryData();
    onSkip();
  };

  if (!recoveryData) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-slate-900 border border-amber-500/50 rounded-xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-amber-500/20 border-b border-amber-500/30 p-4 flex items-center gap-3">
          <AlertTriangle className="w-8 h-8 text-amber-400" />
          <div>
            <h2 className="font-bold text-amber-400 text-lg">System Crash Detected</h2>
            <p className="text-sm text-amber-300/70">The system crashed previously. Would you like to recover?</p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Crash info */}
          <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-400">
                {new Date(recoveryData.timestamp).toLocaleString()}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-red-400 font-mono">{recoveryData.code}</span>
              <span className="text-slate-500 mx-2">—</span>
              <span className="text-slate-300">{recoveryData.description}</span>
            </div>
          </div>

          {/* Recovery options */}
          {!showPoints ? (
            <div className="space-y-3">
              <button
                onClick={handleRecover}
                className="w-full flex items-center justify-center gap-2 py-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-400 font-medium transition-colors"
              >
                <CheckCircle className="w-5 h-5" />
                Continue Without Recovery
              </button>

              {recoveryPoints.length > 0 && (
                <button
                  onClick={() => setShowPoints(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-lg text-cyan-400 font-medium transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                  Restore from Recovery Point ({recoveryPoints.length} available)
                </button>
              )}

              <button
                onClick={handleSkip}
                className="w-full flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-400 font-medium transition-colors"
              >
                Skip Recovery
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-slate-300">Select Recovery Point</h3>
                <button
                  onClick={() => setShowPoints(false)}
                  className="text-xs text-slate-500 hover:text-slate-300"
                >
                  Back
                </button>
              </div>

              <div className="max-h-60 overflow-auto space-y-2">
                {recoveryPoints.map(point => (
                  <button
                    key={point.id}
                    onClick={() => setSelectedPoint(point)}
                    className={`w-full p-3 rounded-lg border text-left transition-all ${
                      selectedPoint?.id === point.id
                        ? 'bg-cyan-500/20 border-cyan-500'
                        : 'bg-slate-800/50 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-200">{point.name}</span>
                      {point.autoCreated && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-700 text-slate-400 rounded">
                          AUTO
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {new Date(point.timestamp).toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-600 mt-1">
                      {Object.keys(point.data).length} entries saved
                    </div>
                  </button>
                ))}
              </div>

              {selectedPoint && (
                <button
                  onClick={handleRecover}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-lg text-cyan-400 font-medium transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                  Restore "{selectedPoint.name}"
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-800/50 border-t border-slate-700 text-xs text-slate-500">
          <Shield className="w-3 h-3 inline mr-1" />
          Recovery points are automatically created before risky operations
        </div>
      </div>
    </div>
  );
};

export default CrashRecoveryDialog;
