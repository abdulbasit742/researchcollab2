import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Plus, AlertTriangle, Users } from "lucide-react";
import { Link } from "react-router-dom";

interface AICreditsPanelProps {
  monthlyAllowance?: number;
  used?: number;
  bonus?: number;
  departmentPool?: { total: number; used: number } | null;
  history?: { date: string; action: string; credits: number }[];
  compact?: boolean;
}

const SAMPLE_HISTORY = [
  { date: "2026-06-22", action: "AI Roadmap Generation", credits: -85 },
  { date: "2026-06-21", action: "Report Section Draft", credits: -120 },
  { date: "2026-06-20", action: "Viva Question Bank", credits: -60 },
  { date: "2026-06-18", action: "Monthly allowance", credits: 1500 },
  { date: "2026-06-15", action: "Research Gap Finder", credits: -45 },
];

export function AICreditsPanel({
  monthlyAllowance = 1500,
  used = 420,
  bonus = 0,
  departmentPool = null,
  history = SAMPLE_HISTORY,
  compact = false,
}: AICreditsPanelProps) {
  const total = monthlyAllowance + bonus;
  const remaining = Math.max(0, total - used);
  const pct = Math.min(100, Math.round((used / Math.max(total, 1)) * 100));
  const low = remaining < total * 0.15;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Credits
          </CardTitle>
          <Badge variant="outline" className="text-[10px]">DEMO MODE</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-baseline justify-between mb-1">
            <div>
              <span className="text-2xl font-bold">{remaining.toLocaleString()}</span>
              <span className="text-sm text-muted-foreground ml-1">/ {total.toLocaleString()} remaining</span>
            </div>
            <span className="text-xs text-muted-foreground">{used} used</span>
          </div>
          <Progress value={pct} className={`h-2 ${low ? "[&>div]:bg-amber-500" : ""}`} />
        </div>

        {low && (
          <div className="flex items-start gap-2 rounded-md bg-amber-500/10 border border-amber-500/20 p-2.5">
            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
            <div className="text-xs">
              <p className="font-medium text-amber-700 dark:text-amber-400">Running low</p>
              <p className="text-muted-foreground">Buy a top-up pack to keep generating.</p>
            </div>
          </div>
        )}

        {departmentPool && (
          <div className="rounded-md border bg-muted/30 p-3">
            <div className="flex items-center gap-2 mb-2 text-xs font-medium">
              <Users className="h-3.5 w-3.5" /> Department pool
            </div>
            <div className="flex items-baseline justify-between text-xs mb-1">
              <span>{(departmentPool.total - departmentPool.used).toLocaleString()} shared remaining</span>
              <span className="text-muted-foreground">{departmentPool.used.toLocaleString()} / {departmentPool.total.toLocaleString()}</span>
            </div>
            <Progress value={(departmentPool.used / departmentPool.total) * 100} className="h-1.5" />
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "500", price: "PKR 499" },
            { label: "2,000", price: "PKR 1,799" },
            { label: "5,000", price: "PKR 3,999" },
          ].map((p) => (
            <Button key={p.label} variant="outline" size="sm" className="h-auto flex-col py-2" asChild>
              <Link to={`/checkout?credits=${p.label.replace(",", "")}`}>
                <span className="font-bold text-sm">+{p.label}</span>
                <span className="text-[10px] text-muted-foreground">{p.price}</span>
              </Link>
            </Button>
          ))}
        </div>

        {!compact && (
          <div>
            <div className="text-xs font-medium mb-2">Recent activity</div>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {history.map((h, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-1 border-b last:border-0">
                  <div>
                    <div className="text-foreground">{h.action}</div>
                    <div className="text-[10px] text-muted-foreground">{h.date}</div>
                  </div>
                  <span className={`font-mono ${h.credits > 0 ? "text-emerald-600" : "text-muted-foreground"}`}>
                    {h.credits > 0 ? "+" : ""}{h.credits}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button size="sm" variant="ghost" className="w-full" asChild>
          <Link to="/checkout?credits=2000"><Plus className="mr-1 h-3 w-3" /> Buy more credits</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
