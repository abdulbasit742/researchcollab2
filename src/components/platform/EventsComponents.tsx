import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  useDiscoverEvents,
  useMyEvents,
  useEventRSVP,
  Event
} from "@/hooks/useEvents";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Video,
  Building2,
  Star,
  CalendarPlus,
  Search,
  Filter,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  Bell
} from "lucide-react";
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { Link } from "react-router-dom";

// =====================================================
// EVENT CARD
// =====================================================
export function EventCard({ 
  event,
  onRSVP,
  compact = false
}: { 
  event: Event;
  onRSVP?: (eventId: string, status: string) => void;
  compact?: boolean;
}) {
  const modeIcons: Record<string, React.ReactNode> = {
    in_person: <MapPin className="h-4 w-4" />,
    virtual: <Video className="h-4 w-4" />,
    hybrid: <Building2 className="h-4 w-4" />,
  };

  const isUpcoming = new Date(event.start_datetime) > new Date();
  const eventDate = new Date(event.start_datetime);

  if (compact) {
    return (
      <div className="flex items-center gap-4 p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
        <div className="text-center min-w-[50px]">
          <p className="text-xs text-muted-foreground">{format(eventDate, "MMM")}</p>
          <p className="text-xl font-bold">{format(eventDate, "d")}</p>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium truncate">{event.title}</h4>
          <p className="text-sm text-muted-foreground">
            {format(eventDate, "h:mm a")}
          </p>
        </div>
        <Badge variant="outline" className="shrink-0">
          {event.event_type}
        </Badge>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      {event.cover_image_url && (
        <div className="aspect-video bg-muted">
          <img 
            src={event.cover_image_url} 
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="text-center bg-primary/10 rounded-lg p-2 min-w-[50px]">
              <p className="text-xs text-muted-foreground">{format(eventDate, "MMM")}</p>
              <p className="text-xl font-bold text-primary">{format(eventDate, "d")}</p>
            </div>
            <div>
              <h3 className="font-semibold line-clamp-2">{event.title}</h3>
              {event.organizer && (
                <p className="text-sm text-muted-foreground">
                  By {event.organizer.full_name}
                </p>
              )}
            </div>
          </div>
          {event.is_featured && (
            <Badge className="gap-1">
              <Star className="h-3 w-3" />
              Featured
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="outline" className="gap-1">
            {modeIcons[event.mode]}
            {event.mode.replace("_", " ")}
          </Badge>
          <Badge variant="secondary">{event.event_type}</Badge>
        </div>

        <div className="space-y-1 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{format(eventDate, "EEEE, MMMM d • h:mm a")}</span>
          </div>
          {event.location_text && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{event.location_text}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>{event.attendee_count} attending</span>
            {event.max_attendees && (
              <span className="text-xs">• {event.max_attendees - event.attendee_count} spots left</span>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {event.my_rsvp ? (
            <Button variant="outline" className="flex-1 gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              {event.my_rsvp.status === "going" ? "Going" : "Interested"}
            </Button>
          ) : (
            <Button 
              className="flex-1"
              onClick={() => onRSVP?.(event.id, "going")}
            >
              RSVP
            </Button>
          )}
          <Button variant="ghost" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// =====================================================
// EVENT DISCOVERY
// =====================================================
export function EventDiscovery() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | undefined>();
  const { data, isLoading, fetchNextPage, hasNextPage } = useDiscoverEvents({ 
    search, 
    type: typeFilter 
  });
  const { mutate: rsvp } = useEventRSVP();

  const events = data?.pages.flatMap(p => p.events) || [];
  const eventTypes = ["Conference", "Workshop", "Webinar", "Meetup", "Seminar"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            variant={!typeFilter ? "default" : "outline"}
            size="sm"
            onClick={() => setTypeFilter(undefined)}
          >
            All Events
          </Button>
          {eventTypes.map((type) => (
            <Button
              key={type}
              variant={typeFilter === type ? "default" : "outline"}
              size="sm"
              onClick={() => setTypeFilter(type)}
            >
              {type}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <Skeleton className="aspect-video" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : events.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No events found</h3>
            <p className="text-muted-foreground">
              {search ? "Try adjusting your search" : "Check back later for upcoming events"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard 
                key={event.id} 
                event={event}
                onRSVP={(id, status) => rsvp({ eventId: id, status })}
              />
            ))}
          </div>
          {hasNextPage && (
            <div className="text-center">
              <Button variant="outline" onClick={() => fetchNextPage()}>
                Load More
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// =====================================================
// EVENT REGISTRATION
// =====================================================
export function EventRegistration({ 
  event,
  onRegister
}: { 
  event: Event;
  onRegister?: () => void;
}) {
  const eventDate = new Date(event.start_datetime);
  const spotsLeft = event.max_attendees 
    ? event.max_attendees - event.attendee_count 
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Register for Event</CardTitle>
        <CardDescription>{event.title}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">{format(eventDate, "EEEE, MMMM d, yyyy")}</p>
              <p className="text-sm text-muted-foreground">
                {format(eventDate, "h:mm a")}
                {event.end_datetime && ` - ${format(new Date(event.end_datetime), "h:mm a")}`}
              </p>
            </div>
          </div>
          
          {event.location_text && (
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <p>{event.location_text}</p>
            </div>
          )}

          {event.meeting_link && (
            <div className="flex items-center gap-3">
              <Video className="h-5 w-5 text-muted-foreground" />
              <a 
                href={event.meeting_link} 
                className="text-primary hover:underline flex items-center gap-1"
                target="_blank"
                rel="noopener noreferrer"
              >
                Virtual Event Link
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </div>

        {spotsLeft !== null && (
          <div className={`p-3 rounded-lg ${
            spotsLeft < 10 ? "bg-destructive/10" : "bg-muted"
          }`}>
            <p className={`text-sm font-medium ${
              spotsLeft < 10 ? "text-destructive" : ""
            }`}>
              {spotsLeft > 0 ? `${spotsLeft} spots remaining` : "Event is full"}
            </p>
          </div>
        )}

        {event.speakers && event.speakers.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Speakers</p>
            <div className="space-y-2">
              {event.speakers.map((speaker) => (
                <div key={speaker.id} className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{speaker.speaker_name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{speaker.speaker_name}</p>
                    {speaker.title_or_affiliation && (
                      <p className="text-xs text-muted-foreground">
                        {speaker.title_or_affiliation}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button 
          className="w-full gap-2" 
          size="lg"
          disabled={spotsLeft !== null && spotsLeft <= 0}
          onClick={onRegister}
        >
          <CalendarPlus className="h-5 w-5" />
          Register Now
        </Button>
      </CardContent>
    </Card>
  );
}

// =====================================================
// MY EVENTS CALENDAR
// =====================================================
export function MyEventsCalendar() {
  const { data, isLoading } = useMyEvents();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const events = [
    ...(data?.attending || []),
    ...(data?.organizing || [])
  ];

  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEventsForDay = (date: Date) => {
    return events.filter(event => 
      isSameDay(new Date(event.start_datetime), date)
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{format(selectedDate, "MMMM yyyy")}</CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1)))}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() + 1)))}
              >
                Next
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const dayEvents = getEventsForDay(day);
              const isToday = isSameDay(day, new Date());
              const isSelected = isSameDay(day, selectedDate);
              
              return (
                <button
                  key={day.toISOString()}
                  className={`p-2 rounded-lg text-center hover:bg-muted transition-colors ${
                    isToday ? "bg-primary/10" : ""
                  } ${isSelected ? "ring-2 ring-primary" : ""}`}
                  onClick={() => setSelectedDate(day)}
                >
                  <p className={`text-sm ${isToday ? "font-bold text-primary" : ""}`}>
                    {format(day, "d")}
                  </p>
                  {dayEvents.length > 0 && (
                    <div className="mt-1 flex justify-center gap-0.5">
                      {dayEvents.slice(0, 3).map((_, i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary" />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Events on {format(selectedDate, "MMM d")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {getEventsForDay(selectedDate).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No events on this day
            </p>
          ) : (
            <div className="space-y-3">
              {getEventsForDay(selectedDate).map((event) => (
                <EventCard key={event.id} event={event} compact />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default EventDiscovery;
