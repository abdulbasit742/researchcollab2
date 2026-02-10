import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUniversalAI, AIDomain } from "@/hooks/useUniversalAI";
import { Sparkles, RefreshCw, AlertCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface AISuggestionCardProps {
  title: string;
  domain: AIDomain;
  action: string;
  context?: Record<string, any>;
  className?: string;
  compact?: boolean;
}

export function AISuggestionCard({
  title,
  domain,
  action,
  context = {},
  className = "",
  compact = false,
}: AISuggestionCardProps) {
  const { ask, loading, error } = useUniversalAI();
  const [result, setResult] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const fetchInsight = useCallback(async () => {
    setResult(null);
    const data = await ask<{ response?: string; result?: string }>(domain, action, context);
    if (data) {
      setResult(data.response || data.result || JSON.stringify(data));
    }
    setHasLoaded(true);
  }, [ask, domain, action, JSON.stringify(context)]);

  useEffect(() => {
    if (!hasLoaded) {
      fetchInsight();
    }
  }, [hasLoaded]);

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className={compact ? "pb-2 pt-3 px-4" : "pb-2"}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            {title}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => { setHasLoaded(false); }}
            disabled={loading}
          >
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className={compact ? "px-4 pb-3" : ""}>
        {loading && !result ? (
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-3 w-3/5" />
          </div>
        ) : error && !result ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span>Failed to load insight.</span>
            <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => setHasLoaded(false)}>
              Retry
            </Button>
          </div>
        ) : result ? (
          <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed [&_p]:mb-1.5 [&_ul]:mb-1.5 [&_li]:mb-0.5">
            <ReactMarkdown>{result}</ReactMarkdown>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
