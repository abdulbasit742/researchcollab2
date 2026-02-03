import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Briefcase,
  CheckCircle,
  Clock,
  Award,
  Building2,
  ArrowRight,
  GraduationCap,
} from "lucide-react";
import { formatPKR } from "@/lib/currency";

interface TimelineEvent {
  id: string;
  type: "project_completed" | "project_started" | "institution_joined" | "verification" | "grant_received" | "milestone";
  title: string;
  subtitle?: string;
  date: string;
  value?: number;
  trustImpact?: number;
  linkedEntity?: {
    type: "project" | "institution" | "grant";
    id: string;
    name: string;
  };
}

export function CareerTimeline() {
  // Mock timeline - in production would be aggregated from multiple tables
  const timeline: TimelineEvent[] = [
    {
      id: "1",
      type: "project_completed",
      title: "AI Research Assistant",
      subtitle: "Machine learning model for literature review",
      date: "2024-01-20",
      value: 45000,
      trustImpact: 5,
      linkedEntity: { type: "project", id: "p1", name: "AI Research Assistant" },
    },
    {
      id: "2",
      type: "verification",
      title: "Researcher Verification",
      subtitle: "Identity verified through LUMS",
      date: "2024-01-15",
      trustImpact: 10,
      linkedEntity: { type: "institution", id: "i1", name: "LUMS" },
    },
    {
      id: "3",
      type: "institution_joined",
      title: "Joined LUMS Research Hub",
      subtitle: "Affiliated as Research Associate",
      date: "2024-01-10",
      linkedEntity: { type: "institution", id: "i1", name: "LUMS" },
    },
    {
      id: "4",
      type: "project_started",
      title: "Data Analytics Dashboard",
      subtitle: "Building visualization tools",
      date: "2024-01-05",
      value: 35000,
    },
    {
      id: "5",
      type: "grant_received",
      title: "HEC Research Grant",
      subtitle: "Seed funding for AI research",
      date: "2023-12-20",
      value: 500000,
      linkedEntity: { type: "grant", id: "g1", name: "HEC Research Grant" },
    },
  ];

  const getEventIcon = (type: TimelineEvent["type"]) => {
    switch (type) {
      case "project_completed":
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case "project_started":
        return <Briefcase className="h-4 w-4 text-primary" />;
      case "institution_joined":
        return <Building2 className="h-4 w-4 text-blue-500" />;
      case "verification":
        return <GraduationCap className="h-4 w-4 text-purple-500" />;
      case "grant_received":
        return <Award className="h-4 w-4 text-amber-500" />;
      case "milestone":
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getEventColor = (type: TimelineEvent["type"]) => {
    switch (type) {
      case "project_completed":
        return "border-emerald-500 bg-emerald-500";
      case "project_started":
        return "border-primary bg-primary";
      case "institution_joined":
        return "border-blue-500 bg-blue-500";
      case "verification":
        return "border-purple-500 bg-purple-500";
      case "grant_received":
        return "border-amber-500 bg-amber-500";
      default:
        return "border-muted-foreground bg-muted-foreground";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Career Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border" />

          {/* Events */}
          <div className="space-y-4">
            {timeline.map((event, index) => (
              <div key={event.id} className="relative flex gap-4">
                {/* Dot */}
                <div
                  className={`relative z-10 h-6 w-6 rounded-full border-2 flex items-center justify-center bg-background ${getEventColor(event.type).replace("bg-", "border-")}`}
                >
                  <div className={`h-2 w-2 rounded-full ${getEventColor(event.type).split(" ")[1]}`} />
                </div>

                {/* Content */}
                <div className="flex-1 pb-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        {getEventIcon(event.type)}
                        <h4 className="font-medium text-sm">{event.title}</h4>
                      </div>
                      {event.subtitle && (
                        <p className="text-xs text-muted-foreground mt-0.5">{event.subtitle}</p>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {new Date(event.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      {event.value && (
                        <p className="text-sm font-medium text-emerald-600">
                          {formatPKR(event.value)}
                        </p>
                      )}
                      {event.trustImpact && (
                        <Badge
                          variant={event.trustImpact > 0 ? "secondary" : "destructive"}
                          className="text-[10px]"
                        >
                          {event.trustImpact > 0 ? "+" : ""}{event.trustImpact} trust
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* View Full Profile */}
        <Button asChild variant="ghost" size="sm" className="w-full mt-2 gap-1">
          <Link to="/profile">
            View Full Work History
            <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
