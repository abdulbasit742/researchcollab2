import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, FileText, Eye, Star, CheckCircle2, XCircle, UserPlus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { EarningBid, EarningProject } from "@/hooks/useEarning";

interface TimelineEvent {
  id: string;
  icon: React.ElementType;
  label: string;
  description: string;
  timestamp: string;
  variant: "default" | "success" | "destructive" | "secondary";
}

interface ProjectActivityTimelineProps {
  project: EarningProject;
  bids: EarningBid[];
}

function deriveEvents(project: EarningProject, bids: EarningBid[]): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  // Project posted event
  events.push({
    id: `project-created-${project.id}`,
    icon: FileText,
    label: "Project Posted",
    description: `"${project.title}" was published.`,
    timestamp: project.created_at,
    variant: "default",
  });

  // Bid events
  bids.forEach((bid) => {
    // Bid submitted
    events.push({
      id: `bid-submitted-${bid.id}`,
      icon: UserPlus,
      label: "New Bid",
      description: `${bid.bidder_name || "Someone"} placed a bid for PKR ${bid.amount.toLocaleString()}.`,
      timestamp: bid.created_at,
      variant: "secondary",
    });

    // Status-based events (inferred from current status)
    if (bid.status === "viewed") {
      events.push({
        id: `bid-viewed-${bid.id}`,
        icon: Eye,
        label: "Bid Viewed",
        description: `${bid.bidder_name || "Someone"}'s bid was reviewed.`,
        timestamp: bid.created_at, // approximate
        variant: "secondary",
      });
    }
    if (bid.status === "shortlisted") {
      events.push({
        id: `bid-shortlisted-${bid.id}`,
        icon: Star,
        label: "Bid Shortlisted",
        description: `${bid.bidder_name || "Someone"} was shortlisted.`,
        timestamp: bid.created_at,
        variant: "default",
      });
    }
    if (bid.status === "accepted") {
      events.push({
        id: `bid-accepted-${bid.id}`,
        icon: CheckCircle2,
        label: "Bid Accepted",
        description: `${bid.bidder_name || "Someone"}'s bid was accepted.`,
        timestamp: bid.created_at,
        variant: "success",
      });
    }
    if (bid.status === "rejected") {
      events.push({
        id: `bid-rejected-${bid.id}`,
        icon: XCircle,
        label: "Bid Rejected",
        description: `${bid.bidder_name || "Someone"}'s bid was rejected.`,
        timestamp: bid.created_at,
        variant: "destructive",
      });
    }
  });

  // Sort reverse-chronological
  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

const variantColors: Record<string, string> = {
  default: "bg-primary",
  success: "bg-green-500",
  destructive: "bg-destructive",
  secondary: "bg-muted-foreground",
};

export function ProjectActivityTimeline({ project, bids }: ProjectActivityTimelineProps) {
  const events = deriveEvents(project, bids);

  if (events.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Activity Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-0">
          {events.map((event, i) => {
            const Icon = event.icon;
            return (
              <div key={event.id} className="flex gap-3 pb-4 last:pb-0">
                {/* Vertical line + dot */}
                <div className="flex flex-col items-center">
                  <div className={`rounded-full p-1.5 ${variantColors[event.variant] || "bg-muted"}`}>
                    <Icon className="h-3 w-3 text-white" />
                  </div>
                  {i < events.length - 1 && (
                    <div className="w-px flex-1 bg-border mt-1" />
                  )}
                </div>
                {/* Content */}
                <div className="flex-1 min-w-0 pb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{event.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{event.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
