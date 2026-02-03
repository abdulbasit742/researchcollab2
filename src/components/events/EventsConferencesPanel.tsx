import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Mic, 
  TrendingUp,
  Star,
  Clock
} from "lucide-react";

interface ConferenceMatch {
  conference_id: string;
  name: string;
  location: string;
  dates: { start: string; end: string };
  domain_relevance: number;
  networking_potential: number;
  overall_score: number;
  connections_attending: number;
}

interface SpeakingOpportunity {
  event_id: string;
  event_name: string;
  opportunity_type: 'keynote' | 'panel' | 'workshop' | 'poster' | 'lightning_talk';
  topic_fit: number;
  deadline: string;
  status: 'identified' | 'applied' | 'accepted' | 'rejected' | 'completed';
}

interface EventsConferencesPanelProps {
  conferenceMatches?: ConferenceMatch[];
  speakingOpportunities?: SpeakingOpportunity[];
  eventsAttended?: number;
  talksGiven?: number;
}

export function EventsConferencesPanel({
  conferenceMatches = [],
  speakingOpportunities = [],
  eventsAttended = 0,
  talksGiven = 0
}: EventsConferencesPanelProps) {
  const getStatusColor = (status: SpeakingOpportunity['status']) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'applied': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'completed': return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
    }
  };

  const getTypeIcon = (type: SpeakingOpportunity['opportunity_type']) => {
    switch (type) {
      case 'keynote': return <Star className="h-3 w-3" />;
      case 'panel': return <Users className="h-3 w-3" />;
      case 'workshop': return <Mic className="h-3 w-3" />;
      default: return <Mic className="h-3 w-3" />;
    }
  };

  // Default sample data
  const conferences = conferenceMatches.length > 0 ? conferenceMatches : [
    {
      conference_id: '1',
      name: 'International Data Science Summit',
      location: 'Berlin, Germany',
      dates: { start: '2026-05-15', end: '2026-05-18' },
      domain_relevance: 92,
      networking_potential: 85,
      overall_score: 88,
      connections_attending: 5
    },
    {
      conference_id: '2',
      name: 'AI Research Conference',
      location: 'Singapore',
      dates: { start: '2026-07-20', end: '2026-07-22' },
      domain_relevance: 78,
      networking_potential: 72,
      overall_score: 75,
      connections_attending: 2
    }
  ];

  const speaking = speakingOpportunities.length > 0 ? speakingOpportunities : [
    {
      event_id: '1',
      event_name: 'TechTalks 2026',
      opportunity_type: 'workshop' as const,
      topic_fit: 85,
      deadline: '2026-03-01',
      status: 'applied' as const
    }
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Events & Conferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-muted/30 rounded-lg text-center">
            <div className="text-2xl font-bold">{eventsAttended || 8}</div>
            <p className="text-xs text-muted-foreground">Events Attended</p>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg text-center">
            <div className="text-2xl font-bold">{talksGiven || 3}</div>
            <p className="text-xs text-muted-foreground">Talks Given</p>
          </div>
        </div>

        {/* Recommended Conferences */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Recommended Conferences</h4>
          
          {conferences.slice(0, 2).map((conf) => (
            <div key={conf.conference_id} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-sm">{conf.name}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3" />
                    <span>{conf.location}</span>
                  </div>
                </div>
                <Badge variant="outline" className="shrink-0">
                  {conf.overall_score}% fit
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(conf.dates.start).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {conf.connections_attending} connections attending
                </span>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="text-xs flex-1">
                  Learn More
                </Button>
                <Button size="sm" className="text-xs flex-1">
                  Register
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Speaking Opportunities */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Mic className="h-4 w-4" />
              Speaking Opportunities
            </h4>
          </div>

          {speaking.map((opp) => (
            <div key={opp.event_id} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="flex items-center gap-2">
                  {getTypeIcon(opp.opportunity_type)}
                  <span className="text-sm font-medium">{opp.event_name}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span className="capitalize">{opp.opportunity_type.replace('_', ' ')}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Deadline: {new Date(opp.deadline).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <Badge className={`${getStatusColor(opp.status)} border-0 capitalize`}>
                {opp.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
