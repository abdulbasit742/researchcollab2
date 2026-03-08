import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Shield, Eye, Award } from "lucide-react";
import { getServiceListings, SERVICE_TYPES } from "@/lib/innovation/reputationMarket";

export default function ReputationMarketplacePage() {
  const [selectedType, setSelectedType] = useState("");
  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["reputation-listings", selectedType],
    queryFn: () => getServiceListings(selectedType || undefined),
  });

  const typeIcon = (t: string) => {
    if (t === "milestone_validator") return <Shield className="h-4 w-4" />;
    if (t === "peer_reviewer") return <Eye className="h-4 w-4" />;
    return <Award className="h-4 w-4" />;
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Star className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Execution Reputation Market</h1>
          <p className="text-sm text-muted-foreground">Professional verification and validation services</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Badge variant={!selectedType ? "default" : "outline"} className="cursor-pointer" onClick={() => setSelectedType("")}>All</Badge>
        {SERVICE_TYPES.map(t => (
          <Badge key={t} variant={selectedType === t ? "default" : "outline"} className="cursor-pointer" onClick={() => setSelectedType(t)}>
            {t.replace(/_/g, " ")}
          </Badge>
        ))}
      </div>

      {isLoading ? <div className="text-center py-12 text-muted-foreground">Loading marketplace…</div> : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((l: any) => (
            <Card key={l.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  {typeIcon(l.service_type)}
                  <CardTitle className="text-base">{l.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Badge variant="secondary">{l.service_type.replace(/_/g, " ")}</Badge>
                {l.description && <p className="text-xs text-muted-foreground line-clamp-2">{l.description}</p>}
                <div className="flex justify-between text-xs">
                  <span>Fee: <strong>{Number(l.fee_amount).toLocaleString()} PKR</strong></span>
                  <span>Min ECS: <strong>{Number(l.min_ecs_required)}</strong></span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Completed: {l.completed_count}</span>
                  <span className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-500" />{Number(l.rating_avg).toFixed(1)}</span>
                </div>
                <Button size="sm" className="w-full mt-2">Request Service</Button>
              </CardContent>
            </Card>
          ))}
          {listings.length === 0 && <div className="col-span-full text-center py-12 text-muted-foreground">No service listings yet.</div>}
        </div>
      )}
    </div>
  );
}
