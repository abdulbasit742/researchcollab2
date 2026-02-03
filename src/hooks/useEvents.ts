import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// =====================================================
// TYPES
// =====================================================

export interface Event {
  id: string;
  title: string;
  description: string | null;
  event_type: string;
  mode: string;
  start_datetime: string;
  end_datetime: string | null;
  timezone: string;
  location_text: string | null;
  meeting_link: string | null;
  organizer_user_id: string | null;
  organizer_org_id: string | null;
  group_id: string | null;
  visibility: string;
  cover_image_url: string | null;
  max_attendees: number | null;
  registration_url: string | null;
  is_featured: boolean;
  attendee_count: number;
  created_at: string;
  // Joined data
  organizer?: { full_name: string | null };
  my_rsvp?: EventAttendee;
  speakers?: EventSpeaker[];
}

export interface EventAttendee {
  id: string;
  event_id: string;
  user_id: string;
  status: string;
  registered_at: string;
  // Joined data
  profile?: { full_name: string | null };
}

export interface EventSpeaker {
  id: string;
  event_id: string;
  user_id: string | null;
  speaker_name: string;
  title_or_affiliation: string | null;
  bio: string | null;
  speaker_order: number;
}

// =====================================================
// DISCOVER EVENTS
// =====================================================

export function useDiscoverEvents(filters?: { type?: string; search?: string; upcoming?: boolean }) {
  return useInfiniteQuery({
    queryKey: ["discoverEvents", filters],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from("events")
        .select("*, profiles!events_organizer_user_id_fkey(full_name)")
        .eq("visibility", "public")
        .order("start_datetime", { ascending: true })
        .range(pageParam * 20, (pageParam + 1) * 20 - 1);
      
      if (filters?.upcoming !== false) {
        query = query.gte("start_datetime", new Date().toISOString());
      }
      
      if (filters?.type) {
        query = query.eq("event_type", filters.type);
      }
      
      if (filters?.search) {
        query = query.ilike("title", `%${filters.search}%`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      return {
        events: data.map(e => ({
          ...e,
          organizer: e.profiles,
        })) as Event[],
        nextPage: data.length === 20 ? pageParam + 1 : null,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
  });
}

// =====================================================
// MY EVENTS
// =====================================================

export function useMyEvents() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["myEvents", user?.id],
    queryFn: async () => {
      if (!user?.id) return { attending: [], organizing: [] };
      
      // Events I'm attending
      const { data: attending, error: attError } = await supabase
        .from("event_attendees")
        .select(`
          *,
          events(*, profiles!events_organizer_user_id_fkey(full_name, avatar_url))
        `)
        .eq("user_id", user.id)
        .in("status", ["going", "interested"]);
      
      if (attError) throw attError;
      
      // Events I'm organizing
      const { data: organizing, error: orgError } = await supabase
        .from("events")
        .select("*")
        .eq("organizer_user_id", user.id)
        .order("start_datetime", { ascending: true });
      
      if (orgError) throw orgError;
      
      return {
        attending: attending.map(a => ({
          ...a.events,
          my_rsvp: a,
        })) as Event[],
        organizing: organizing as Event[],
      };
    },
    enabled: !!user?.id,
  });
}

// =====================================================
// SINGLE EVENT
// =====================================================

export function useEvent(eventId?: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["event", eventId],
    queryFn: async () => {
      if (!eventId) return null;
      
      const { data, error } = await supabase
        .from("events")
        .select(`
          *,
          profiles!events_organizer_user_id_fkey(full_name),
          event_speakers(*)
        `)
        .eq("id", eventId)
        .single();
      
      if (error) throw error;
      
      // Get user's RSVP if authenticated
      let rsvp = null;
      if (user?.id) {
        const { data: r } = await supabase
          .from("event_attendees")
          .select("*")
          .eq("event_id", eventId)
          .eq("user_id", user.id)
          .maybeSingle();
        rsvp = r;
      }
      
      return {
        ...data,
        organizer: data.profiles,
        speakers: data.event_speakers,
        my_rsvp: rsvp,
      } as Event;
    },
    enabled: !!eventId,
  });
}

// =====================================================
// EVENT ATTENDEES
// =====================================================

export function useEventAttendees(eventId?: string) {
  return useQuery({
    queryKey: ["eventAttendees", eventId],
    queryFn: async () => {
      if (!eventId) return [];
      
      const { data, error } = await supabase
        .from("event_attendees")
        .select("*, profiles(full_name)")
        .eq("event_id", eventId)
        .in("status", ["going", "interested"])
        .order("registered_at", { ascending: true });
      
      if (error) throw error;
      
      return data.map(a => ({
        ...a,
        profile: a.profiles,
      })) as EventAttendee[];
    },
    enabled: !!eventId,
  });
}

// =====================================================
// CREATE EVENT
// =====================================================

export function useCreateEvent() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
      event_type: string;
      mode?: string;
      start_datetime: string;
      end_datetime?: string;
      location_text?: string;
      meeting_link?: string;
      visibility?: string;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { data: event, error } = await supabase
        .from("events")
        .insert({
          ...data,
          organizer_user_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Auto-RSVP as organizer
      await supabase
        .from("event_attendees")
        .insert({
          event_id: event.id,
          user_id: user.id,
          status: "going",
        });
      
      return event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myEvents"] });
      queryClient.invalidateQueries({ queryKey: ["discoverEvents"] });
      toast.success("Event created");
    },
    onError: () => {
      toast.error("Failed to create event");
    },
  });
}

// =====================================================
// RSVP TO EVENT
// =====================================================

export function useEventRSVP() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ eventId, status }: { eventId: string; status: string }) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from("event_attendees")
        .upsert({
          event_id: eventId,
          user_id: user.id,
          status,
        }, { onConflict: "event_id,user_id" });
      
      if (error) throw error;
    },
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      queryClient.invalidateQueries({ queryKey: ["eventAttendees", eventId] });
      queryClient.invalidateQueries({ queryKey: ["myEvents"] });
      toast.success("RSVP updated");
    },
    onError: () => {
      toast.error("Failed to update RSVP");
    },
  });
}

// =====================================================
// CANCEL RSVP
// =====================================================

export function useCancelRSVP() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (eventId: string) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from("event_attendees")
        .delete()
        .eq("event_id", eventId)
        .eq("user_id", user.id);
      
      if (error) throw error;
    },
    onSuccess: (_, eventId) => {
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      queryClient.invalidateQueries({ queryKey: ["myEvents"] });
      toast.success("RSVP cancelled");
    },
  });
}

// =====================================================
// SET EVENT REMINDER
// =====================================================

export function useSetEventReminder() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ eventId, offsetMinutes }: { eventId: string; offsetMinutes: number }) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from("event_reminders")
        .upsert({
          event_id: eventId,
          user_id: user.id,
          reminder_offset_minutes: offsetMinutes,
        }, { onConflict: "event_id,user_id" });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Reminder set");
    },
  });
}

// =====================================================
// CALENDAR VIEW
// =====================================================

export function useCalendarEvents(startDate: Date, endDate: Date) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["calendarEvents", startDate.toISOString(), endDate.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_attendees")
        .select(`
          *,
          events(*)
        `)
        .eq("user_id", user?.id)
        .in("status", ["going", "interested"]);
      
      if (error) throw error;
      
      return data
        .filter(a => {
          const eventDate = new Date(a.events.start_datetime);
          return eventDate >= startDate && eventDate <= endDate;
        })
        .map(a => a.events) as Event[];
    },
    enabled: !!user?.id,
  });
}
