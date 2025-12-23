import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Check, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useConnections, ConnectionRequest } from "@/hooks/useOffersConnections";
import { cn } from "@/lib/utils";

interface ConnectionBubbleProps {
  requestId: string;
  isMine: boolean;
}

export function ConnectionBubble({ requestId, isMine }: ConnectionBubbleProps) {
  const { user } = useAuth();
  const { updateConnectionStatus } = useConnections();
  const [request, setRequest] = useState<ConnectionRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchRequest = async () => {
      const { data } = await supabase
        .from("connection_requests")
        .select("*")
        .eq("id", requestId)
        .maybeSingle();

      setRequest(data);
      setIsLoading(false);
    };

    fetchRequest();

    // Realtime subscription
    const channel = supabase
      .channel(`connection-${requestId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "connection_requests",
          filter: `id=eq.${requestId}`,
        },
        (payload) => {
          setRequest(payload.new as ConnectionRequest);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [requestId]);

  const handleAction = async (status: "accepted" | "rejected") => {
    setIsUpdating(true);
    await updateConnectionStatus(requestId, status);
    setIsUpdating(false);
  };

  if (isLoading) {
    return (
      <Card className="max-w-[85%] md:max-w-[70%]">
        <CardContent className="p-4">
          <div className="animate-pulse h-8 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!request) return null;

  const isRecipient = user?.id === request.recipient_id;
  const canRespond = isRecipient && request.status === "pending";

  const statusConfig: Record<string, { color: string; label: string }> = {
    pending: { color: "bg-amber-500/10 text-amber-600", label: "Pending" },
    accepted: { color: "bg-green-500/10 text-green-600", label: "Connected" },
    rejected: { color: "bg-red-500/10 text-red-600", label: "Declined" },
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
      <Card className="border-primary/20 bg-muted/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 flex-wrap">
            <UserPlus className="h-5 w-5 text-primary shrink-0" />
            <span className="font-medium flex-1">Connection Request</span>
            <Badge className={cn("shrink-0", statusConfig[request.status].color)}>
              {statusConfig[request.status].label}
            </Badge>
          </div>

          {canRespond && (
            <div className="flex gap-2 mt-3 flex-col sm:flex-row">
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
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
