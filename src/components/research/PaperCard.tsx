import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Bookmark, BookmarkCheck, Sparkles, ExternalLink, Users, Calendar, Quote, Lock, Crown } from "lucide-react";
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
    <Card variant="elevated" className={`group relative ${selected ? "ring-2 ring-primary" : ""}`}>
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
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge variant={(TYPE_COLORS[paper.type] as any) || "default"}>{paper.type}</Badge>
                <Badge variant={paper.access === "Open Access" ? "success" : "outline"}>{paper.access}</Badge>
                {paper.access === "Restricted" && (
                  <Badge variant="secondary" className="text-[10px] gap-1">
                    <Crown className="h-2.5 w-2.5" />
                    Pro+
                  </Badge>
                )}
                {paper.summarized && <Badge variant="premium">AI Analyzed</Badge>}
              </div>
              <CardTitle className="text-base leading-snug">{paper.title}</CardTitle>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => onToggleBookmark(paper.id)}
          >
            {paper.bookmarked ? (
              <BookmarkCheck className="h-4 w-4 text-primary" />
            ) : (
              <Bookmark className="h-4 w-4" />
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
          <span className="flex items-center gap-1">
            <Quote className="h-3 w-3" />
            {paper.citations.toLocaleString()} citations
          </span>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-3">{paper.abstract}</p>

        <div className="text-xs text-muted-foreground">{paper.journal}</div>

        <div className="flex items-center gap-2 pt-1">
          {isLocked ? (
            <Button size="sm" variant="outline" className="gap-1.5" asChild>
              <Link to="/pricing">
                <Crown className="h-3.5 w-3.5" />
                Upgrade to Access
              </Link>
            </Button>
          ) : (
            <Button
              size="sm"
              variant="default"
              className="gap-1.5"
              onClick={() => onSummarize(paper)}
              disabled={isLoading}
            >
              <Sparkles className="h-3.5 w-3.5" />
              {paper.summarized ? "View Summary" : "AI Summarize"}
            </Button>
          )}
          <Button size="sm" variant="outline" className="gap-1.5" asChild>
            <a href={`https://doi.org/${paper.doi}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3.5 w-3.5" />
              DOI
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
