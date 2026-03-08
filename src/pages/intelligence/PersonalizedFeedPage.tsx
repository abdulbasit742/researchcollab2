import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Rss, ExternalLink, Eye } from "lucide-react";
import { getMyFeed, markFeedSeen } from "@/lib/intelligence/agentNetwork";

export default function PersonalizedFeedPage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: feed = [], isLoading } = useQuery({
    queryKey: ["aian-feed", user?.id],
    queryFn: () => getMyFeed(user?.id || ""),
    enabled: !!user?.id,
  });

  const seenMut = useMutation({
    mutationFn: markFeedSeen,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["aian-feed"] }),
  });

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Rss className="h-8 w-8 text-primary" /> Personalized Opportunity Feed
        </h1>
        <p className="text-muted-foreground mt-1">AI-curated opportunities matched to your execution profile</p>
      </div>

      {isLoading ? <p className="text-muted-foreground">Loading feed...</p> : feed.length === 0 ? (
        <Card><CardContent className="py-16 text-center text-muted-foreground">
          <Rss className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>No new opportunities in your feed. Run AI agents from the dashboard to generate recommendations.</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-4">
          {feed.map((item: any) => (
            <Card key={item.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{item.title}</h3>
                      <Badge variant="outline">{item.feed_type}</Badge>
                      <Badge variant="secondary">{item.relevance_score}% match</Badge>
                    </div>
                    {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                    <p className="text-xs text-muted-foreground">Source: {item.source_agent}</p>
                  </div>
                  <div className="flex gap-1">
                    {item.action_url && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={item.action_url}><ExternalLink className="h-4 w-4" /></a>
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => seenMut.mutate(item.id)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
