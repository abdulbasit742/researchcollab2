import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Flame, Download, BookOpen } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import type { ReadingStats } from "@/hooks/useResearchPapers";

interface ReadingStatsCardProps {
  stats: ReadingStats;
  onExport: () => void;
}

export function ReadingStatsCard({ stats, onExport }: ReadingStatsCardProps) {
  const chartData = Object.entries(stats.byField).map(([field, count]) => ({ field, count }));

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <BookOpen className="h-4 w-4 text-primary" />
          Reading Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Streak */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-medium">{stats.streak}-day streak</span>
          </div>
          <span className="text-xs text-muted-foreground">{stats.totalAnalyzed} papers analyzed</span>
        </div>

        {stats.totalAnalyzed === 0 && (
          <p className="text-xs text-muted-foreground italic">Analyze a paper to start your streak!</p>
        )}

        {/* Top field */}
        {stats.topField && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Top field:</span>
            <Badge variant="secondary">{stats.topField}</Badge>
          </div>
        )}

        {/* Field chart */}
        {chartData.length > 0 && (
          <div className="h-28">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 8, top: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="field" width={90} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Export */}
        <Button variant="outline" size="sm" className="w-full gap-2" onClick={onExport}>
          <Download className="h-3.5 w-3.5" />
          Export Citations
        </Button>
      </CardContent>
    </Card>
  );
}
