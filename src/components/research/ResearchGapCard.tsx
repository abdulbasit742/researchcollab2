import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Lightbulb, AlertTriangle, Link2, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ResearchGap {
  gaps: string[];
  contradictions: string[];
  connections: string[];
  recommendations: string[];
}

interface ResearchGapCardProps {
  onAnalyze: () => Promise<ResearchGap | null>;
  totalPapers: number;
  analyzedCount: number;
}

export function ResearchGapCard({ onAnalyze, totalPapers, analyzedCount }: ResearchGapCardProps) {
  const [result, setResult] = useState<ResearchGap | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    const data = await onAnalyze();
    if (data) setResult(data);
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Search className="h-4 w-4 text-primary" />
          Research Gap Finder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!result && !loading && (
          <>
            <p className="text-xs text-muted-foreground">
              AI analyzes your {totalPapers} papers to find unexplored areas, contradictions, and hidden connections.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={handleAnalyze}
              disabled={analyzedCount < 2}
            >
              <Search className="h-3.5 w-3.5" />
              {analyzedCount < 2 ? "Analyze 2+ papers first" : "Find Research Gaps"}
            </Button>
          </>
        )}

        {loading && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Analyzing paper library...
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        )}

        {result && (
          <div className="space-y-3 text-xs">
            {result.gaps.length > 0 && (
              <div>
                <h5 className="font-semibold flex items-center gap-1 mb-1">
                  <Lightbulb className="h-3 w-3 text-primary" /> Research Gaps
                </h5>
                <ul className="space-y-1 pl-4 list-disc text-muted-foreground">
                  {result.gaps.map((g, i) => <li key={i}>{g}</li>)}
                </ul>
              </div>
            )}
            {result.contradictions.length > 0 && (
              <div>
                <h5 className="font-semibold flex items-center gap-1 mb-1">
                  <AlertTriangle className="h-3 w-3 text-destructive" /> Contradictions
                </h5>
                <ul className="space-y-1 pl-4 list-disc text-muted-foreground">
                  {result.contradictions.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>
            )}
            {result.connections.length > 0 && (
              <div>
                <h5 className="font-semibold flex items-center gap-1 mb-1">
                  <Link2 className="h-3 w-3 text-primary" /> Hidden Connections
                </h5>
                <ul className="space-y-1 pl-4 list-disc text-muted-foreground">
                  {result.connections.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>
            )}
            {result.recommendations.length > 0 && (
              <div>
                <Badge variant="success" className="mb-1 text-[10px]">Recommendations</Badge>
                <ul className="space-y-1 pl-4 list-disc text-muted-foreground">
                  {result.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}
            <Button variant="ghost" size="sm" className="w-full text-xs" onClick={handleAnalyze}>
              Re-analyze
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
