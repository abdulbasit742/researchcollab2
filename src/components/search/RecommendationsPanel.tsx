import { useDiscoveryRecommendations } from "@/hooks/useDiscoveryRecommendations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Briefcase, Target, FileText, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const ENTITY_ICONS: Record<string, React.ElementType> = {
  project: Briefcase,
  milestone: Target,
  artifact: FileText,
  user: User,
};

export function RecommendationsPanel() {
  const { data: recommendations = [], isLoading } = useDiscoveryRecommendations();

  if (isLoading || recommendations.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Recommended for You
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {recommendations.slice(0, 5).map((rec) => {
          const Icon = ENTITY_ICONS[rec.entity_type] ?? Briefcase;
          return (
            <div
              key={rec.id}
              className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <Badge variant="outline" className="text-[10px]">{rec.entity_type}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{rec.reason}</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
