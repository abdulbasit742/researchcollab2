import { useSponsorMatches } from "@/hooks/useIntelligence";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Star } from "lucide-react";

interface Props {
  sponsorId: string;
}

export function SponsorMatchList({ sponsorId }: Props) {
  const { data: scores } = useSponsorMatches(sponsorId);
  const score = scores?.[0];

  if (!score || !score.scores.top_matches?.length) return null;

  const matches = score.scores.top_matches as { topic_id: string; title: string; match_score: number }[];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          AI-Recommended FYPs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {matches.map((m, i) => (
          <div key={m.topic_id} className="flex items-center justify-between p-2 rounded-md bg-muted/50 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground font-mono">#{i + 1}</span>
              <span className="font-medium truncate max-w-[200px]">{m.title}</span>
            </div>
            <Badge variant={m.match_score >= 70 ? "default" : "secondary"} className="text-[10px]">
              <Star className="h-3 w-3 mr-0.5" />
              {m.match_score}%
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
