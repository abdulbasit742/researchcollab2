import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Bookmark, BookmarkCheck, Sparkles, ExternalLink, Users, Calendar, Quote, Lock, Crown, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import type { ResearchPaper } from "@/hooks/useResearchPapers";
import type { UserResearchTier } from "@/hooks/useResearchPapers";

const TYPE_COLORS: Record<string, string> = {
  "Journal Article": "default",
  "Conference Paper": "info",
  "Preprint": "warning",
  "Thesis/Dissertation": "secondary",
  "Technical Report": "outline",
  "Systematic Review": "success",
  "Meta-Analysis": "success",
  "Case Study": "secondary",
  "Working Paper": "warning",
  "Book Chapter": "outline",
  "White Paper": "info",
  "Patent": "default",
};

function CitationBadge({ citations }: { citations: number }) {
  const tier = citations >= 1000 ? "text-amber-500 bg-amber-500/10 border-amber-500/20" :
               citations >= 100 ? "text-primary bg-primary/10 border-primary/20" :
               "text-muted-foreground bg-muted/50 border-border/50";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border ${tier}`}>
      <TrendingUp className="h-2.5 w-2.5" />
      {citations >= 1000 ? `${(citations / 1000).toFixed(0)}K` : citations.toLocaleString()}
    </span>
  );
}

interface PaperCardProps {
  paper: ResearchPaper;
  onSummarize: (paper: ResearchPaper) => void;
  onToggleBookmark: (id: string) => void;
  isLoading?: boolean;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (id: string) => void;
  userTier?: UserResearchTier;
  isLocked?: boolean;
}

export function PaperCard({ paper, onSummarize, onToggleBookmark, isLoading, selectable, selected, onSelect, userTier = "free", isLocked = false }: PaperCardProps) {
  return (
    <Card variant="elevated" className={`group relative transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/20 ${selected ? "ring-2 ring-primary" : ""}`}>
      {/* Lock overlay for restricted papers */}
      {isLocked && (
        <div className="absolute inset-0 z-10 bg-background/60 backdrop-blur-[2px] rounded-lg flex flex-col items-center justify-center gap-3">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <Lock className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">Pro or Elite plan required</p>
          <Button size="sm" className="gap-1.5" asChild>
            <Link to="/pricing">
              <Crown className="h-3.5 w-3.5" />
              Upgrade to Access
            </Link>
          </Button>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            {selectable && (
              <Checkbox
                checked={selected}
                onCheckedChange={() => onSelect?.(paper.id)}
                className="mt-1 shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                <Badge variant={(TYPE_COLORS[paper.type] as any) || "default"} className="text-[10px]">{paper.type}</Badge>
                <Badge variant={paper.access === "Open Access" ? "success" : "outline"} className="text-[10px]">{paper.access}</Badge>
                {paper.access === "Restricted" && (
                  <Badge variant="secondary" className="text-[10px] gap-0.5">
                    <Crown className="h-2.5 w-2.5" />
                    Pro+
                  </Badge>
                )}
                {paper.summarized && (
                  <Badge variant="premium" className="text-[10px] gap-0.5">
                    <Sparkles className="h-2.5 w-2.5" />
                    AI Analyzed
                  </Badge>
                )}
                <CitationBadge citations={paper.citations} />
              </div>
              <CardTitle className="text-sm leading-snug group-hover:text-primary transition-colors">{paper.title}</CardTitle>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 h-8 w-8"
            onClick={() => onToggleBookmark(paper.id)}
          >
            {paper.bookmarked ? (
              <BookmarkCheck className="h-4 w-4 text-primary" />
            ) : (
              <Bookmark className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {paper.authors.slice(0, 3).join(", ")}
            {paper.authors.length > 3 && ` +${paper.authors.length - 3}`}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {paper.year}
          </span>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{paper.abstract}</p>

        <div className="text-[11px] text-muted-foreground/70 font-medium">{paper.journal}</div>

        <div className="flex items-center gap-2 pt-1">
          {isLocked ? (
            <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8" asChild>
              <Link to="/pricing">
                <Crown className="h-3 w-3" />
                Upgrade
              </Link>
            </Button>
          ) : (
            <Button
              size="sm"
              variant="default"
              className="gap-1.5 text-xs h-8 shadow-sm"
              onClick={() => onSummarize(paper)}
              disabled={isLoading}
            >
              <Sparkles className="h-3 w-3" />
              {paper.summarized ? "View Summary" : "AI Summarize"}
            </Button>
          )}
          <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8" asChild>
            <a href={`https://doi.org/${paper.doi}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3 w-3" />
              DOI
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
