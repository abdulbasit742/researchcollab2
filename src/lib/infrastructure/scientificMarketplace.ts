/**
 * Scientific Infrastructure Marketplace (SIM) — Service layer.
 * Additive system for sharing lab equipment, compute, and facilities across institutions.
 */
import { supabase } from "@/integrations/supabase/client";

// ─── Listings ───
export async function getListings(filters?: { category?: string; status?: string; location?: string }) {
  let q = (supabase as any).from("sim_listings").select("*").order("created_at", { ascending: false }).limit(50);
  if (filters?.category) q = q.eq("category", filters.category);
  if (filters?.status) q = q.eq("availability_status", filters.status);
  if (filters?.location) q = q.ilike("location_country", `%${filters.location}%`);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function createListing(listing: Record<string, any>) {
  const { data, error } = await (supabase as any).from("sim_listings").insert([listing]).select().single();
  if (error) throw error;
  return data;
}

export async function updateListing(id: string, updates: Record<string, any>) {
  const { error } = await (supabase as any).from("sim_listings").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}

// ─── Bookings ───
export async function getBookings(userId: string) {
  const { data, error } = await (supabase as any).from("sim_bookings").select("*, sim_listings(title, category, resource_type, location_city)").eq("booker_id", userId).order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createBooking(booking: Record<string, any>) {
  const platformFee = (booking.total_cost || 0) * 0.15; // 15% platform fee
  const { data, error } = await (supabase as any).from("sim_bookings").insert([{ ...booking, platform_fee: platformFee }]).select().single();
  if (error) throw error;
  return data;
}

export async function updateBookingStatus(id: string, status: string, reason?: string) {
  const updates: Record<string, any> = { status, updated_at: new Date().toISOString() };
  if (reason) updates.cancellation_reason = reason;
  const { error } = await (supabase as any).from("sim_bookings").update(updates).eq("id", id);
  if (error) throw error;
}

// ─── Reviews ───
export async function getReviews(listingId: string) {
  const { data, error } = await (supabase as any).from("sim_reviews").select("*").eq("listing_id", listingId).order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function submitReview(review: Record<string, any>) {
  const { data, error } = await (supabase as any).from("sim_reviews").insert([review]).select().single();
  if (error) throw error;
  return data;
}

// ─── AI Advisory ───
export async function invokeSimAdvisor(action: string, payload: Record<string, any>) {
  const { data, error } = await supabase.functions.invoke("sim-advisor", { body: { action, payload } });
  if (error) throw error;
  return data?.result ?? data;
}

// ─── Analytics ───
export function computeMarketplaceAnalytics(listings: any[]) {
  const totalListings = listings.length;
  const totalCapacity = listings.reduce((s: number, l: any) => s + (l.capacity_units || 0), 0);
  const avgDailyRate = listings.length > 0 ? Math.round(listings.reduce((s: number, l: any) => s + (l.daily_rate || 0), 0) / listings.length) : 0;
  const byCategory = listings.reduce((acc: Record<string, number>, l: any) => { acc[l.category] = (acc[l.category] || 0) + 1; return acc; }, {});
  const byCountry = listings.reduce((acc: Record<string, number>, l: any) => { const c = l.location_country || "Unknown"; acc[c] = (acc[c] || 0) + 1; return acc; }, {});
  const totalRevenue = listings.reduce((s: number, l: any) => s + (l.total_revenue || 0), 0);
  const totalBookings = listings.reduce((s: number, l: any) => s + (l.total_bookings || 0), 0);

  return { totalListings, totalCapacity, avgDailyRate, byCategory, byCountry, totalRevenue, totalBookings };
}

// ─── Constants ───
export const SIM_CATEGORIES = [
  "Lab Equipment", "Compute Resources", "Research Facilities", "Specialized Instruments",
  "Clean Rooms", "Fabrication Labs", "Imaging Systems", "Testing Chambers",
];

export const RESOURCE_TYPES = [
  "lab_equipment", "compute_cluster", "wet_lab", "dry_lab", "clean_room",
  "microscope", "spectrometer", "sequencer", "3d_printer", "cnc_machine",
];

export const AVAILABILITY_STATUSES = ["available", "partially_booked", "fully_booked", "maintenance", "offline"];
