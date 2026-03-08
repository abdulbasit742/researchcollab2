/**
 * Planetary Research Timeline — Service layer
 */
import { supabase } from "@/integrations/supabase/client";

export async function getTimelineEvents(domain?: string) {
  let q = supabase.from("research_timeline_events").select("*").order("event_year", { ascending: true });
  if (domain) q = q.eq("domain", domain);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

export async function addTimelineEvent(input: {
  domain: string; event_year: number; title: string;
  description?: string; event_type?: string;
  is_prediction?: boolean; confidence?: number; source?: string;
}) {
  const { data, error } = await supabase.from("research_timeline_events").insert(input).select().single();
  if (error) throw error;
  return data;
}

export const TIMELINE_DOMAINS = [
  "Artificial Intelligence", "Quantum Computing", "Biotechnology",
  "Renewable Energy", "Space Technology", "Nanotechnology",
  "Neuroscience", "Climate Science", "Robotics", "Blockchain",
];
