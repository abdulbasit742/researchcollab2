import { useDealRooms, DealRoom } from "@/hooks/useDealRoom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyDeals } from "@/components/ui/empty-state";
import { Link } from "react-router-dom";
import {
  Clock,
  DollarSign,
  ArrowRight,
  Shield,
} from "lucide-react";
import { formatPKR } from "@/lib/currency";

export function DealRoomList() {
  const { data: dealRooms, isLoading, error } = useDealRooms();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-sm text-destructive mb-2">Failed to load deals</p>
          <p className="text-xs text-muted-foreground mb-4">{(error as Error).message}</p>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!dealRooms || dealRooms.length === 0) {
    return <EmptyDeals />;
  }

  return (
    <div className="space-y-3">
      {dealRooms.map((deal) => (
        <Link key={deal.id} to={`/deals/${deal.id}`} className="block">
          <Card variant="interactive">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="text-sm font-semibold truncate">{deal.title}</h3>
                    <StatusBadge status={deal.status} />
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-2">
                    With: {deal.counterparty_name}
                  </p>

                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    {deal.agreed_amount != null && deal.agreed_amount > 0 && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3.5 w-3.5" />
                        <span className="font-medium text-foreground">{formatPKR(deal.agreed_amount)}</span>
                      </div>
                    )}
                    {deal.escrow_locked > 0 && (
                      <div className="flex items-center gap-1">
                        <Shield className="h-3.5 w-3.5" />
                        <span>Escrow: {formatPKR(deal.escrow_locked)}</span>
                      </div>
                    )}
                    {deal.agreed_deadline && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{new Date(deal.agreed_deadline).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
