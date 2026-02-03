import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useWorkStatus } from "@/hooks/useWorkStatus";
import { Circle, Clock, Coffee, Focus, Moon, Briefcase } from "lucide-react";

export function WorkStatusIndicator({ userId }: { userId?: string }) {
  const { currentStatus, presets, applyPreset, toggleOpportunities, getStatusColor, getStatusLabel, isOwnProfile } = useWorkStatus(userId);

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${getStatusColor(currentStatus.status)}`} />
          Work Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{getStatusLabel(currentStatus.status)}</p>
            {currentStatus.message && <p className="text-sm text-muted-foreground">{currentStatus.message}</p>}
          </div>
          <Badge variant={currentStatus.openToOpportunities ? "default" : "secondary"}>
            {currentStatus.openToOpportunities ? "Open to Work" : "Not Available"}
          </Badge>
        </div>
        {isOwnProfile && (
          <div className="grid grid-cols-2 gap-2">
            {presets.slice(0, 4).map(preset => (
              <Button key={preset.id} variant="outline" size="sm" onClick={() => applyPreset(preset.id)}>
                {preset.name}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
