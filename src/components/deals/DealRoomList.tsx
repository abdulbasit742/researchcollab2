import { useDealRooms, DealRoom } from "@/hooks/useDealRoom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import {
  Briefcase,
  Clock,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  MessageCircle,
  Shield,
} from "lucide-react";
import { formatPKR } from "@/lib/currency";

const statusConfig: Record<DealRoom["status"], { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType }> = {
  negotiating: { label: "Negotiating", variant: "secondary", icon: MessageCircle },
  agreed: { label: "Agreed", variant: "default", icon: CheckCircle },
  in_progress: { label: "In Progress", variant: "default", icon: Clock },
  completed: { label: "Completed", variant: "default", icon: CheckCircle },
  cancelled: { label: "Cancelled", variant: "outline", icon: AlertTriangle },
  disputed: { label: "Disputed", variant: "destructive", icon: AlertTriangle },
};

export function DealRoomList() {
  const { data: dealRooms, isLoading } = useDealRooms();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
    );
  }

  if (!dealRooms || dealRooms.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">No Active Deals</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Start a conversation with someone to create a deal room.
          </p>
          <Button asChild>
            <Link to="/opportunities">Find Opportunities</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {dealRooms.map((deal) => {
        const status = statusConfig[deal.status];
        const StatusIcon = status.icon;

        return (
          <Card key={deal.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">{deal.title}</h3>
                    <Badge variant={status.variant} className="gap-1 shrink-0">
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    With: {deal.counterparty_name}
                  </p>

                  <div className="flex flex-wrap gap-4 text-sm">
                    {deal.agreed_amount && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                        <span>{formatPKR(deal.agreed_amount)}</span>
                      </div>
                    )}
                    {deal.escrow_locked > 0 && (
                      <div className="flex items-center gap-1">
                        <Shield className="h-4 w-4 text-amber-500" />
                        <span>Escrow: {formatPKR(deal.escrow_locked)}</span>
                      </div>
                    )}
                    {deal.agreed_deadline && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(deal.agreed_deadline).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {deal.deliverables.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {deal.deliverables.slice(0, 3).map((d, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {d}
                        </Badge>
                      ))}
                      {deal.deliverables.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{deal.deliverables.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                <Button variant="ghost" size="sm" asChild>
                  <Link to={`/messages/${deal.id}`}>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
