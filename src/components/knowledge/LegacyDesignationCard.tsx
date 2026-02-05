import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  UserCheck,
  Shield,
  Clock,
  Users,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import type { LegacyDesignation, LegacyStatus, SuccessionEvent } from "@/types/knowledge-civilization";

interface LegacyDesignationCardProps {
  designation: LegacyDesignation;
  onEdit?: () => void;
  onAddSuccessor?: () => void;
}

const statusConfig: Record<LegacyStatus, { label: string; color: string; icon: typeof CheckCircle }> = {
  active: { label: "Active", color: "bg-green-500/20 text-green-700 dark:text-green-300", icon: CheckCircle },
  inactive: { label: "Inactive", color: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300", icon: Clock },
  succession_pending: { label: "Succession Pending", color: "bg-orange-500/20 text-orange-700 dark:text-orange-300", icon: AlertCircle },
  transferred: { label: "Transferred", color: "bg-blue-500/20 text-blue-700 dark:text-blue-300", icon: UserCheck },
  preserved: { label: "Preserved", color: "bg-purple-500/20 text-purple-700 dark:text-purple-300", icon: Shield },
};

export function LegacyDesignationCard({
  designation,
  onEdit,
  onAddSuccessor,
}: LegacyDesignationCardProps) {
  const status = statusConfig[designation.status];
  const StatusIcon = status.icon;

  const daysSinceActivity = Math.floor(
    (new Date().getTime() - new Date(designation.lastActivityAt).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  const daysUntilInactivity = designation.inactivityThresholdDays - daysSinceActivity;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">Legacy Designation</CardTitle>
          <Badge className={status.color} variant="secondary">
            <StatusIcon className="h-3 w-3 mr-1" />
            {status.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium">Preservation Level</p>
            <p className="text-xs text-muted-foreground capitalize">
              {designation.preservationLevel}
            </p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium">Inactivity Threshold</p>
            <p className="text-xs text-muted-foreground">
              {designation.inactivityThresholdDays} days
            </p>
          </div>
        </div>

        {daysUntilInactivity > 0 && daysUntilInactivity < 30 && (
          <div className="flex items-center gap-2 p-2 bg-yellow-500/10 rounded-lg text-yellow-700 dark:text-yellow-300">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">
              {daysUntilInactivity} days until inactivity threshold
            </span>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium flex items-center gap-1">
              <Users className="h-4 w-4" />
              Designated Successors
            </h4>
            {onAddSuccessor && (
              <Button size="sm" variant="ghost" onClick={onAddSuccessor}>
                Add
              </Button>
            )}
          </div>
          {designation.designatedSuccessors.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-2">
              No successors designated
            </p>
          ) : (
            <div className="space-y-2">
              {designation.designatedSuccessors.map((successor, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {successor.priority}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        Successor #{successor.priority}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {successor.scope} scope
                      </p>
                    </div>
                  </div>
                  {successor.acceptedAt ? (
                    <Badge
                      variant="outline"
                      className="text-xs text-green-600 dark:text-green-400"
                    >
                      Accepted
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      Pending
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground border-t pt-3">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Last active {daysSinceActivity} days ago</span>
          </div>
          {designation.automaticTransfer && (
            <Badge variant="outline" className="text-xs">
              Auto-transfer enabled
            </Badge>
          )}
        </div>

        {onEdit && (
          <div className="flex justify-end pt-2">
            <Button size="sm" variant="outline" onClick={onEdit}>
              Edit Preferences
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Succession event display
interface SuccessionEventCardProps {
  event: SuccessionEvent;
}

export function SuccessionEventCard({ event }: SuccessionEventCardProps) {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-blue-500/20 rounded-full">
            <UserCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <p className="font-medium">Succession Executed</p>
            <p className="text-sm text-muted-foreground">
              {event.scope === "full" ? "Full" : "Partial"} transfer completed
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">
              {event.transferredItems.length} items
            </p>
            <p className="text-xs text-muted-foreground">transferred</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
