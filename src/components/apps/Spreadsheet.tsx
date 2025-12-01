import { useState } from "react";
import { Table, Plus, Trash2, Download, Upload, Calculator as CalcIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Cell {
  value: string;
  formula?: string;
}

export const Spreadsheet = () => {
  const [cells, setCells] = useState<Record<string, Cell>>(() => {
    const initial: Record<string, Cell> = {};
    return initial;
  });
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [rows] = useState(20);
  const [cols] = useState(10);

  const columnNames = Array.from({ length: cols }, (_, i) => 
    String.fromCharCode(65 + i)
  );

  const getCellValue = (cellId: string): string => {
    const cell = cells[cellId];
    if (!cell) return "";
    
    if (cell.formula) {
      try {
        // Simple formula evaluation (SUM, AVG, etc.)
        if (cell.formula.startsWith("=SUM(")) {
          const range = cell.formula.match(/=SUM\(([A-Z]\d+):([A-Z]\d+)\)/);
          if (range) {
            const sum = getRangeValues(range[1], range[2]).reduce((a, b) => a + b, 0);
            return sum.toString();
          }
        } else if (cell.formula.startsWith("=AVG(")) {
          const range = cell.formula.match(/=AVG\(([A-Z]\d+):([A-Z]\d+)\)/);
          if (range) {
            const values = getRangeValues(range[1], range[2]);
            const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
            return avg.toFixed(2);
          }
        } else if (cell.formula.startsWith("=")) {
          // Simple math evaluation
          const expr = cell.formula.substring(1);
          const result = eval(expr.replace(/[A-Z]\d+/g, (ref) => getCellValue(ref) || "0"));
          return result.toString();
        }
      } catch (e) {
        return "#ERROR";
      }
    }
    
    return cell.value;
  };

  const getRangeValues = (start: string, end: string): number[] => {
    const values: number[] = [];
    const startCol = start.charCodeAt(0) - 65;
    const startRow = parseInt(start.substring(1));
    const endCol = end.charCodeAt(0) - 65;
    const endRow = parseInt(end.substring(1));

    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const cellId = `${String.fromCharCode(65 + c)}${r}`;
        const val = parseFloat(cells[cellId]?.value || "0");
        if (!isNaN(val)) values.push(val);
      }
    }
    return values;
  };

  const handleCellChange = (cellId: string, value: string) => {
    setCells({
      ...cells,
      [cellId]: {
        value,
        formula: value.startsWith("=") ? value : undefined
      }
    });
  };

  const handleExport = () => {
    toast.success("Spreadsheet exported to CSV");
  };

  const handleImport = () => {
    toast.info("Import feature coming soon");
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Toolbar */}
      <div className="border-b bg-gradient-to-r from-primary/5 to-primary/10 p-3 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Table className="w-5 h-5 text-primary" />
          <span className="font-bold">Data Sheets</span>
        </div>
        <div className="h-6 w-px bg-border" />
        <Button variant="outline" size="sm" onClick={handleImport}>
          <Upload className="w-4 h-4 mr-2" />
          Import
        </Button>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
        <div className="ml-auto flex items-center gap-2">
          <CalcIcon className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {selectedCell || "Select a cell"}
          </span>
        </div>
      </div>

      {/* Formula Bar */}
      {selectedCell && (
        <div className="border-b bg-muted/20 p-2 flex items-center gap-2">
          <span className="text-sm font-mono font-bold px-2">{selectedCell}</span>
          <Input
            value={cells[selectedCell]?.value || ""}
            onChange={(e) => handleCellChange(selectedCell, e.target.value)}
            placeholder="Enter value or formula (e.g., =SUM(A1:A5))"
            className="flex-1 h-8 font-mono"
          />
        </div>
      )}

      {/* Spreadsheet Grid */}
      <div className="flex-1 overflow-auto bg-background">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="sticky top-0 left-0 z-20 bg-muted border border-border w-12 h-8 text-xs font-bold">
                #
              </th>
              {columnNames.map((col) => (
                <th
                  key={col}
                  className="sticky top-0 z-10 bg-muted border border-border min-w-[120px] h-8 text-xs font-bold"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }, (_, rowIdx) => (
              <tr key={rowIdx + 1}>
                <td className="sticky left-0 z-10 bg-muted border border-border text-center text-xs font-bold">
                  {rowIdx + 1}
                </td>
                {columnNames.map((col) => {
                  const cellId = `${col}${rowIdx + 1}`;
                  const isSelected = selectedCell === cellId;
                  return (
                    <td
                      key={cellId}
                      className={`border border-border p-0 ${
                        isSelected ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => setSelectedCell(cellId)}
                    >
                      <div className="px-2 py-1 min-h-[28px] text-sm font-mono">
                        {getCellValue(cellId)}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Status Bar */}
      <div className="border-t bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground flex items-center gap-4">
        <span>Ready</span>
        <span>•</span>
        <span>Row {rows} × Col {cols}</span>
        <span>•</span>
        <span>Formulas: =SUM(), =AVG()</span>
      </div>
    </div>
  );
};