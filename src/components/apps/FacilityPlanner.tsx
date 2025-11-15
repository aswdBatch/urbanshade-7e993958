import { useState, useEffect, useRef } from "react";
import { Grid3x3, Plus, Trash2, Move, Save, FolderOpen, Settings as SettingsIcon, Route, Pen, ZoomIn, ZoomOut, Maximize2, Eye, Edit3, Check, X, Layers } from "lucide-react";
import { toast } from "sonner";
import { saveState, loadState } from "@/lib/persistence";
import { RoomProperties } from "./RoomProperties";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getRoomColor, getRoomBackgroundColor } from "@/lib/roomColors";

interface PlannerRoom {
  id: string;
  name: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  sections: any[];
  doors: any[];
  connections: string[];
  gridShape?: { row: number; col: number }[];
}

interface DrawingPath {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  width: number;
}

interface HallwaySettings {
  autoGenerate: boolean;
  hallwayWidth: number;
}

export const FacilityPlanner = () => {
  const [rooms, setRooms] = useState<PlannerRoom[]>(() => loadState('facility_planner_rooms', []));
  const [mode, setMode] = useState<"facility" | "room-editor" | "hallway">("facility");
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [roomEditorGrid, setRoomEditorGrid] = useState<boolean[][]>([]);
  const [hallwayPoints, setHallwayPoints] = useState<{ x: number; y: number }[]>([]);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [snapToGrid, setSnapToGrid] = useState(() => loadState('facility_planner_snap', true));
  const [showConnections, setShowConnections] = useState(() => loadState('facility_planner_connections', true));
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [placingRoomType, setPlacingRoomType] = useState<string | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [draggingRoom, setDraggingRoom] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, roomX: 0, roomY: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  
  const [hallwaySettings, setHallwaySettings] = useState<HallwaySettings>(() => 
    loadState('facility_planner_hallway_settings', { autoGenerate: false, hallwayWidth: 40 })
  );

  const [betaDialogOpen, setBetaDialogOpen] = useState(() => {
    return !localStorage.getItem('facility_planner_beta_acknowledged');
  });

  const handleBetaAcknowledge = () => {
    localStorage.setItem('facility_planner_beta_acknowledged', 'true');
    setBetaDialogOpen(false);
  };

  useEffect(() => {
    saveState('facility_planner_rooms', rooms);
  }, [rooms]);

  useEffect(() => {
    saveState('facility_planner_snap', snapToGrid);
  }, [snapToGrid]);

  useEffect(() => {
    saveState('facility_planner_connections', showConnections);
  }, [showConnections]);

  const snapValue = (val: number) => snapToGrid ? Math.round(val / 20) * 20 : val;

  const handleZoom = (delta: number) => {
    setZoom(prev => Math.max(0.5, Math.min(2, prev + delta)));
  };

  const handlePanStart = (e: React.MouseEvent) => {
    // Allow right-click drag or middle mouse button or space+drag for panning
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

  const handlePanEnd = () => {
    setIsPanning(false);
  };

  const toggleConnection = (roomId: string) => {
    if (!selectedRoomForConnect) {
      setSelectedRoomForConnect(roomId);
      toast.info("Select another room to connect");
    } else {
      if (selectedRoomForConnect === roomId) {
        setSelectedRoomForConnect(null);
        return;
      }
      setRooms(rooms.map(r => {
        if (r.id === selectedRoomForConnect && !r.connections.includes(roomId)) {
          return { ...r, connections: [...r.connections, roomId] };
        }
        if (r.id === roomId && !r.connections.includes(selectedRoomForConnect)) {
          return { ...r, connections: [...r.connections, selectedRoomForConnect] };
        }
        return r;
      }));
      setSelectedRoomForConnect(null);
      toast.success("Rooms connected");
    }
  };

  const handleRoomClick = (room: PlannerRoom, e: React.MouseEvent) => {
    if (draggingRoom) return;
    setSelectedRoomId(room.id);
    const key = room.id;
    const count = (clickCount[key] || 0) + 1;
    setClickCount({ ...clickCount, [key]: count });
    if (count === 2) {
      setEditingRoom(room);
      setClickCount({});
      setSelectedRoomId(null);
    }
    setTimeout(() => setClickCount(prev => ({ ...prev, [key]: 0 })), 500);
  };

  const handleRoomDragStart = (room: PlannerRoom, e: React.MouseEvent) => {
    e.stopPropagation();
    setDraggingRoom(room.id);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      roomX: room.x,
      roomY: room.y,
    });
  };

  const handleRoomDrag = (e: React.MouseEvent) => {
    if (!draggingRoom) return;
    const dx = (e.clientX - dragStart.x) / zoom;
    const dy = (e.clientY - dragStart.y) / zoom;
    setRooms(rooms.map(r => 
      r.id === draggingRoom 
        ? { ...r, x: snapValue(dragStart.roomX + dx), y: snapValue(dragStart.roomY + dy) }
        : r
    ));
  };

  const handleRoomDragEnd = () => {
    setDraggingRoom(null);
  };

  const getRoomSide = (room: PlannerRoom, clickX: number, clickY: number): { x: number; y: number; side: string } | null => {
    const threshold = 20;
    const relX = clickX - room.x;
    const relY = clickY - room.y;
    
    if (relY < threshold && relX >= 0 && relX <= room.width) {
      return { x: clickX, y: room.y, side: 'top' };
    }
    if (relY > room.height - threshold && relY <= room.height && relX >= 0 && relX <= room.width) {
      return { x: clickX, y: room.y + room.height, side: 'bottom' };
    }
    if (relX < threshold && relY >= 0 && relY <= room.height) {
      return { x: room.x, y: clickY, side: 'left' };
    }
    if (relX > room.width - threshold && relX <= room.width && relY >= 0 && relY <= room.height) {
      return { x: room.x + room.width, y: clickY, side: 'right' };
    }
    return null;
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hallwayMode) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;

      let clickedSide = null;
      let clickedRoom = null;
      
      for (const room of rooms) {
        const side = getRoomSide(room, x, y);
        if (side) {
          clickedSide = side;
          clickedRoom = room;
          break;
        }
      }

      if (!currentHallwayPoint) {
        if (clickedSide && clickedRoom) {
          setCurrentHallwayPoint({ x: clickedSide.x, y: clickedSide.y });
          toast.info("Click another room side or empty space to continue");
        } else {
          toast.error("First click must be on a room side");
        }
      } else {
        const newSegment = {
          from: currentHallwayPoint,
          to: clickedSide ? { x: clickedSide.x, y: clickedSide.y, roomId: clickedRoom?.id } : { x: snapValue(x), y: snapValue(y) }
        };
        
        setHallwaySegments([...hallwaySegments, newSegment]);
        
        if (clickedSide && clickedRoom) {
          toast.success("Hallway segment added - connected to room");
          setCurrentHallwayPoint(null);
        } else {
          setCurrentHallwayPoint({ x: snapValue(x), y: snapValue(y) });
          toast.info("Continue to another room or click Complete");
        }
      }
      return;
    }
    
    if (placingRoomType) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = snapValue((e.clientX - rect.left - pan.x) / zoom);
      const y = snapValue((e.clientY - rect.top - pan.y) / zoom);
      setRooms([...rooms, {
        id: `room-${Date.now()}`,
        name: `${placingRoomType} ${rooms.length + 1}`,
        type: placingRoomType,
        x,
        y,
        width: 120,
        height: 80,
        sections: [],
        doors: [],
        connections: []
      }]);
      setPlacingRoomType(null);
      toast.success("Room placed - double-click to edit");
      return;
    }
    
    setSelectedRoomId(null);
  };

  const completeHallway = () => {
    if (hallwayPoints.length < 2) {
      toast.error("Need at least 2 points to create a hallway");
      return;
    }

    for (let i = 0; i < hallwayPoints.length - 1; i++) {
      const from = hallwayPoints[i];
      const to = hallwayPoints[i + 1];
      
      const isHorizontal = Math.abs(to.x - from.x) > Math.abs(to.y - from.y);
      
      const newRoom: PlannerRoom = {
        id: `hallway-${Date.now()}-${i}`,
        name: `Hallway ${i + 1}`,
        type: "corridor",
        x: Math.min(from.x, to.x),
        y: Math.min(from.y, to.y),
        width: isHorizontal ? Math.abs(to.x - from.x) : hallwaySettings.hallwayWidth,
        height: isHorizontal ? hallwaySettings.hallwayWidth : Math.abs(to.y - from.y),
        sections: [],
        doors: [],
        connections: []
      };
      
      setRooms(prev => [...prev, newRoom]);
    }
    
    setMode("facility");
    setHallwayPoints([]);
    toast.success(`Hallway created with ${hallwayPoints.length - 1} segment(s)`);
  };

  const cancelHallway = () => {
    setHallwayPoints([]);
    setMode("facility");
    toast.info("Hallway creation cancelled");
  };

  const addRoom = (type: string) => {
    setPlacingRoomType(type);
    toast.info("Click on canvas to place room");
  };

  const selectedRoom = selectedRoomId ? rooms.find(r => r.id === selectedRoomId) : null;

  const getRoomCenter = (room: PlannerRoom) => ({
    x: room.x + room.width / 2,
    y: room.y + room.height / 2
  });

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="p-4 border-b flex gap-2 flex-wrap items-center">
        <Select value={placingRoomType || ""} onValueChange={addRoom}>
          <SelectTrigger className="w-[180px] h-8">
            <SelectValue placeholder="Add Room..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="control">Control Room</SelectItem>
            <SelectItem value="research">Research Lab</SelectItem>
            <SelectItem value="containment">Containment Cell</SelectItem>
            <SelectItem value="storage">Storage</SelectItem>
            <SelectItem value="medical">Medical Bay</SelectItem>
            <SelectItem value="engineering">Engineering</SelectItem>
            <SelectItem value="security">Security</SelectItem>
            <SelectItem value="laboratory">Laboratory</SelectItem>
            <SelectItem value="observation">Observation</SelectItem>
            <SelectItem value="decontamination">Decontamination</SelectItem>
            <SelectItem value="custom">Custom Room</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => { setHallwayMode(true); toast.info("Click on a room side to start hallway"); }} size="sm" variant={hallwayMode ? "default" : "outline"}>
          <Route className="w-4 h-4 mr-1" />Hallway Tool
        </Button>
        <div className="h-6 w-px bg-border mx-2" />
        <Button onClick={() => handleZoom(0.1)} size="sm" variant="outline"><ZoomIn className="w-4 h-4" /></Button>
        <Button onClick={() => handleZoom(-0.1)} size="sm" variant="outline"><ZoomOut className="w-4 h-4" /></Button>
        <Button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} size="sm" variant="outline"><Maximize2 className="w-4 h-4" /></Button>
        <span className="text-xs text-muted-foreground">{Math.round(zoom * 100)}%</span>
        <div className="h-6 w-px bg-border mx-2" />
        <div className="flex items-center gap-2">
          <Switch checked={snapToGrid} onCheckedChange={setSnapToGrid} id="snap" />
          <Label htmlFor="snap" className="text-xs cursor-pointer">Snap to Grid</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={showConnections} onCheckedChange={setShowConnections} id="connections" />
          <Label htmlFor="connections" className="text-xs cursor-pointer">Show Connections</Label>
        </div>
        <Button onClick={() => setSettingsOpen(true)} size="sm" variant="outline">
          <SettingsIcon className="w-4 h-4" />
        </Button>
      </div>
      <div 
        ref={canvasRef}
        className="flex-1 relative overflow-hidden" 
        style={{ 
          background: 'repeating-linear-gradient(0deg, transparent, transparent 19px, hsl(var(--border)) 19px, hsl(var(--border)) 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, hsl(var(--border)) 19px, hsl(var(--border)) 20px)',
          cursor: placingRoomType ? 'crosshair' : isPanning ? 'grabbing' : 'grab'
        }} 
        onClick={handleCanvasClick}
        onMouseDown={handlePanStart}
        onMouseMove={(e) => { handlePanMove(e); handleRoomDrag(e); }}
        onMouseUp={() => { handlePanEnd(); handleRoomDragEnd(); }}
        onMouseLeave={() => { handlePanEnd(); handleRoomDragEnd(); }}
      >
        <div style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: '0 0' }}>
          {showConnections && rooms.map(room => 
            room.connections.map(connId => {
              const targetRoom = rooms.find(r => r.id === connId);
              if (!targetRoom || connId < room.id) return null;
              const c1 = getRoomCenter(room);
              const c2 = getRoomCenter(targetRoom);
              return (
                <svg key={`${room.id}-${connId}`} className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                  <line x1={c1.x} y1={c1.y} x2={c2.x} y2={c2.y} stroke="hsl(var(--primary))" strokeWidth="2" strokeDasharray="5,5" opacity="0.5" />
                </svg>
              );
            })
          )}
          {hallwaySegments.map((segment, i) => {
            if (!segment.to) return null;
            return (
              <svg key={`hallway-${i}`} className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                <line 
                  x1={segment.from.x} 
                  y1={segment.from.y} 
                  x2={segment.to.x} 
                  y2={segment.to.y} 
                  stroke="hsl(var(--accent))" 
                  strokeWidth="3" 
                  strokeDasharray="5,5"
                />
              </svg>
            );
          })}
          {currentHallwayPoint && (
            <div className="absolute w-4 h-4 bg-accent rounded-full -translate-x-1/2 -translate-y-1/2" 
                 style={{ left: currentHallwayPoint.x, top: currentHallwayPoint.y }} />
          )}
          {rooms.map(room => (
            <div 
              key={room.id} 
              className={`absolute border-2 cursor-move transition-colors ${
                selectedRoomId === room.id ? 'border-accent' : ''
              }`}
              style={{ 
                left: room.x, 
                top: room.y, 
                width: room.width, 
                height: room.height,
                borderColor: getRoomColor(room.type),
                backgroundColor: selectedRoomId === room.id 
                  ? getRoomBackgroundColor(room.type, 0.3)
                  : selectedRoomForConnect === room.id
                  ? getRoomBackgroundColor(room.type, 0.25)
                  : getRoomBackgroundColor(room.type, 0.15),
              }}
              onClick={(e) => { e.stopPropagation(); handleRoomClick(room, e); }}
              onMouseDown={(e) => { e.stopPropagation(); handleRoomDragStart(room, e); }}
              onContextMenu={(e) => { e.preventDefault(); toggleConnection(room.id); }}
            >
              <div className="p-2 text-xs font-semibold">{room.name}</div>
              {/* Internal walls */}
              {room.internalWalls?.map((wall) => (
                <div
                  key={wall.id}
                  className="absolute bg-white"
                  style={
                    wall.orientation === 'horizontal'
                      ? {
                          left: 0,
                          right: 0,
                          top: `${wall.position}%`,
                          height: '2px',
                        }
                      : {
                          top: 0,
                          bottom: 0,
                          left: `${wall.position}%`,
                          width: '2px',
                        }
                  }
                />
              ))}
              <Button 
                size="sm" 
                variant="ghost" 
                className="absolute top-1 right-1 h-5 w-5 p-0 opacity-0 hover:opacity-100"
                onClick={(e) => { e.stopPropagation(); toggleConnection(room.id); }}
              >
                <Link className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>
      
      {hallwayMode && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background border-2 border-border rounded-lg shadow-lg p-4 z-50">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Route className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-semibold">Hallway Mode</p>
                <p className="text-xs text-muted-foreground">
                  {hallwaySegments.length === 0 && !currentHallwayPoint && "Click a room side to start"}
                  {currentHallwayPoint && "Click to add waypoint or room side to connect"}
                  {hallwaySegments.length > 0 && !currentHallwayPoint && `${hallwaySegments.length} segment(s) created`}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="default" onClick={completeHallway} disabled={hallwaySegments.length === 0}>
                <Check className="w-4 h-4 mr-1" />
                Complete
              </Button>
              <Button size="sm" variant="outline" onClick={() => { 
                setHallwayMode(false); 
                setHallwaySegments([]);
                setCurrentHallwayPoint(null);
              }}>
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <RoomEditor 
        room={editingRoom} 
        open={!!editingRoom} 
        onClose={() => setEditingRoom(null)} 
        onSave={(updated) => setRooms(rooms.map(r => r.id === updated.id ? updated : r))} 
      />

      <RoomProperties
        room={selectedRoom}
        onClose={() => setSelectedRoomId(null)}
        onChange={(updates) => {
          if (selectedRoomId) {
            setRooms(rooms.map(r => r.id === selectedRoomId ? { ...r, ...updates } : r));
          }
        }}
        onEditRoom={() => {
          if (selectedRoom) {
            setEditingRoom(selectedRoom);
            setSelectedRoomId(null);
          }
        }}
      />

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Facility Planner Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Snap to Grid</Label>
              <Switch checked={snapToGrid} onCheckedChange={setSnapToGrid} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Show Connections</Label>
              <Switch checked={showConnections} onCheckedChange={setShowConnections} />
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                <strong>Beta Features:</strong> Custom room shapes, advanced door placement, and multi-section rooms are currently in development.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={betaDialogOpen} onOpenChange={setBetaDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Grid3x3 className="w-5 h-5 text-primary" />
              Facility Planner - Beta Version
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Welcome to the Facility Planner! This feature is currently in beta and some features may be experimental or under development.
            </p>
            <div className="bg-muted/30 rounded-lg p-3 space-y-2">
              <p className="text-sm font-semibold">Available Features:</p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>Room placement and customization</li>
                <li>Custom room shapes with grid editor</li>
                <li>Hallway generation tools</li>
                <li>Camera panning (Right-click or Shift+Drag)</li>
                <li>Zoom controls</li>
              </ul>
            </div>
            <p className="text-xs text-muted-foreground">
              We appreciate your patience as we continue to improve this tool!
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button onClick={handleBetaAcknowledge}>
              Got it!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
