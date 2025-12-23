import { useState, useEffect } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Clock, DollarSign, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useOffers, Offer } from "@/hooks/useOffersConnections";
import { cn } from "@/lib/utils";

interface OfferBubbleProps {
  offerId: string;
  isMine: boolean;
}

const offerTypeLabels: Record<string, string> = {
  tool_subscription: "Tool Subscription",
  fyp_service: "FYP Service",
  research_task: "Research Task",
  tutoring: "Tutoring",
  other: "Other",
};

export function OfferBubble({ offerId, isMine }: OfferBubbleProps) {
  const { user } = useAuth();
  const { updateOfferStatus } = useOffers(undefined);
  const [offer, setOffer] = useState<Offer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchOffer = async () => {
      const { data } = await supabase
        .from("offers")
        .select("*")
        .eq("id", offerId)
        .maybeSingle();

      setOffer(data);
      setIsLoading(false);
    };

    fetchOffer();

    // Realtime subscription
    const channel = supabase
      .channel(`offer-${offerId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "offers",
          filter: `id=eq.${offerId}`,
        },
        (payload) => {
          setOffer(payload.new as Offer);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [offerId]);

  const handleAction = async (status: "accepted" | "rejected" | "cancelled") => {
    setIsUpdating(true);
    await updateOfferStatus(offerId, status);
    setIsUpdating(false);
  };

  if (isLoading) {
    return (
      <Card className="max-w-[85%] md:max-w-[70%]">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!offer) return null;

  const isRecipient = user?.id === offer.recipient_id;
  const isSender = user?.id === offer.sender_id;
  const canRespond = isRecipient && offer.status === "sent";
  const canCancel = isSender && offer.status === "sent";

  const statusColors: Record<string, string> = {
    sent: "bg-amber-500/10 text-amber-600",
    accepted: "bg-green-500/10 text-green-600",
    rejected: "bg-red-500/10 text-red-600",
    cancelled: "bg-muted text-muted-foreground",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "max-w-[85%] md:max-w-[70%]",
        isMine ? "ml-auto" : ""
      )}
    >
      <Card className="border-primary/20">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <Badge variant="secondary" className="mb-1">
                {offerTypeLabels[offer.offer_type] || offer.offer_type}
              </Badge>
              <h4 className="font-semibold">{offer.title}</h4>
            </div>
            <Badge className={cn("shrink-0 capitalize", statusColors[offer.status])}>
              {offer.status}
            </Badge>
          </div>

          {offer.description && (
            <p className="text-sm text-muted-foreground">{offer.description}</p>
          )}

          <div className="flex flex-wrap gap-3 text-sm">
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="font-semibold">
                {offer.currency} {offer.price.toLocaleString()}
              </span>
            </div>
            {offer.delivery_days && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{offer.delivery_days} days</span>
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            {format(new Date(offer.created_at), "MMM d, h:mm a")}
          </p>

          {(canRespond || canCancel) && (
            <div className="flex gap-2 pt-2 flex-col sm:flex-row">
              {canRespond && (
                <>
                  <Button
                    size="sm"
                    onClick={() => handleAction("accepted")}
                    disabled={isUpdating}
                    className="flex-1"
                  >
                    {isUpdating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Accept
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAction("rejected")}
                    disabled={isUpdating}
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Decline
                  </Button>
                </>
              )}
              {canCancel && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAction("cancelled")}
                  disabled={isUpdating}
                  className="flex-1"
                >
                  Cancel Offer
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
