import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { TrendingUp, Zap, Briefcase, User, Building2, FileText, Wrench } from "lucide-react";
import { useTrendingEntities } from "@/hooks/useAdvancedSearch";

const entityIcons: Record<string, typeof TrendingUp> = {
  project: Briefcase,
  profile: User,
  organization: Building2,
  artifact: FileText,
  tool: Wrench,
};

export default function TrendingPage() {
  const { data: trending, isLoading } = useTrendingEntities(30);

  return (
    <MainLayout>
      <div className="border-b bg-gradient-to-r from-primary/5 to-transparent">
        <div className="container px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Trending</h1>
              <p className="text-sm text-muted-foreground">
                Most active projects, profiles, and research on the platform.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 py-6 max-w-4xl mx-auto">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <Card key={i}><CardContent className="p-4"><Skeleton className="h-16 w-full" /></CardContent></Card>
            ))}
          </div>
        ) : trending && trending.length > 0 ? (
          <div className="space-y-3">
            {trending.map((item, idx) => {
              const Icon = entityIcons[item.entity_type] || TrendingUp;
              return (
                <Card key={`${item.entity_type}-${item.entity_id}`} className="hover:bg-accent/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-muted text-muted-foreground font-bold text-sm">
                        #{idx + 1}
                      </div>
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm line-clamp-1">
                          {item.entity_title || "Untitled"}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[10px]">{item.entity_type}</Badge>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-1 text-sm font-semibold text-primary">
                          <TrendingUp className="h-3.5 w-3.5" />
                          {Number(item.engagement_score).toFixed(0)}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Zap className="h-3 w-3" />
                          {Number(item.activity_velocity).toFixed(1)} v/d
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={TrendingUp}
            title="No trending data yet"
            description="Trending signals are computed periodically based on platform activity."
          />
        )}
      </div>
    </MainLayout>
  );
}
