import { useState, useEffect, useCallback } from "react";
import { Camera, Video, AlertTriangle, Power, Radio, Shield, Users, FlaskConical, HardHat, Skull, Zap, MapPin, Volume2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FacilityMap } from "./FacilityMap";

type ZoneId = "surface" | "light" | "entrance" | "heavy";
type TeamId = "classD" | "scientists" | "foundation" | "chaos";

interface CameraFeed {
  id: string;
  name: string;
  shortName: string;
  location: string;
  status: "online" | "offline" | "warning";
  zone: ZoneId;
  feedImage?: string;
}

interface ScanResult {
  zone: ZoneId;
  team: TeamId;
  count: number;
  location: string;
}

export const SecurityCameras = () => {
  const cameras: CameraFeed[] = [
    { id: "CAM-HCZ-01", name: "SCP-049 Entrance", shortName: "049 ENT", location: "Heavy Containment", status: "online", zone: "heavy" },
    { id: "CAM-HCZ-02", name: "SCP-106 Chamber", shortName: "106 CHM", location: "Heavy Containment", status: "warning", zone: "heavy" },
    { id: "CAM-HCZ-03", name: "Tesla Gate", shortName: "TESLA", location: "Heavy Containment", status: "online", zone: "heavy" },
    { id: "CAM-HCZ-04", name: "HCZ Three-Way", shortName: "3-WAY", location: "Heavy Containment", status: "online", zone: "heavy" },
    { id: "CAM-LCZ-01", name: "SCP-173 Containment", shortName: "173 CNT", location: "Light Containment", status: "online", zone: "light" },
    { id: "CAM-LCZ-02", name: "SCP-914 Room", shortName: "914 RM", location: "Light Containment", status: "online", zone: "light" },
    { id: "CAM-LCZ-03", name: "LCZ Armory", shortName: "ARMORY", location: "Light Containment", status: "online", zone: "light" },
    { id: "CAM-EZ-01", name: "Gate A Checkpoint", shortName: "GATE A", location: "Entrance Zone", status: "online", zone: "entrance" },
    { id: "CAM-EZ-02", name: "Gate B Checkpoint", shortName: "GATE B", location: "Entrance Zone", status: "offline", zone: "entrance" },
    { id: "CAM-EZ-03", name: "Intercom Room", shortName: "INTRCM", location: "Entrance Zone", status: "online", zone: "entrance" },
    { id: "CAM-SURF-01", name: "Surface Helipad", shortName: "HELIPAD", location: "Surface", status: "online", zone: "surface" },
    { id: "CAM-SURF-02", name: "Escape Route", shortName: "ESCAPE", location: "Surface", status: "online", zone: "surface" },
  ];

  const [selectedCamera, setSelectedCamera] = useState(cameras[0]);
  const [showMap, setShowMap] = useState(false);
  const [scanLines, setScanLines] = useState(0);
  const [accessTier, setAccessTier] = useState(2);
  const [auxPower, setAuxPower] = useState(85);
  const maxPower = 110;
  const [pingCount, setPingCount] = useState(5);
  const [speakerActive, setSpeakerActive] = useState(false);

  // Scanline animation
  useEffect(() => {
    const interval = setInterval(() => {
      setScanLines(prev => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Power regeneration
  useEffect(() => {
    const interval = setInterval(() => {
      setAuxPower(p => Math.min(maxPower, p + 1));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Tab key to toggle map
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        setShowMap(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handlePing = () => {
    if (auxPower < 5) {
      toast.error("Insufficient auxiliary power");
      return;
    }
    setAuxPower(p => p - 5);
    setPingCount(c => Math.max(0, c - 1));
    toast.success(`Pinging location: ${selectedCamera.name}`);
  };

  const handleSpeaker = () => {
    if (auxPower < 10) {
      toast.error("Insufficient auxiliary power");
      return;
    }
    setAuxPower(p => p - 10);
    setSpeakerActive(true);
    toast.info("Broadcasting on speaker...");
    setTimeout(() => setSpeakerActive(false), 3000);
  };

  const handleBlackout = () => {
    if (auxPower < 25) {
      toast.error("Insufficient auxiliary power");
      return;
    }
    setAuxPower(p => p - 25);
    toast.warning("BLACKOUT INITIATED - Lights disabled for 10 seconds");
  };

  const getNextCamera = () => {
    const currentIndex = cameras.findIndex(c => c.id === selectedCamera.id);
    const nextIndex = (currentIndex + 1) % cameras.length;
    return cameras[nextIndex];
  };

  const getPrevCamera = () => {
    const currentIndex = cameras.findIndex(c => c.id === selectedCamera.id);
    const prevIndex = (currentIndex - 1 + cameras.length) % cameras.length;
    return cameras[prevIndex];
  };

  // If showing map, render the facility map component
  if (showMap) {
    return (
      <div className="relative h-full">
        <FacilityMap />
        {/* Map overlay hint */}
        <div className="absolute top-4 right-4 bg-black/80 border border-cyan-500/30 px-4 py-2 text-xs text-cyan-400 font-mono z-50">
          <span className="opacity-60">CLOSE</span> <kbd className="px-2 py-0.5 bg-cyan-500/20 rounded ml-1">Tab</kbd>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-black font-mono">
      {/* Main Camera View */}
      <div className="flex-1 flex flex-col relative">
        {/* Camera Header */}
        <div className="absolute top-0 left-0 right-0 z-20 p-4 flex items-start justify-between pointer-events-none">
          <div className="bg-black/60 border border-cyan-500/30 p-3 pointer-events-auto">
            <div className="text-cyan-400 text-lg font-bold tracking-wider">{selectedCamera.shortName}</div>
            <div className="text-cyan-600 text-xs">{selectedCamera.location}</div>
            <div className={`text-xs mt-1 ${
              selectedCamera.status === "online" ? "text-green-400" :
              selectedCamera.status === "warning" ? "text-yellow-400" : "text-red-400"
            }`}>
              ● {selectedCamera.status.toUpperCase()}
            </div>
          </div>

          {/* REC indicator */}
          <div className="bg-black/60 border border-red-500/30 px-3 py-2 flex items-center gap-2 pointer-events-auto">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-400 text-xs font-bold">REC</span>
          </div>
        </div>

        {/* Camera Feed Area */}
        <div className="flex-1 relative overflow-hidden bg-[#0a0a0a]">
          {selectedCamera.status === "offline" ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <EyeOff className="w-20 h-20 text-red-500/50 mx-auto mb-4" />
                <div className="text-red-500 font-bold text-xl">NO SIGNAL</div>
                <div className="text-red-500/60 text-xs mt-2">Camera feed unavailable</div>
              </div>
            </div>
          ) : (
            <>
              {/* Simulated camera feed with grid */}
              <div className="absolute inset-0">
                {/* Grid overlay */}
                <div className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: `linear-gradient(rgba(0,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                  }}
                />
                
                {/* Scanline effect */}
                <div 
                  className="absolute inset-0 opacity-30 pointer-events-none"
                  style={{
                    background: `linear-gradient(180deg, transparent ${scanLines}%, rgba(0,255,255,0.05) ${scanLines + 1}%, transparent ${scanLines + 2}%)`
                  }}
                />

                {/* CRT scanlines */}
                <div 
                  className="absolute inset-0 pointer-events-none opacity-20"
                  style={{
                    background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)'
                  }}
                />

                {/* Vignette */}
                <div 
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.8) 100%)'
                  }}
                />

                {/* Room visualization */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-3/4 h-3/4 border border-cyan-500/20 bg-black/40">
                    {/* Room schematic based on camera */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-cyan-500/30 text-6xl">
                      {selectedCamera.zone === "heavy" && <Skull className="w-24 h-24" />}
                      {selectedCamera.zone === "light" && <Camera className="w-24 h-24" />}
                      {selectedCamera.zone === "entrance" && <Shield className="w-24 h-24" />}
                      {selectedCamera.zone === "surface" && <MapPin className="w-24 h-24" />}
                    </div>

                    {/* Simulated movement indicators */}
                    {selectedCamera.status === "warning" && (
                      <div className="absolute top-1/4 left-1/3 animate-pulse">
                        <div className="w-4 h-4 bg-red-500/60 rounded-full" />
                        <div className="text-red-400 text-[10px] mt-1">MOTION</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Camera Navigation - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-4 pointer-events-none">
          <div className="flex items-center justify-between">
            {/* Prev/Next cameras */}
            <div className="bg-black/60 border border-cyan-500/30 p-2 pointer-events-auto">
              <div className="text-[10px] text-cyan-600 mb-1">GO TO:</div>
              <button 
                onClick={() => setSelectedCamera(getPrevCamera())}
                className="block w-full text-left text-cyan-400 text-xs hover:bg-cyan-500/20 px-2 py-1 transition-colors"
              >
                ◄ {getPrevCamera().shortName}
              </button>
              <button 
                onClick={() => setSelectedCamera(getNextCamera())}
                className="block w-full text-left text-cyan-400 text-xs hover:bg-cyan-500/20 px-2 py-1 transition-colors"
              >
                ► {getNextCamera().shortName}
              </button>
            </div>

            {/* Timestamp */}
            <div className="bg-black/60 border border-cyan-500/30 px-3 py-2 pointer-events-auto">
              <div className="text-cyan-400 text-xs font-mono">
                {new Date().toLocaleTimeString()}
              </div>
              <div className="text-cyan-600 text-[10px]">
                {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Actions */}
      <div className="w-56 border-l border-cyan-500/20 bg-[#0a0a12] flex flex-col">
        {/* Action Buttons */}
        <div className="flex-1 p-3 space-y-2">
          <button 
            onClick={() => setShowMap(true)}
            className="w-full p-3 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold hover:bg-cyan-500/20 transition-colors text-left"
          >
            <div className="flex items-center justify-between">
              <span>OPEN FACILITY MAP</span>
              <kbd className="text-[10px] px-1.5 py-0.5 bg-black/50 rounded">Tab</kbd>
            </div>
          </button>

          <button 
            onClick={handlePing}
            disabled={auxPower < 5}
            className="w-full p-3 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold hover:bg-cyan-500/20 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-between">
              <span>PING LOCATION ({pingCount})</span>
              <span className="text-cyan-600">5 AP</span>
            </div>
          </button>

          <button 
            onClick={handleSpeaker}
            disabled={auxPower < 10 || speakerActive}
            className={`w-full p-3 border text-xs font-bold transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed ${
              speakerActive 
                ? "bg-yellow-500/20 border-yellow-500/30 text-yellow-400" 
                : "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20"
            }`}
          >
            <div className="flex items-center justify-between">
              <span>{speakerActive ? "BROADCASTING..." : "USE SPEAKER"}</span>
              <span className="text-cyan-600">10 AP</span>
            </div>
          </button>

          <button 
            onClick={handleBlackout}
            disabled={auxPower < 25}
            className="w-full p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-between">
              <span>BLACKOUT (25)</span>
              <span className="text-red-600">25 AP</span>
            </div>
          </button>

          {/* Camera List */}
          <div className="mt-4 pt-4 border-t border-cyan-500/20">
            <div className="text-[10px] text-cyan-600 mb-2 uppercase tracking-wider">ALL CAMERAS</div>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {cameras.map(cam => (
                <button
                  key={cam.id}
                  onClick={() => setSelectedCamera(cam)}
                  className={`w-full text-left px-2 py-1.5 text-xs transition-colors ${
                    selectedCamera.id === cam.id 
                      ? "bg-cyan-500/20 text-cyan-300" 
                      : "hover:bg-cyan-500/10 text-cyan-500"
                  } ${cam.status === "offline" ? "opacity-50" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <span>{cam.shortName}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      cam.status === "online" ? "bg-green-400" :
                      cam.status === "warning" ? "bg-yellow-400" : "bg-red-400"
                    }`} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Status */}
        <div className="border-t border-cyan-500/20 p-3 space-y-3">
          {/* Access Tier */}
          <div>
            <div className="flex items-center justify-between text-[10px] text-cyan-600 mb-1">
              <span>ACCESS TIER {accessTier}</span>
            </div>
            <div className="h-2 bg-black border border-cyan-500/30">
              <div 
                className="h-full bg-cyan-500/60" 
                style={{ width: `${(accessTier / 5) * 100}%` }}
              />
            </div>
          </div>

          {/* Auxiliary Power */}
          <div>
            <div className="flex items-center justify-between text-[10px] text-cyan-600 mb-1">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                AUXILIARY POWER
              </span>
              <span>{auxPower} / {maxPower}</span>
            </div>
            <div className="h-2 bg-black border border-cyan-500/30">
              <div 
                className={`h-full transition-all ${auxPower < 30 ? "bg-red-500/60" : "bg-cyan-500/60"}`}
                style={{ width: `${(auxPower / maxPower) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};