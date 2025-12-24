import { useState, useEffect, useRef } from "react";
import { MapPin, AlertTriangle, CheckCircle, XCircle, Users, Crosshair, ZoomIn, ZoomOut, RotateCcw, Move, Download, Skull, Shield, FlaskConical, HardHat, Zap, Radio, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

type ZoneType = "light" | "heavy" | "entrance" | "surface";
type TeamId = "classD" | "scientists" | "foundation" | "chaos";

interface Room {
  id: string;
  name: string;
  shortName: string;
  zone: ZoneType;
  status: "operational" | "warning" | "critical" | "offline";
  x: number;
  y: number;
  width: number;
  height: number;
  connections: string[];
  special?: "scp" | "checkpoint" | "elevator" | "tesla" | "nuke" | "servers" | "microhid";
}

interface PersonnelStats {
  scps: number;
  mtf: number;
  scientists: number;
  classD: number;
  chaos: number;
}

export const FacilityMap = () => {
  const [selectedZone, setSelectedZone] = useState<ZoneType>("heavy");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [entityEscaped, setEntityEscaped] = useState(false);
  const [playerPos, setPlayerPos] = useState({ x: 400, y: 300 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [showScanner, setShowScanner] = useState(false);
  const [accessTier, setAccessTier] = useState(1);
  const [auxPower, setAuxPower] = useState(85);
  const maxPower = 110;
  const mapRef = useRef<HTMLDivElement>(null);

  // Scanner state
  const [zoneEnabled, setZoneEnabled] = useState<Record<ZoneType, boolean>>({
    surface: true,
    light: true,
    entrance: true,
    heavy: true,
  });
  const [teamDetection, setTeamDetection] = useState<Record<TeamId, boolean>>({
    classD: true,
    scientists: true,
    foundation: false,
    chaos: true,
  });
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuspended, setScanSuspended] = useState(true);

  const [personnel, setPersonnel] = useState<PersonnelStats>({
    scps: 1,
    mtf: 0,
    scientists: 2,
    classD: 3,
    chaos: 0,
  });

  // Zone definitions with SCP:SL colors
  const zones: { id: ZoneType; name: string; color: string; bgColor: string }[] = [
    { id: "surface", name: "Surface Zone", color: "text-green-400", bgColor: "bg-green-600" },
    { id: "light", name: "Light Containment", color: "text-yellow-400", bgColor: "bg-yellow-600" },
    { id: "heavy", name: "Heavy Containment", color: "text-red-400", bgColor: "bg-red-600" },
    { id: "entrance", name: "Entrance Zone", color: "text-blue-400", bgColor: "bg-blue-600" },
  ];

  // Rooms per zone (SCP:SL inspired)
  const rooms: Room[] = [
    // Heavy Containment
    { id: "hcz-049", name: "SCP-049 Containment", shortName: "SCP-049", zone: "heavy", status: "operational", x: 100, y: 100, width: 100, height: 80, connections: ["hcz-corridor-1"], special: "scp" },
    { id: "hcz-106", name: "SCP-106 Containment", shortName: "SCP-106", zone: "heavy", status: "critical", x: 250, y: 100, width: 100, height: 80, connections: ["hcz-corridor-1", "hcz-corridor-2"], special: "scp" },
    { id: "hcz-079", name: "SCP-079 Containment", shortName: "SCP-079", zone: "heavy", status: "operational", x: 400, y: 100, width: 100, height: 80, connections: ["hcz-corridor-2"], special: "scp" },
    { id: "hcz-096", name: "SCP-096 Containment", shortName: "SCP-096", zone: "heavy", status: "warning", x: 550, y: 100, width: 100, height: 80, connections: ["hcz-corridor-3"], special: "scp" },
    { id: "hcz-corridor-1", name: "HCZ Corridor Alpha", shortName: "CORRIDOR A", zone: "heavy", status: "operational", x: 100, y: 200, width: 250, height: 40, connections: ["hcz-049", "hcz-106", "hcz-tesla"] },
    { id: "hcz-corridor-2", name: "HCZ Corridor Beta", shortName: "CORRIDOR B", zone: "heavy", status: "operational", x: 250, y: 260, width: 250, height: 40, connections: ["hcz-106", "hcz-079", "hcz-nuke"] },
    { id: "hcz-corridor-3", name: "HCZ Corridor Gamma", shortName: "CORRIDOR G", zone: "heavy", status: "operational", x: 450, y: 200, width: 200, height: 40, connections: ["hcz-079", "hcz-096", "hcz-servers"] },
    { id: "hcz-tesla", name: "Tesla Gate", shortName: "TESLA", zone: "heavy", status: "operational", x: 100, y: 320, width: 80, height: 60, connections: ["hcz-corridor-1", "hcz-elev-a"], special: "tesla" },
    { id: "hcz-nuke", name: "Alpha Warhead", shortName: "NUKE", zone: "heavy", status: "offline", x: 300, y: 320, width: 100, height: 60, connections: ["hcz-corridor-2"], special: "nuke" },
    { id: "hcz-servers", name: "Server Room", shortName: "SERVERS", zone: "heavy", status: "operational", x: 500, y: 320, width: 100, height: 60, connections: ["hcz-corridor-3"], special: "servers" },
    { id: "hcz-microhid", name: "Micro H.I.D. Storage", shortName: "MICROHID", zone: "heavy", status: "operational", x: 500, y: 400, width: 100, height: 60, connections: ["hcz-servers"], special: "microhid" },
    { id: "hcz-elev-a", name: "Elevator System A", shortName: "ELEV A", zone: "heavy", status: "operational", x: 100, y: 400, width: 80, height: 60, connections: ["hcz-tesla"], special: "elevator" },
    { id: "hcz-elev-b", name: "Elevator System B", shortName: "ELEV B", zone: "heavy", status: "operational", x: 300, y: 400, width: 80, height: 60, connections: ["hcz-nuke"], special: "elevator" },
    { id: "hcz-checkpoint", name: "HCZ/EZ Checkpoint", shortName: "CHECKPOINT", zone: "heavy", status: "operational", x: 200, y: 480, width: 180, height: 50, connections: ["hcz-elev-a", "hcz-elev-b"], special: "checkpoint" },

    // Light Containment
    { id: "lcz-173", name: "SCP-173 Containment", shortName: "SCP-173", zone: "light", status: "operational", x: 100, y: 100, width: 100, height: 80, connections: ["lcz-corridor-1"], special: "scp" },
    { id: "lcz-914", name: "SCP-914", shortName: "SCP-914", zone: "light", status: "operational", x: 250, y: 100, width: 100, height: 80, connections: ["lcz-corridor-1"], special: "scp" },
    { id: "lcz-corridor-1", name: "LCZ Corridor", shortName: "CORRIDOR", zone: "light", status: "operational", x: 100, y: 200, width: 350, height: 40, connections: ["lcz-173", "lcz-914", "lcz-armory"] },
    { id: "lcz-armory", name: "LCZ Armory", shortName: "ARMORY", zone: "light", status: "operational", x: 450, y: 180, width: 100, height: 80, connections: ["lcz-corridor-1"] },
    { id: "lcz-checkpoint", name: "LCZ/HCZ Checkpoint", shortName: "CHECKPOINT", zone: "light", status: "operational", x: 200, y: 300, width: 180, height: 50, connections: ["lcz-corridor-1"], special: "checkpoint" },

    // Entrance Zone
    { id: "ez-gate-a", name: "Gate A", shortName: "GATE A", zone: "entrance", status: "operational", x: 100, y: 100, width: 120, height: 80, connections: ["ez-corridor"], special: "checkpoint" },
    { id: "ez-gate-b", name: "Gate B", shortName: "GATE B", zone: "entrance", status: "operational", x: 500, y: 100, width: 120, height: 80, connections: ["ez-corridor"], special: "checkpoint" },
    { id: "ez-corridor", name: "EZ Main Corridor", shortName: "CORRIDOR", zone: "entrance", status: "operational", x: 100, y: 200, width: 520, height: 40, connections: ["ez-gate-a", "ez-gate-b", "ez-intercom"] },
    { id: "ez-intercom", name: "Intercom Room", shortName: "INTERCOM", zone: "entrance", status: "operational", x: 300, y: 280, width: 100, height: 60, connections: ["ez-corridor"] },

    // Surface
    { id: "surf-helipad", name: "Helipad", shortName: "HELIPAD", zone: "surface", status: "operational", x: 200, y: 100, width: 150, height: 100, connections: ["surf-exit"] },
    { id: "surf-exit", name: "Facility Exit", shortName: "EXIT", zone: "surface", status: "operational", x: 300, y: 250, width: 100, height: 60, connections: ["surf-helipad", "surf-escape"] },
    { id: "surf-escape", name: "Escape Route", shortName: "ESCAPE", zone: "surface", status: "operational", x: 300, y: 350, width: 100, height: 60, connections: ["surf-exit"] },
  ];

  const currentZoneRooms = rooms.filter(r => r.zone === selectedZone);

  useEffect(() => {
    const checkForEscape = () => {
      if (Math.random() < 0.01) {
        setEntityEscaped(true);
        setPersonnel(p => ({ ...p, scps: p.scps + 1 }));
        toast.error("🚨 CONTAINMENT BREACH - SCP-106 HAS ESCAPED!", { duration: 10000 });
      }
    };
    const interval = setInterval(checkForEscape, 300000);
    return () => clearInterval(interval);
  }, []);

  // Randomize personnel counts occasionally
  useEffect(() => {
    const interval = setInterval(() => {
      setPersonnel(p => ({
        scps: Math.max(0, p.scps + (Math.random() < 0.3 ? (Math.random() < 0.5 ? -1 : 1) : 0)),
        mtf: Math.max(0, Math.min(12, p.mtf + (Math.random() < 0.3 ? Math.floor(Math.random() * 3) - 1 : 0))),
        scientists: Math.max(0, Math.min(8, p.scientists + (Math.random() < 0.3 ? Math.floor(Math.random() * 3) - 1 : 0))),
        classD: Math.max(0, Math.min(10, p.classD + (Math.random() < 0.3 ? Math.floor(Math.random() * 3) - 1 : 0))),
        chaos: Math.max(0, Math.min(5, p.chaos + (Math.random() < 0.2 ? Math.floor(Math.random() * 2) : 0))),
      }));
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Power regeneration
  useEffect(() => {
    const interval = setInterval(() => {
      setAuxPower(p => Math.min(maxPower, p + 1));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleZoom = (delta: number) => {
    setZoom(prev => Math.max(0.5, Math.min(2, prev + delta)));
  };

  const handlePanStart = (e: React.MouseEvent) => {
    if (e.button === 2 || e.button === 1 || (e.button === 0 && e.shiftKey)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      e.preventDefault();
    }
  };

  const handlePanMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
  };

  const handlePanEnd = () => setIsPanning(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational": return "border-green-500/60 bg-green-500/10";
      case "warning": return "border-yellow-500/60 bg-yellow-500/20";
      case "critical": return "border-red-500/60 bg-red-500/20 animate-pulse";
      case "offline": return "border-gray-500/40 bg-gray-500/10";
      default: return "border-gray-500/40 bg-gray-500/10";
    }
  };

  const getZoneColor = (zone: ZoneType) => {
    switch (zone) {
      case "surface": return "border-green-500/60";
      case "light": return "border-yellow-500/60";
      case "heavy": return "border-red-500/60";
      case "entrance": return "border-blue-500/60";
    }
  };

  const getSpecialIcon = (special?: string) => {
    switch (special) {
      case "scp": return <Skull className="w-3 h-3 text-red-400" />;
      case "checkpoint": return <Shield className="w-3 h-3 text-blue-400" />;
      case "elevator": return <span className="text-[10px] text-cyan-400">▲▼</span>;
      case "tesla": return <span className="text-[10px] text-yellow-400">⚡</span>;
      case "nuke": return <span className="text-[10px] text-red-400">☢</span>;
      default: return null;
    }
  };

  const getTeamColor = (team: TeamId) => {
    switch (team) {
      case "classD": return "text-orange-400";
      case "scientists": return "text-white";
      case "foundation": return "text-blue-400";
      case "chaos": return "text-green-400";
    }
  };

  const renderConnections = () => {
    const connections: JSX.Element[] = [];
    const processed = new Set<string>();

    currentZoneRooms.forEach(room => {
      room.connections.forEach(connId => {
        const connRoom = currentZoneRooms.find(r => r.id === connId);
        if (connRoom) {
          const key = [room.id, connRoom.id].sort().join("-");
          if (!processed.has(key)) {
            processed.add(key);
            const zoneData = zones.find(z => z.id === selectedZone);
            connections.push(
              <line
                key={key}
                x1={room.x + room.width / 2}
                y1={room.y + room.height / 2}
                x2={connRoom.x + connRoom.width / 2}
                y2={connRoom.y + connRoom.height / 2}
                stroke={selectedZone === "heavy" ? "rgba(239, 68, 68, 0.3)" : 
                        selectedZone === "light" ? "rgba(234, 179, 8, 0.3)" :
                        selectedZone === "entrance" ? "rgba(59, 130, 246, 0.3)" :
                        "rgba(34, 197, 94, 0.3)"}
                strokeWidth="3"
              />
            );
          }
        }
      });
    });
    return connections;
  };

  // Breach Scanner View
  if (showScanner) {
    return (
      <div className="h-full bg-[#0a0a12] font-mono flex flex-col">
        {/* Header */}
        <div className="border-b border-cyan-500/20 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Radio className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-cyan-400">BREACH SCANNER</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs ${scanSuspended ? "text-yellow-400" : "text-green-400"}`}>
              {scanSuspended ? "SCAN SEQUENCE SUSPENDED" : "SCANNING..."}
            </span>
            <button 
              onClick={() => setShowScanner(false)}
              className="px-3 py-1 text-xs text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20"
            >
              RETURN TO MAP <kbd className="ml-1 px-1 bg-black/50 rounded">Space</kbd>
            </button>
          </div>
        </div>

        {/* Scanner Content */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto grid grid-cols-2 gap-6">
            {/* Zone Selection */}
            <div className="space-y-4">
              <div className="text-xs text-cyan-600 uppercase tracking-wider">Select Zones to Scan</div>
              <div className="grid grid-cols-2 gap-2">
                {zones.map(zone => (
                  <button
                    key={zone.id}
                    onClick={() => setZoneEnabled(z => ({ ...z, [zone.id]: !z[zone.id] }))}
                    className={`p-3 border text-xs font-bold transition-colors ${
                      zoneEnabled[zone.id] 
                        ? `${zone.bgColor} text-white border-white/20` 
                        : "bg-gray-800/50 text-gray-400 border-gray-600/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{zone.name}</span>
                      <span>{zoneEnabled[zone.id] ? "ON" : "OFF"}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Team Detection */}
            <div className="space-y-4">
              <div className="text-xs text-cyan-600 uppercase tracking-wider">Select Teams to Detect</div>
              <div className="space-y-2">
                {(["classD", "scientists", "foundation", "chaos"] as TeamId[]).map(team => (
                  <label
                    key={team}
                    className="flex items-center gap-3 p-3 bg-[#1a1a2e] border border-cyan-500/20 cursor-pointer hover:bg-[#252536]"
                  >
                    <input
                      type="checkbox"
                      checked={teamDetection[team]}
                      onChange={() => setTeamDetection(t => ({ ...t, [team]: !t[team] }))}
                      className="w-4 h-4"
                    />
                    <span className={`text-sm font-medium ${getTeamColor(team)}`}>
                      {team === "classD" ? "Class-D Personnel" :
                       team === "scientists" ? "Scientists" :
                       team === "foundation" ? "Foundation Personnel" : "Chaos Insurgency"}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Status */}
        <div className="border-t border-cyan-500/20 p-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <div className="text-[10px] text-cyan-600">ACCESS TIER {accessTier}</div>
              <div className="w-24 h-2 bg-black border border-cyan-500/30 mt-1">
                <div className="h-full bg-cyan-500/60" style={{ width: `${(accessTier / 5) * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="text-[10px] text-cyan-600 flex items-center gap-1">
                <Zap className="w-3 h-3" /> AUXILIARY POWER {auxPower} / {maxPower}
              </div>
              <div className="w-32 h-2 bg-black border border-cyan-500/30 mt-1">
                <div className={`h-full ${auxPower < 30 ? "bg-red-500/60" : "bg-cyan-500/60"}`} style={{ width: `${(auxPower / maxPower) * 100}%` }} />
              </div>
            </div>
          </div>
          <Button 
            onClick={() => {
              setScanSuspended(false);
              setIsScanning(true);
              setTimeout(() => {
                setIsScanning(false);
                setScanSuspended(true);
                toast.success("Scan complete");
              }, 3000);
            }}
            disabled={isScanning || auxPower < 50}
            className="bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30"
          >
            {isScanning ? "SCANNING..." : "INITIATE SCAN (50 AP)"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-[#0a0a12] font-mono">
      {/* Map View */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Stats Panel - Top */}
        <div className="bg-[#0d0d18] border-b border-cyan-500/20 px-4 py-3 flex items-center gap-8">
          <div className="flex items-center gap-2 text-xs">
            <Skull className="w-4 h-4 text-red-500" />
            <span className="text-gray-500">SCPs:</span>
            <span className="font-bold text-red-400">{personnel.scps}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-gray-500">MTF:</span>
            <span className="font-bold text-blue-400">{personnel.mtf}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <FlaskConical className="w-4 h-4 text-white" />
            <span className="text-gray-500">Scientists:</span>
            <span className="font-bold text-white">{personnel.scientists}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <HardHat className="w-4 h-4 text-orange-400" />
            <span className="text-gray-500">Class-D:</span>
            <span className="font-bold text-orange-400">{personnel.classD}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Users className="w-4 h-4 text-green-400" />
            <span className="text-gray-500">Chaos:</span>
            <span className="font-bold text-green-400">{personnel.chaos}</span>
          </div>
          
          <div className="ml-auto flex gap-1">
            <Button size="sm" variant="ghost" onClick={() => setShowScanner(true)} className="h-7 px-2 text-cyan-400 hover:text-cyan-300">
              <Radio className="w-3 h-3 mr-1" />
              <span className="text-xs">SCANNER</span>
            </Button>
            <Button size="sm" variant="ghost" onClick={() => handleZoom(0.1)} className="h-7 px-2">
              <ZoomIn className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => handleZoom(-0.1)} className="h-7 px-2">
              <ZoomOut className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="h-7 px-2">
              <RotateCcw className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Map Canvas */}
        <div 
          ref={mapRef}
          className="flex-1 overflow-hidden relative bg-[#06060c]"
          onMouseDown={handlePanStart}
          onMouseMove={handlePanMove}
          onMouseUp={handlePanEnd}
          onMouseLeave={handlePanEnd}
          onContextMenu={(e) => e.preventDefault()}
        >
          <div
            className="absolute"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'top left',
              transition: isPanning ? 'none' : 'transform 0.1s ease-out'
            }}
          >
            {/* Grid */}
            <div 
              className="absolute opacity-10 pointer-events-none"
              style={{
                width: '800px',
                height: '600px',
                backgroundImage: `
                  linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px'
              }}
            />

            {/* Connections */}
            <svg className="absolute pointer-events-none" style={{ width: '800px', height: '600px' }}>
              {renderConnections()}
            </svg>

            {/* Rooms */}
            {currentZoneRooms.map((room) => (
              <div
                key={room.id}
                onClick={() => setSelectedRoom(room)}
                className={`absolute cursor-pointer transition-all border-2 ${getStatusColor(room.status)} ${getZoneColor(room.zone)} ${
                  selectedRoom?.id === room.id ? "ring-2 ring-white/50" : ""
                } hover:brightness-125`}
                style={{
                  left: `${room.x}px`,
                  top: `${room.y}px`,
                  width: `${room.width}px`,
                  height: `${room.height}px`,
                }}
              >
                <div className="flex flex-col h-full justify-between p-1.5">
                  <div className="flex items-start justify-between">
                    {getSpecialIcon(room.special)}
                    {room.status === "critical" && (
                      <AlertTriangle className="w-3 h-3 text-red-500 animate-pulse" />
                    )}
                  </div>
                  <div className="text-[9px] font-bold text-white/90 text-center leading-tight uppercase tracking-wide">
                    {room.shortName}
                  </div>
                </div>
              </div>
            ))}

            {/* Player Position Crosshair */}
            <div
              className="absolute pointer-events-none z-50"
              style={{
                left: `${playerPos.x}px`,
                top: `${playerPos.y}px`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <Crosshair className="w-6 h-6 text-green-400 drop-shadow-lg" />
            </div>

            {/* Entity indicator when escaped */}
            {entityEscaped && (
              <div
                className="absolute w-8 h-8 bg-red-600/80 rounded-full animate-pulse flex items-center justify-center text-lg z-40"
                style={{
                  left: `${180 + Math.random() * 200}px`,
                  top: `${150 + Math.random() * 150}px`,
                  filter: "drop-shadow(0 0 10px rgba(239, 68, 68, 0.8))"
                }}
              >
                <Skull className="w-4 h-4 text-white" />
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-[#0d0d18]/90 border border-cyan-500/20 p-3 text-[10px] space-y-1.5 z-10">
            <div className="font-bold text-xs mb-2 text-white/80">LEGEND</div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border border-green-500/60 bg-green-500/10" />
              <span className="text-gray-400">Operational</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border border-yellow-500/60 bg-yellow-500/20" />
              <span className="text-gray-400">Warning</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border border-red-500/60 bg-red-500/20" />
              <span className="text-gray-400">Critical</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border border-gray-500/40 bg-gray-500/10" />
              <span className="text-gray-400">Offline</span>
            </div>
          </div>

          {/* Controls hint */}
          <div className="absolute bottom-4 right-4 bg-[#0d0d18]/90 border border-cyan-500/20 px-3 py-2 text-[10px] text-gray-400 z-10">
            <Move className="w-3 h-3 inline mr-1" />
            Shift+Drag to pan
          </div>
        </div>

        {/* Bottom Status Bar */}
        <div className="bg-[#0d0d18] border-t border-cyan-500/20 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <div className="text-[10px] text-cyan-600">ACCESS TIER {accessTier}</div>
              <div className="w-24 h-1.5 bg-black border border-cyan-500/30 mt-1">
                <div className="h-full bg-cyan-500/60" style={{ width: `${(accessTier / 5) * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="text-[10px] text-cyan-600 flex items-center gap-1">
                <Zap className="w-3 h-3" /> AUXILIARY POWER {auxPower} / {maxPower}
              </div>
              <div className="w-32 h-1.5 bg-black border border-cyan-500/30 mt-1">
                <div className={`h-full ${auxPower < 30 ? "bg-red-500/60" : "bg-cyan-500/60"}`} style={{ width: `${(auxPower / maxPower) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Zones */}
      <div className="w-56 border-l border-cyan-500/20 bg-[#0d0d18] flex flex-col">
        <div className="p-4 border-b border-cyan-500/20">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <h2 className="font-bold text-sm text-white">FACILITY ZONES</h2>
          </div>
          
          <div className="space-y-2">
            {zones.map(zone => (
              <button
                key={zone.id}
                onClick={() => { setSelectedZone(zone.id); setSelectedRoom(null); }}
                className={`w-full text-left p-3 rounded transition-all text-xs font-medium ${
                  selectedZone === zone.id 
                    ? `${zone.bgColor} text-white` 
                    : "bg-[#1a1a2e] hover:bg-[#252536] text-gray-400"
                }`}
              >
                {zone.name}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Room Details */}
        <ScrollArea className="flex-1">
          <div className="p-4">
            {selectedRoom ? (
              <div className="space-y-4">
                <div>
                  <div className="font-bold text-sm text-white">{selectedRoom.name}</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider">
                    {zones.find(z => z.id === selectedRoom.zone)?.name}
                  </div>
                </div>

                <div className="p-3 bg-[#1a1a2e] rounded border border-cyan-500/20">
                  <div className="text-[10px] text-gray-500 mb-1">STATUS</div>
                  <div className={`font-bold uppercase text-sm ${
                    selectedRoom.status === "operational" ? "text-green-400" :
                    selectedRoom.status === "warning" ? "text-yellow-400" :
                    selectedRoom.status === "critical" ? "text-red-400" :
                    "text-gray-400"
                  }`}>
                    {selectedRoom.status}
                  </div>
                </div>

                {selectedRoom.special && (
                  <div className="p-3 bg-[#1a1a2e] rounded border border-cyan-500/20">
                    <div className="text-[10px] text-gray-500 mb-1">TYPE</div>
                    <div className="font-bold uppercase text-sm text-cyan-400">
                      {selectedRoom.special}
                    </div>
                  </div>
                )}

                <div className="p-3 bg-[#1a1a2e] rounded border border-cyan-500/20">
                  <div className="text-[10px] text-gray-500 mb-2">CONNECTED TO</div>
                  <div className="space-y-1">
                    {selectedRoom.connections.map(connId => {
                      const connRoom = rooms.find(r => r.id === connId);
                      return connRoom ? (
                        <button
                          key={connId}
                          onClick={() => setSelectedRoom(connRoom)}
                          className="w-full text-left text-[10px] p-2 bg-black/30 rounded hover:bg-cyan-500/20 transition-colors text-cyan-400"
                        >
                          {connRoom.shortName}
                        </button>
                      ) : null;
                    })}
                  </div>
                </div>

                {selectedRoom.status === "critical" && (
                  <div className="p-3 bg-red-500/20 border border-red-500/40 rounded">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
                      <span className="text-[10px] font-bold text-red-400">BREACH DETECTED</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 text-xs py-8">
                Select a room to view details
              </div>
            )}

            {entityEscaped && (
              <div className="mt-4 p-3 bg-red-500/20 border border-red-500/40 rounded animate-pulse">
                <div className="flex items-center gap-2 mb-2">
                  <Skull className="w-4 h-4 text-red-400" />
                  <span className="text-xs font-bold text-red-400">SCP BREACH</span>
                </div>
                <p className="text-[10px] text-red-300">
                  SCP-106 has breached containment. All personnel proceed to nearest checkpoint.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};