import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Globe, 
  MapPin, 
  Clock, 
  Users, 
  AlertTriangle,
  CheckCircle2,
  Calendar
} from "lucide-react";

interface VisaStatus {
  visa_type: string;
  country: string;
  status: 'active' | 'pending' | 'expired' | 'renewal_needed';
  expiry_date: string;
  days_until_expiry: number;
}

interface TimezoneOverlap {
  participants: { user_id: string; timezone: string }[];
  overlap_windows: { start: string; end: string; duration_hours: number }[];
  best_meeting_times: string[];
  async_communication_recommended: boolean;
}

interface GlobalMobilityPanelProps {
  visaStatuses?: VisaStatus[];
  timezoneOverlap?: TimezoneOverlap;
  internationalConnections?: number;
  countriesActive?: string[];
}

export function GlobalMobilityPanel({
  visaStatuses = [],
  timezoneOverlap,
  internationalConnections = 0,
  countriesActive = []
}: GlobalMobilityPanelProps) {
  const getStatusColor = (status: VisaStatus['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'pending': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'renewal_needed': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'expired': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getUrgencyLevel = (days: number) => {
    if (days < 0) return { color: 'text-red-600', label: 'Expired' };
    if (days < 30) return { color: 'text-red-600', label: 'Urgent' };
    if (days < 90) return { color: 'text-amber-600', label: 'Soon' };
    return { color: 'text-green-600', label: 'Valid' };
  };

  // Default sample data
  const displayVisas = visaStatuses.length > 0 ? visaStatuses : [
    {
      visa_type: 'H-1B Work Visa',
      country: 'United States',
      status: 'active' as const,
      expiry_date: '2027-08-15',
      days_until_expiry: 560
    }
  ];

  const displayCountries = countriesActive.length > 0 ? countriesActive : ['United States', 'United Kingdom', 'Germany', 'Singapore'];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Global Mobility
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Global Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-muted/30 rounded-lg text-center">
            <div className="text-2xl font-bold">{displayCountries.length}</div>
            <p className="text-xs text-muted-foreground">Countries Active</p>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg text-center">
            <div className="text-2xl font-bold">{internationalConnections || 23}</div>
            <p className="text-xs text-muted-foreground">Int'l Connections</p>
          </div>
        </div>

        {/* Visa Status */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Work Authorization
          </h4>
          
          {displayVisas.map((visa, idx) => {
            const urgency = getUrgencyLevel(visa.days_until_expiry);
            return (
              <div key={idx} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm">{visa.visa_type}</p>
                    <p className="text-xs text-muted-foreground">{visa.country}</p>
                  </div>
                  <Badge className={`${getStatusColor(visa.status)} border-0 capitalize`}>
                    {visa.status.replace('_', ' ')}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Expires:</span>
                    <span>{new Date(visa.expiry_date).toLocaleDateString()}</span>
                  </div>
                  <span className={urgency.color}>
                    {visa.days_until_expiry > 0 ? `${visa.days_until_expiry} days` : urgency.label}
                  </span>
                </div>

                {visa.days_until_expiry < 90 && visa.days_until_expiry > 0 && (
                  <div className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded text-sm">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <span className="text-amber-800 dark:text-amber-400">
                      Renewal recommended soon
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Timezone Collaboration */}
        {timezoneOverlap && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Timezone Collaboration
            </h4>
            
            <div className="border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Overlap Available</span>
                <div className="flex items-center gap-1">
                  {timezoneOverlap.overlap_windows.length > 0 ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>{timezoneOverlap.overlap_windows[0]?.duration_hours || 0}h overlap</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <span>Limited overlap</span>
                    </>
                  )}
                </div>
              </div>

              {timezoneOverlap.best_meeting_times.length > 0 && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Best times: </span>
                  <span>{timezoneOverlap.best_meeting_times.join(', ')}</span>
                </div>
              )}

              {timezoneOverlap.async_communication_recommended && (
                <Badge variant="outline" className="text-xs">
                  Async communication recommended
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Active Countries */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Active Regions</h4>
          <div className="flex flex-wrap gap-2">
            {displayCountries.map((country) => (
              <Badge key={country} variant="outline" className="text-xs">
                {country}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
