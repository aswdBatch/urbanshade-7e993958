import { useState, useEffect, useRef } from "react";
import { Grid3x3, Trash2, Settings as SettingsIcon, ZoomIn, ZoomOut, Eye, Layers, Edit } from "lucide-react";
import { toast } from "sonner";
import { saveState, loadState } from "@/lib/persistence";
import { RoomProperties } from "./RoomProperties";
import { HallwayTool } from "./HallwayTool";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { getRoomBackgroundColor } from "@/lib/roomColors";
import { Card } from "@/components/ui/card";

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

const ROOM_TEMPLATES = {
  small: { width: 80, height: 80 },
  medium: { width: 120, height: 120 },
  large: { width: 180, height: 180 },
  corridor: { width: 200, height: 60 },
};

export const FacilityPlanner = () => {
  const [rooms, setRooms] = useState<PlannerRoom[]>(() => loadState('facility_planner_rooms', []));
  const [mode, setMode] = useState<"facility" | "room-editor" | "hallway">("facility");
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [roomEditorGrid, setRoomEditorGrid] = useState<boolean[][]>([]);
  const [hallwaySegments, setHallwaySegments] = useState<HallwaySegment[]>(() => loadState('facility_planner_hallways', []));
  const [hallwayStartRoom, setHallwayStartRoom] = useState<string | null>(null);
  const [currentHallwayPath, setCurrentHallwayPath] = useState<{ x: number; y: number }[]>([]);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [snapToGrid, setSnapToGrid] = useState(() => loadState('facility_planner_snap', true));
  const [showGrid, setShowGrid] = useState(() => loadState('facility_planner_show_grid', true));
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [placingRoomType, setPlacingRoomType] = useState<string | null>(null);
  const [roomTemplate, setRoomTemplate] = useState<keyof typeof ROOM_TEMPLATES>("medium");
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedHallwayId, setSelectedHallwayId] = useState<string | null>(null);
  const [draggingRoom, setDraggingRoom] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, roomX: 0, roomY: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const [hallwayWidth, setHallwayWidth] = useState(40);
  const [hallwayCounter, setHallwayCounter] = useState(1);
  const [hallwayEditMode, setHallwayEditMode] = useState(false);

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
    saveState('facility_planner_show_grid', showGrid);
  }, [showGrid]);

  const snapValue = (val: number) => snapToGrid ? Math.round(val / 20) * 20 : val;

  const handleZoom = (delta: number) => {
    setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
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
      const clickedRoom = rooms.find(room => 
        x >= room.x && x <= room.x + room.width &&
        y >= room.y && y <= room.y + room.height
      );

      if (!hallwayStartRoom) {
        if (clickedRoom) {
          setHallwayStartRoom(clickedRoom.id);
          const centerX = clickedRoom.x + clickedRoom.width / 2;
          const centerY = clickedRoom.y + clickedRoom.height / 2;
          setCurrentHallwayPath([{ x: snapValue(centerX), y: snapValue(centerY) }]);
          toast.info("Click on another room or empty space to continue");
        }
      } else {
        const snappedX = snapValue(x);
        const snappedY = snapValue(y);
        const lastPoint = currentHallwayPath[currentHallwayPath.length - 1];
        
        const isHorizontal = Math.abs(snappedY - lastPoint.y) < 10;
        const isVertical = Math.abs(snappedX - lastPoint.x) < 10;
        
        if (isHorizontal || isVertical) {
          const newPoint = isHorizontal 
            ? { x: snappedX, y: lastPoint.y }
            : { x: lastPoint.x, y: snappedY };
          
          setCurrentHallwayPath(prev => [...prev, newPoint]);
          
          if (clickedRoom && clickedRoom.id !== hallwayStartRoom) {
            completeHallway(clickedRoom.id);
          }
        } else {
          toast.error("Hallways must be straight (horizontal or vertical)");
        }
      }
    } else if (mode === "room-editor") {
      return;
    } else {
      // Check if clicking on an existing room first
      const clickedRoom = rooms.find(room => 
        x >= room.x && x <= room.x + room.width &&
        y >= room.y && y <= room.y + room.height
      );
      
      if (clickedRoom) {
        setSelectedRoomId(clickedRoom.id);
      } else if (placingRoomType) {
        // Only place new room if clicking on empty space
        const snappedX = snapValue(x);
        const snappedY = snapValue(y);
        const template = ROOM_TEMPLATES[roomTemplate];
        const newRoom: PlannerRoom = {
          id: Date.now().toString(),
          name: `${placingRoomType} ${rooms.length + 1}`,
          type: placingRoomType,
          x: snappedX,
          y: snappedY,
          width: template.width,
          height: template.height,
          sections: [],
          doors: [],
          connections: [],
        };
        setRooms([...rooms, newRoom]);
        toast.success(`${placingRoomType} placed`);
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

  const completeHallway = (endRoomId: string) => {
    if (currentHallwayPath.length < 2) {
      toast.error("Hallway needs at least 2 points");
      return;
    }

    const newHallway: HallwaySegment = {
      id: Date.now().toString(),
      points: currentHallwayPath,
      width: hallwayWidth,
    };

    setHallwaySegments([...hallwaySegments, newHallway]);
    setCurrentHallwayPath([]);
    setHallwayStartRoom(null);
    setMode("facility");
    setHallwayCounter(prev => prev + 1);
    toast.success(`Hallway ${hallwayCounter} created`);
  };

  const cancelHallway = () => {
    setCurrentHallwayPath([]);
    setHallwayStartRoom(null);
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
      toast.error("Select at least one cell");
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

  const roomTypes = ["Office", "Lab", "Storage", "Security", "Medical", "Containment", "Server", "Control"];

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Toolbar */}
      <div className="border-b bg-muted/30 p-3 flex items-center gap-2 flex-wrap">
        <div className="flex gap-1.5">
          <Button
            size="sm"
            variant={mode === "facility" ? "default" : "outline"}
            onClick={() => setMode("facility")}
          >
            <Eye className="w-4 h-4 mr-1.5" />
            Facility
          </Button>
          <Button
            size="sm"
            variant={mode === "room-editor" ? "default" : "outline"}
            onClick={enterRoomEditor}
            disabled={!selectedRoomId}
          >
            <Grid3x3 className="w-4 h-4 mr-1.5" />
            Room Editor
          </Button>
          <Button
            size="sm"
            variant={hallwayEditMode ? "default" : "outline"}
            onClick={() => {
              setHallwayEditMode(!hallwayEditMode);
              if (!hallwayEditMode) {
                setSelectedRoomId(null);
                setMode("facility");
                toast.info("Click hallways to select, right-click to delete, click endpoints to create new hallways");
              } else {
                setSelectedHallwayId(null);
              }
            }}
          >
            <Edit className="w-4 h-4 mr-1" />
            {hallwayEditMode ? "Exit Hallway Edit" : "Edit Hallways"}
          </Button>
          <Button
            size="sm"
            variant={mode === "hallway" ? "default" : "outline"}
            onClick={() => {
              if (mode === "hallway") {
                cancelHallway();
              } else {
                setMode("hallway");
                setHallwayEditMode(false);
                toast.info("Click to draw hallway points");
              }
            }}
          >
            <Layers className="w-4 h-4 mr-1.5" />
            {mode === "hallway" ? "Cancel" : "Hallway"}
          </Button>
        </div>

        {mode === "hallway" && (
          <div className="flex-1 flex justify-center">
            <HallwayTool
              pointCount={currentHallwayPath.length}
              onComplete={() => {
                if (hallwayStartRoom && currentHallwayPath.length >= 2) {
                  const newHallway: HallwaySegment = {
                    id: Date.now().toString(),
                    points: currentHallwayPath,
                    width: hallwayWidth,
                  };
                  setHallwaySegments([...hallwaySegments, newHallway]);
                  setCurrentHallwayPath([]);
                  setHallwayStartRoom(null);
                  setMode("facility");
                  setHallwayCounter(prev => prev + 1);
                  toast.success(`Hallway ${hallwayCounter} created`);
                }
              }}
              onCancel={cancelHallway}
              startRoomName={rooms.find(r => r.id === hallwayStartRoom)?.name}
            />
          </div>
        )}

        {mode === "facility" && (
          <>
            <div className="h-6 w-px bg-border" />
            <Select value={placingRoomType || ""} onValueChange={setPlacingRoomType}>
              <SelectTrigger className="w-[130px] h-8">
                <SelectValue placeholder="Add Room..." />
              </SelectTrigger>
              <SelectContent>
                {roomTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {placingRoomType && (
              <Select value={roomTemplate} onValueChange={(v) => setRoomTemplate(v as keyof typeof ROOM_TEMPLATES)}>
                <SelectTrigger className="w-[110px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                  <SelectItem value="corridor">Corridor</SelectItem>
                </SelectContent>
              </Select>
            )}
          </>
        )}

        <div className="flex gap-1.5 ml-auto">
          <Button size="sm" variant="outline" onClick={() => handleZoom(0.1)} title="Zoom In">
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleZoom(-0.1)} title="Zoom Out">
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} title="Reset View">
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => setSettingsOpen(true)}>
            <SettingsIcon className="w-4 h-4" />
          </Button>
        </div>

        {selectedRoomId && mode === "facility" && (
          <>
            <div className="h-6 w-px bg-border" />
            <Button size="sm" variant="outline" onClick={duplicateRoom}>
              <Copy className="w-4 h-4 mr-1.5" />
              Duplicate
            </Button>
            <Button size="sm" variant="destructive" onClick={() => deleteRoom(selectedRoomId)}>
              <Trash2 className="w-4 h-4 mr-1.5" />
              Delete
            </Button>
          </>
        )}

        {mode === "facility" && (
          <>
            <div className="h-6 w-px bg-border ml-1" />
            <Button size="sm" variant="outline" onClick={clearAll}>
              Clear All
            </Button>
          </>
        )}
      </div>

      <div 
        ref={canvasRef}
        className="flex-1 overflow-hidden relative bg-background"
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
            width: '3000px',
            height: '3000px',
          }}
        >
          {showGrid && (
            <svg width="3000" height="3000" className="absolute top-0 left-0">
              <defs>
                <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="0.3" opacity="0.1" />
                </pattern>
                <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                  <rect width="100" height="100" fill="url(#smallGrid)" />
                  <path d="M 100 0 L 0 0 0 100" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="0.5" opacity="0.2" />
                </pattern>
              </defs>
              <rect width="3000" height="3000" fill="url(#grid)" />
            </svg>
          )}

          {mode === "room-editor" && editingRoomId && (
            <Card className="absolute top-10 left-10 p-4 shadow-xl z-50 bg-background border-2">
              <h3 className="font-bold mb-3 text-lg">Room Shape Editor</h3>
              <p className="text-sm text-muted-foreground mb-3">Click cells to toggle</p>
              <div className="grid gap-1 mb-4">
                {roomEditorGrid.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex gap-1">
                    {row.map((cell, colIndex) => (
                      <button
                        key={`${rowIndex}-${colIndex}`}
                        className={`w-8 h-8 border-2 transition-colors rounded ${
                          cell ? 'bg-primary border-primary' : 'bg-muted border-border hover:bg-muted/70'
                        }`}
                        onClick={() => toggleGridCell(rowIndex, colIndex)}
                      />
                    ))}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={saveRoomShape}>
                  <Save className="w-4 h-4 mr-1.5" />
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={cancelRoomEditor}>
                  Cancel
                </Button>
              </div>
            </Card>
          )}
          {mode !== "room-editor" && rooms.map(room => {
            const renderCustomShape = () => {
              if (!room.gridShape) return null;
              const cellSize = 10;
              return (
                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
                  {room.gridShape.map((cell, idx) => (
                    <rect
                      key={idx}
                      x={cell.col * cellSize}
                      y={cell.row * cellSize}
                      width={cellSize}
                      height={cellSize}
                      fill={getRoomBackgroundColor(room.type)}
                      stroke="hsl(var(--border))"
                      strokeWidth="0.5"
                    />
                  ))}
                </svg>
              );
            };

            return (
              <div key={room.id}>
                <div
                  className={`absolute border-2 cursor-move transition-all duration-200 animate-fade-in hover:scale-105 ${
                    selectedRoomId === room.id ? 'border-primary ring-2 ring-primary/50 scale-105' : 'border-border'
                  }`}
                  style={{
                    left: room.x,
                    top: room.y,
                    width: room.width,
                    height: room.height,
                    backgroundColor: room.gridShape ? 'transparent' : getRoomBackgroundColor(room.type),
                  }}
                  onClick={() => {
                    if (!hallwayEditMode) {
                      setSelectedRoomId(room.id);
                      setSelectedHallwayId(null);
                    }
                  }}
                  onMouseDown={(e) => {
                    if (!hallwayEditMode) {
                      handleRoomMouseDown(e, room.id);
                    }
                  }}
                >
                  {renderCustomShape()}
                  <div className="p-2 relative z-10">
                    <div className="font-bold text-sm">{room.name}</div>
                    <div className="text-xs opacity-70">{room.type}</div>
                    {room.gridShape && <div className="text-xs opacity-50">Custom Shape</div>}
                  </div>
                </div>
              </div>
            );
          })}

          {hallwaySegments.map(hallway => (
            <svg key={hallway.id} className="absolute top-0 left-0" style={{ width: '2000px', height: '2000px', pointerEvents: 'none' }}>
              {hallway.points.map((point, i) => {
                if (i === hallway.points.length - 1) return null;
                const next = hallway.points[i + 1];
                return (
                  <g key={i}>
                    <line
                      x1={point.x}
                      y1={point.y}
                      x2={next.x}
                      y2={next.y}
                      stroke={selectedHallwayId === hallway.id ? "#00ffff" : "hsl(var(--muted-foreground))"}
                      strokeWidth={hallway.width}
                      opacity={selectedHallwayId === hallway.id ? "1" : "0.3"}
                      className="transition-all duration-200"
                      style={{ 
                        pointerEvents: hallwayEditMode ? 'stroke' : 'none',
                        cursor: hallwayEditMode ? 'pointer' : 'default'
                      }}
                      onClick={(e) => {
                        if (hallwayEditMode) {
                          e.stopPropagation();
                          setSelectedHallwayId(hallway.id);
                          setSelectedRoomId(null);
                        }
                      }}
                      onContextMenu={(e) => {
                        if (hallwayEditMode) {
                          e.preventDefault();
                          if (window.confirm('Delete this hallway?')) {
                            setHallwaySegments(prev => prev.filter(h => h.id !== hallway.id));
                            setSelectedHallwayId(null);
                            toast.success("Hallway deleted");
                          }
                        }
                      }}
                    />
                    {hallwayEditMode && (
                      <>
                        <circle
                          cx={point.x}
                          cy={point.y}
                          r="8"
                          fill={selectedHallwayId === hallway.id ? "#00ffff" : "#0078D7"}
                          className="cursor-pointer hover:scale-125 transition-transform"
                          style={{ pointerEvents: 'all' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            const newHallway = {
                              id: `hallway-${Date.now()}`,
                              points: [{ x: point.x, y: point.y }, { x: point.x + 100, y: point.y }],
                              width: hallway.width
                            };
                            setHallwaySegments(prev => [...prev, newHallway]);
                            setSelectedHallwayId(newHallway.id);
                            toast.success("New hallway created from endpoint");
                          }}
                        />
                        {i === hallway.points.length - 2 && (
                          <circle
                            cx={next.x}
                            cy={next.y}
                            r="8"
                            fill={selectedHallwayId === hallway.id ? "#00ffff" : "#0078D7"}
                            className="cursor-pointer hover:scale-125 transition-transform"
                            style={{ pointerEvents: 'all' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              const newHallway = {
                                id: `hallway-${Date.now()}`,
                                points: [{ x: next.x, y: next.y }, { x: next.x + 100, y: next.y }],
                                width: hallway.width
                              };
                              setHallwaySegments(prev => [...prev, newHallway]);
                              setSelectedHallwayId(newHallway.id);
                              toast.success("New hallway created from endpoint");
                            }}
                          />
                        )}
                      </>
                    )}
                  </g>
                );
              })}
            </svg>
          ))}

          {mode === "hallway" && currentHallwayPath.length > 0 && (
            <svg className="absolute top-0 left-0 pointer-events-none" style={{ width: '2000px', height: '2000px' }}>
              {currentHallwayPath.map((point, i) => (
                <circle key={i} cx={point.x} cy={point.y} r="6" fill="hsl(var(--primary))" className="animate-pulse" />
              ))}
              {currentHallwayPath.map((point, i) => {
                if (i === currentHallwayPath.length - 1) return null;
                const next = currentHallwayPath[i + 1];
                return (
                  <line
                    key={i}
                    x1={point.x}
                    y1={point.y}
                    x2={next.x}
                    y2={next.y}
                    stroke="hsl(var(--primary))"
                    strokeWidth={hallwayWidth}
                    opacity="0.6"
                    className="animate-fade-in"
                  />
                );
              })}
            </svg>
          )}
        </div>

        <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur px-3 py-1.5 rounded-lg border text-sm font-mono">
          {Math.round(zoom * 100)}%
        </div>
      </div>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Planner Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Snap to Grid</Label>
              <Switch checked={snapToGrid} onCheckedChange={setSnapToGrid} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Show Grid</Label>
              <Switch checked={showGrid} onCheckedChange={setShowGrid} />
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
            <div className="pt-2 border-t text-sm text-muted-foreground space-y-1">
              <div><strong>Pan:</strong> Right-click drag or Shift+drag</div>
              <div><strong>Zoom:</strong> Use zoom buttons</div>
              <div><strong>Select:</strong> Click on rooms</div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {selectedRoomId && mode === "facility" && (
        <div className="absolute bottom-4 right-4 w-72">
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
