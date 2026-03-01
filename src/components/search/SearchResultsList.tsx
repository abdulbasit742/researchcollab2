import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RelevanceTooltip } from "./RelevanceTooltip";
import { User, Briefcase, Target, FileText, BookOpen } from "lucide-react";
import type { SearchResult } from "@/hooks/useSmartSearch";

const ENTITY_ICONS: Record<string, React.ElementType> = {
  user: User,
  project: Briefcase,
  milestone: Target,
  artifact: FileText,
  research: BookOpen,
};

const ENTITY_COLORS: Record<string, string> = {
  user: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  project: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  milestone: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  artifact: "bg-purple-500/10 text-purple-600 border-purple-500/30",
  research: "bg-rose-500/10 text-rose-600 border-rose-500/30",
};

interface SearchResultsListProps {
  results: SearchResult[];
  total: number;
  isLoading: boolean;
}

export function SearchResultsList({ results, total, isLoading }: SearchResultsListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
              <div className="h-3 w-1/2 bg-muted animate-pulse rounded mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground text-sm">
          No results found. Try adjusting your search or filters.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">{total} results</p>
      {results.map((r) => {
        const Icon = ENTITY_ICONS[r.entity_type] ?? Briefcase;
        const color = ENTITY_COLORS[r.entity_type] ?? "";
        return (
          <Card key={r.id} className="hover:border-primary/30 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg shrink-0 ${color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-foreground truncate">{r.title}</h3>
                    <Badge variant="outline" className="text-[10px] shrink-0">
                      {r.entity_type}
                    </Badge>
                  </div>
                  {r.content_excerpt && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {r.content_excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <div className="h-1.5 w-12 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${Math.min(100, r.composite_rank_score)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {Math.round(r.composite_rank_score)}
                      </span>
                    </div>
                    <RelevanceTooltip reason={r.relevance_reason} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
