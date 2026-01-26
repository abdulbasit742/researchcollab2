import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Offer {
  id: string;
  thread_id: string;
  sender_id: string;
  recipient_id: string;
  offer_type: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  delivery_days: number | null;
  status: string;
  created_at: string;
  // Joined data
  sender_name?: string;
  sender_avatar?: string;
  recipient_name?: string;
  recipient_avatar?: string;
}

export function useOffers() {
  const { user } = useAuth();
  const [sentOffers, setSentOffers] = useState<Offer[]>([]);
  const [receivedOffers, setReceivedOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setSentOffers([]);
      setReceivedOffers([]);
      setLoading(false);
      return;
    }

    fetchOffers();
  }, [user]);

  const fetchOffers = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch sent offers
      const { data: sent, error: sentError } = await supabase
        .from("offers")
        .select("*")
        .eq("sender_id", user.id)
        .order("created_at", { ascending: false });

      if (sentError) throw sentError;

      // Fetch received offers
      const { data: received, error: receivedError } = await supabase
        .from("offers")
        .select("*")
        .eq("recipient_id", user.id)
        .order("created_at", { ascending: false });

      if (receivedError) throw receivedError;

      // Enrich sent offers with recipient names
      const enrichedSent = await Promise.all(
        (sent || []).map(async (offer) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", offer.recipient_id)
            .maybeSingle();

          return {
            ...offer,
            recipient_name: profile?.full_name || "Unknown User",
          };
        })
      );

      // Enrich received offers with sender names
      const enrichedReceived = await Promise.all(
        (received || []).map(async (offer) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", offer.sender_id)
            .maybeSingle();

          return {
            ...offer,
            sender_name: profile?.full_name || "Unknown User",
          };
        })
      );

      setSentOffers(enrichedSent);
      setReceivedOffers(enrichedReceived);
    } catch (err: any) {
      console.error("Error fetching offers:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    sentOffers,
    receivedOffers,
    loading,
    error,
    refetch: fetchOffers,
  };
}

export function useOffer(offerId: string | undefined) {
  const { user } = useAuth();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (offerId) {
      fetchOffer();
    }
  }, [offerId]);

  const fetchOffer = async () => {
    if (!offerId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("offers")
        .select("*")
        .eq("id", offerId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        // Fetch sender and recipient profiles
        const [senderProfile, recipientProfile] = await Promise.all([
          supabase
            .from("profiles")
            .select("full_name")
            .eq("id", data.sender_id)
            .maybeSingle(),
          supabase
            .from("profiles")
            .select("full_name")
            .eq("id", data.recipient_id)
            .maybeSingle(),
        ]);

        setOffer({
          ...data,
          sender_name: senderProfile.data?.full_name || "Unknown",
          recipient_name: recipientProfile.data?.full_name || "Unknown",
        });
      }
    } catch (err) {
      console.error("Error fetching offer:", err);
    } finally {
      setLoading(false);
    }
  };

  return {
    offer,
    loading,
    refetch: fetchOffer,
  };
}
