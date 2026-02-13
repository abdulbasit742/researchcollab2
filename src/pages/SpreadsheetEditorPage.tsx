import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSpreadsheets } from "@/hooks/useSpreadsheets";
import { useUniversalAI } from "@/hooks/useUniversalAI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Save, Sparkles, Plus, Download, Upload, Loader2, BarChart3
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";

const COLS = 10;
const ROWS = 20;
const COL_LABELS = "ABCDEFGHIJ".split("");

const SpreadsheetEditorPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentSheet, fetchSpreadsheet, updateSpreadsheet, loading } = useSpreadsheets();
  const { ask, loading: aiLoading } = useUniversalAI();
  const [title, setTitle] = useState("");
  const [grid, setGrid] = useState<string[][]>(
    Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => ""))
  );
  const [activeCell, setActiveCell] = useState<[number, number] | null>(null);
  const [saving, setSaving] = useState(false);
  const [aiResult, setAiResult] = useState("");

  useEffect(() => {
    if (id) fetchSpreadsheet(id);
  }, [id]);

  useEffect(() => {
    if (currentSheet) {
      setTitle(currentSheet.title);
      const sheetData = currentSheet.sheet_data?.sheets?.[0]?.data;
      if (Array.isArray(sheetData) && sheetData.length > 0) {
        // Ensure minimum grid size
        const rows = Math.max(ROWS, sheetData.length);
        const newGrid = Array.from({ length: rows }, (_, r) =>
          Array.from({ length: COLS }, (_, c) => sheetData[r]?.[c] ?? "")
        );
        setGrid(newGrid);
      }
    }
  }, [currentSheet]);

  const handleCellChange = (row: number, col: number, value: string) => {
    setGrid(prev => {
      const next = prev.map(r => [...r]);
      next[row][col] = value;
      return next;
    });
  };

  const handleSave = useCallback(async () => {
    if (!id) return;
    setSaving(true);
    await updateSpreadsheet(id, {
      title,
      sheet_data: { sheets: [{ name: "Sheet1", data: grid }] },
    });
    setSaving(false);
  }, [id, title, grid, updateSpreadsheet]);

  const handleExportCSV = () => {
    const csv = grid.map(row => row.map(c => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title || "sheet"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAI = async (action: string) => {
    const filledData = grid.filter(row => row.some(cell => cell.trim())).slice(0, 50);
    const result = await ask("research", action, { data: filledData });
    if (result?.text) setAiResult(result.text);
    else if (result?.result) setAiResult(result.result);
    else if (typeof result === "string") setAiResult(result);
  };

  if (loading && !currentSheet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Toolbar */}
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="flex items-center gap-2 px-4 py-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/productivity")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Input
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="border-0 text-lg font-semibold bg-transparent focus-visible:ring-0 max-w-md"
            placeholder="Spreadsheet title"
          />
          <div className="flex-1" />
          {activeCell && (
            <Badge variant="secondary" className="text-xs font-mono">
              {COL_LABELS[activeCell[1]]}{activeCell[0] + 1}
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1.5 text-xs">
            <Download className="h-3.5 w-3.5" /> CSV
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs" disabled={aiLoading}>
                {aiLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                AI Analysis
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleAI("summarize_data")}>Summarize Data</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAI("find_patterns")}>Find Patterns</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAI("statistical_analysis")}>Statistical Analysis</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAI("suggest_charts")}>Suggest Charts</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1.5">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto">
        <div className="inline-block min-w-full">
          <table className="border-collapse">
            <thead>
              <tr>
                <th className="sticky top-0 left-0 z-20 bg-muted border border-border w-10 text-xs text-muted-foreground font-normal p-1" />
                {COL_LABELS.map(col => (
                  <th key={col} className="sticky top-0 z-10 bg-muted border border-border min-w-[120px] text-xs text-muted-foreground font-medium p-1.5 text-center">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grid.map((row, ri) => (
                <tr key={ri}>
                  <td className="sticky left-0 z-10 bg-muted border border-border text-xs text-muted-foreground font-normal p-1.5 text-center w-10">
                    {ri + 1}
                  </td>
                  {row.map((cell, ci) => (
                    <td key={ci} className="border border-border p-0">
                      <input
                        className={`w-full h-7 px-1.5 text-xs bg-transparent outline-none ${
                          activeCell?.[0] === ri && activeCell?.[1] === ci ? "ring-2 ring-primary ring-inset" : ""
                        }`}
                        value={cell}
                        onChange={e => handleCellChange(ri, ci, e.target.value)}
                        onFocus={() => setActiveCell([ri, ci])}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Result Footer */}
      {aiResult && (
        <div className="border-t bg-card p-3">
          <div className="flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <p className="text-sm whitespace-pre-wrap flex-1">{aiResult}</p>
            <Button variant="ghost" size="sm" onClick={() => setAiResult("")} className="text-xs shrink-0">Dismiss</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpreadsheetEditorPage;
