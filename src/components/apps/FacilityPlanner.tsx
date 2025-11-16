import { useState, useEffect, useRef } from "react";
import { Grid3x3, Trash2, Settings as SettingsIcon, ZoomIn, ZoomOut, Eye, Layers } from "lucide-react";
import { toast } from "sonner";
import { saveState, loadState } from "@/lib/persistence";
import { RoomProperties } from "./RoomProperties";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { getRoomBackgroundColor } from "@/lib/roomColors";

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

interface HallwaySegment {
  id: string;
  points: { x: number; y: number }[];
  width: number;
}

export const FacilityPlanner = () => {
  const [rooms, setRooms] = useState<PlannerRoom[]>(() => loadState('facility_planner_rooms', []));
  const [mode, setMode] = useState<"facility" | "room-editor" | "hallway">("facility");
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [roomEditorGrid, setRoomEditorGrid] = useState<boolean[][]>([]);
  const [hallwaySegments, setHallwaySegments] = useState<HallwaySegment[]>(() => loadState('facility_planner_hallways', []));
  const [currentHallwayPoints, setCurrentHallwayPoints] = useState<{ x: number; y: number }[]>([]);
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
  
  const [hallwayWidth, setHallwayWidth] = useState(40);

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
    saveState('facility_planner_hallways', hallwaySegments);
  }, [hallwaySegments]);

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

  const getCanvasCoordinates = (e: React.MouseEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;
    return { x, y };
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (isPanning || e.button === 2 || e.shiftKey) return;

    const { x, y } = getCanvasCoordinates(e);

    if (mode === "hallway") {
      const snappedX = snapValue(x);
      const snappedY = snapValue(y);
      setCurrentHallwayPoints(prev => [...prev, { x: snappedX, y: snappedY }]);
    } else if (mode === "room-editor") {
      return;
    } else if (placingRoomType) {
      const snappedX = snapValue(x);
      const snappedY = snapValue(y);
      const newRoom: PlannerRoom = {
        id: Date.now().toString(),
        name: `${placingRoomType} ${rooms.length + 1}`,
        type: placingRoomType,
        x: snappedX,
        y: snappedY,
        width: 100,
        height: 100,
        sections: [],
        doors: [],
        connections: [],
      };
      setRooms([...rooms, newRoom]);
      setPlacingRoomType(null);
      toast.success(`${placingRoomType} placed`);
    } else {
      const clickedRoom = rooms.find(room => 
        x >= room.x && x <= room.x + room.width &&
        y >= room.y && y <= room.y + room.height
      );
      if (clickedRoom) {
        setSelectedRoomId(clickedRoom.id);
      } else {
        setSelectedRoomId(null);
      }
    }
  };

  const handleRoomMouseDown = (e: React.MouseEvent, roomId: string) => {
    if (mode !== "facility") return;
    e.stopPropagation();
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;
    const { x, y } = getCanvasCoordinates(e);
    setDraggingRoom(roomId);
    setDragStart({ x, y, roomX: room.x, roomY: room.y });
  };

  const handleRoomMouseMove = (e: React.MouseEvent) => {
    if (!draggingRoom) return;
    const { x, y } = getCanvasCoordinates(e);
    const dx = x - dragStart.x;
    const dy = y - dragStart.y;
    setRooms(rooms.map(room => 
      room.id === draggingRoom 
        ? { ...room, x: snapValue(dragStart.roomX + dx), y: snapValue(dragStart.roomY + dy) }
        : room
    ));
  };

  const handleRoomMouseUp = () => {
    setDraggingRoom(null);
  };

  const deleteRoom = (roomId: string) => {
    setRooms(rooms.filter(r => r.id !== roomId));
    if (selectedRoomId === roomId) setSelectedRoomId(null);
    toast.success("Room deleted");
  };

  const finishHallway = () => {
    if (currentHallwayPoints.length < 2) {
      toast.error("Need at least 2 points for a hallway");
      return;
    }
    const newHallway: HallwaySegment = {
      id: Date.now().toString(),
      points: currentHallwayPoints,
      width: hallwayWidth,
    };
    setHallwaySegments([...hallwaySegments, newHallway]);
    setCurrentHallwayPoints([]);
    setMode("facility");
    toast.success("Hallway created");
  };

  const cancelHallway = () => {
    setCurrentHallwayPoints([]);
    setMode("facility");
  };

  const enterRoomEditor = () => {
    if (!selectedRoomId) {
      toast.error("Select a room first");
      return;
    }
    setEditingRoomId(selectedRoomId);
    const room = rooms.find(r => r.id === selectedRoomId);
    if (room && room.gridShape) {
      const maxRow = Math.max(...room.gridShape.map(g => g.row));
      const maxCol = Math.max(...room.gridShape.map(g => g.col));
      const grid = Array(maxRow + 1).fill(null).map((_, row) =>
        Array(maxCol + 1).fill(null).map((_, col) =>
          room.gridShape!.some(g => g.row === row && g.col === col)
        )
      );
      setRoomEditorGrid(grid);
    } else {
      setRoomEditorGrid(Array(10).fill(null).map(() => Array(10).fill(false)));
    }
    setMode("room-editor");
  };

  const toggleGridCell = (row: number, col: number) => {
    setRoomEditorGrid(prev => {
      const newGrid = prev.map(r => [...r]);
      newGrid[row][col] = !newGrid[row][col];
      return newGrid;
    });
  };

  const saveRoomShape = () => {
    if (!editingRoomId) return;
    const selectedCells: { row: number; col: number }[] = [];
    roomEditorGrid.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell) selectedCells.push({ row: rowIndex, col: colIndex });
      });
    });

    if (selectedCells.length === 0) {
      toast.error("Select at least one grid cell");
      return;
    }

    setRooms(rooms.map(room => 
      room.id === editingRoomId 
        ? { ...room, gridShape: selectedCells }
        : room
    ));
    setMode("facility");
    setEditingRoomId(null);
    toast.success("Room shape saved");
  };

  const cancelRoomEditor = () => {
    setMode("facility");
    setEditingRoomId(null);
  };

  const roomTypes = ["Office", "Lab", "Storage", "Security", "Medical", "Containment"];

  return (
    <div className="h-full flex flex-col bg-background">
      <Dialog open={betaDialogOpen} onOpenChange={setBetaDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Facility Planner - Beta Feature</DialogTitle>
            <DialogDescription>
              This feature is currently in beta. Some functionality may be limited or experimental. 
              Your feedback is appreciated as we continue to improve the experience.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleBetaAcknowledge}>I Understand</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="border-b bg-muted/30 p-2 flex items-center gap-2 flex-wrap">
        <div className="flex gap-1">
          <Button
            size="sm"
            variant={mode === "facility" ? "default" : "outline"}
            onClick={() => setMode("facility")}
          >
            <Eye className="w-4 h-4 mr-1" />
            Facility View
          </Button>
          <Button
            size="sm"
            variant={mode === "room-editor" ? "default" : "outline"}
            onClick={enterRoomEditor}
            disabled={!selectedRoomId}
          >
            <Grid3x3 className="w-4 h-4 mr-1" />
            Room Editor
          </Button>
          <Button
            size="sm"
            variant={mode === "hallway" ? "default" : "outline"}
            onClick={() => {
              if (mode === "hallway") {
                cancelHallway();
              } else {
                setMode("hallway");
                toast.info("Click to draw hallway points");
              }
            }}
          >
            <Layers className="w-4 h-4 mr-1" />
            {mode === "hallway" ? "Cancel Hallway" : "Draw Hallway"}
          </Button>
        </div>

        {mode === "hallway" && (
          <Button size="sm" variant="default" onClick={finishHallway}>
            Finish Hallway
          </Button>
        )}

        {mode === "facility" && (
          <Select value={placingRoomType || ""} onValueChange={setPlacingRoomType}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Add Room..." />
            </SelectTrigger>
            <SelectContent>
              {roomTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <div className="flex gap-1 ml-auto">
          <Button size="sm" variant="outline" onClick={() => handleZoom(0.1)}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleZoom(-0.1)}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => setSettingsOpen(true)}>
            <SettingsIcon className="w-4 h-4" />
          </Button>
        </div>

        {selectedRoomId && mode === "facility" && (
          <Button size="sm" variant="destructive" onClick={() => deleteRoom(selectedRoomId)}>
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </Button>
        )}
      </div>

      <div 
        ref={canvasRef}
        className="flex-1 overflow-hidden relative"
        style={{ cursor: isPanning ? 'grabbing' : (mode === "hallway" ? 'crosshair' : 'default') }}
        onMouseDown={handlePanStart}
        onMouseMove={(e) => {
          handlePanMove(e);
          handleRoomMouseMove(e);
        }}
        onMouseUp={() => {
          handlePanEnd();
          handleRoomMouseUp();
        }}
        onContextMenu={(e) => e.preventDefault()}
        onClick={handleCanvasClick}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            position: 'absolute',
            width: '2000px',
            height: '2000px',
          }}
        >
          <svg width="2000" height="2000" className="absolute top-0 left-0">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.1" />
              </pattern>
            </defs>
            <rect width="2000" height="2000" fill="url(#grid)" />
          </svg>

          {mode === "room-editor" && editingRoomId && (
            <div className="absolute top-10 left-10 bg-background border rounded-lg p-4 shadow-lg z-50">
              <h3 className="font-bold mb-2">Room Editor - Click to select cells</h3>
              <div className="grid gap-1 mb-4">
                {roomEditorGrid.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex gap-1">
                    {row.map((cell, colIndex) => (
                      <button
                        key={`${rowIndex}-${colIndex}`}
                        className={`w-8 h-8 border ${cell ? 'bg-primary' : 'bg-muted'}`}
                        onClick={() => toggleGridCell(rowIndex, colIndex)}
                      />
                    ))}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={saveRoomShape}>Save Shape</Button>
                <Button size="sm" variant="outline" onClick={cancelRoomEditor}>Cancel</Button>
              </div>
            </div>
          )}

          {mode !== "room-editor" && rooms.map(room => (
            <div
              key={room.id}
              className={`absolute border-2 cursor-move ${
                selectedRoomId === room.id ? 'border-primary ring-2 ring-primary/50' : 'border-border'
              }`}
              style={{
                left: room.x,
                top: room.y,
                width: room.width,
                height: room.height,
                backgroundColor: getRoomBackgroundColor(room.type),
              }}
              onMouseDown={(e) => handleRoomMouseDown(e, room.id)}
            >
              <div className="p-2">
                <div className="font-bold text-sm">{room.name}</div>
                <div className="text-xs opacity-70">{room.type}</div>
                {room.gridShape && <div className="text-xs opacity-50">Custom Shape</div>}
              </div>
            </div>
          ))}

          {hallwaySegments.map(hallway => (
            <svg key={hallway.id} className="absolute top-0 left-0 pointer-events-none" style={{ width: '2000px', height: '2000px' }}>
              {hallway.points.map((point, i) => {
                if (i === hallway.points.length - 1) return null;
                const next = hallway.points[i + 1];
                return (
                  <line
                    key={i}
                    x1={point.x}
                    y1={point.y}
                    x2={next.x}
                    y2={next.y}
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth={hallway.width}
                    opacity="0.3"
                  />
                );
              })}
            </svg>
          ))}

          {mode === "hallway" && currentHallwayPoints.length > 0 && (
            <svg className="absolute top-0 left-0 pointer-events-none" style={{ width: '2000px', height: '2000px' }}>
              {currentHallwayPoints.map((point, i) => (
                <circle key={i} cx={point.x} cy={point.y} r="5" fill="hsl(var(--primary))" />
              ))}
              {currentHallwayPoints.map((point, i) => {
                if (i === currentHallwayPoints.length - 1) return null;
                const next = currentHallwayPoints[i + 1];
                return (
                  <line
                    key={i}
                    x1={point.x}
                    y1={point.y}
                    x2={next.x}
                    y2={next.y}
                    stroke="hsl(var(--primary))"
                    strokeWidth={hallwayWidth}
                    opacity="0.5"
                  />
                );
              })}
            </svg>
          )}
        </div>
      </div>

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
            <div className="space-y-2">
              <Label>Hallway Width: {hallwayWidth}px</Label>
              <Slider
                value={[hallwayWidth]}
                onValueChange={([value]) => setHallwayWidth(value)}
                min={20}
                max={100}
                step={10}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {selectedRoomId && mode === "facility" && (
        <div className="absolute bottom-4 right-4 w-64">
          <RoomProperties
            room={rooms.find(r => r.id === selectedRoomId)!}
            onChange={(updates) => {
              setRooms(rooms.map(r => r.id === selectedRoomId ? { ...r, ...updates } : r));
            }}
            onClose={() => setSelectedRoomId(null)}
          />
        </div>
      )}
    </div>
  );
};
