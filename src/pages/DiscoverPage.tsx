import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Search, Microscope, Star, Tag, Building2 } from "lucide-react";
import { usePublicResearchDiscovery } from "@/hooks/useAdvancedSearch";
import { Link } from "react-router-dom";

export default function DiscoverPage() {
  const [tagFilter, setTagFilter] = useState("");
  const [minScore, setMinScore] = useState(0);
  const activeTags = tagFilter ? tagFilter.split(",").map(t => t.trim()).filter(Boolean) : [];

  const { data: research, isLoading } = usePublicResearchDiscovery({
    tags: activeTags.length > 0 ? activeTags : undefined,
    minScore: minScore > 0 ? minScore : undefined,
  });

  return (
    <MainLayout>
      <div className="border-b bg-gradient-to-r from-primary/5 to-transparent">
        <div className="container px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Microscope className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Discover Research</h1>
              <p className="text-sm text-muted-foreground">
                Explore verified research with proven execution scores.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 py-6 max-w-5xl mx-auto">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter by tags (comma separated)..."
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={minScore >= 70 ? "default" : "outline"}
              size="sm"
              onClick={() => setMinScore(minScore >= 70 ? 0 : 70)}
            >
              <Star className="h-3.5 w-3.5 mr-1" />
              High Score (70+)
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Card key={i}><CardContent className="p-4"><Skeleton className="h-24 w-full" /></CardContent></Card>
            ))}
          </div>
        ) : research && research.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {research.map((r) => (
              <Card key={r.id} className="hover:bg-accent/30 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-sm line-clamp-2">{r.project_title}</CardTitle>
                    <Badge variant={r.execution_score >= 70 ? "default" : "secondary"} className="text-xs shrink-0 ml-2">
                      {r.execution_score?.toFixed(0)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {r.institution_name && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Building2 className="h-3 w-3" />
                      {r.institution_name}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="text-[10px]">{r.validation_status}</Badge>
                  </div>
                  {r.searchable_tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {r.searchable_tags.slice(0, 5).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Microscope}
            title="No research found"
            description="No public research matches your current filters."
          />
        )}
      </div>
    </MainLayout>
  );
}
