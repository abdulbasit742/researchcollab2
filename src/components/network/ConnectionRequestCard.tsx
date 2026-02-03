import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Check, X, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAcceptConnectionRequest, useDeclineConnectionRequest } from "@/hooks/useNetwork";

interface ConnectionRequestCardProps {
  request: {
    id: string;
    created_at: string;
    requester?: {
      id?: string;
      full_name?: string | null;
      first_name?: string | null;
      last_name?: string | null;
      role?: string | null;
      university?: string | null;
    } | null;
  };
}

export function ConnectionRequestCard({ request }: ConnectionRequestCardProps) {
  const acceptMutation = useAcceptConnectionRequest();
  const declineMutation = useDeclineConnectionRequest();
  
  const isLoading = acceptMutation.isPending || declineMutation.isPending;
  const requester = request.requester;
  const name = requester?.full_name || 
    `${requester?.first_name || ""} ${requester?.last_name || ""}`.trim() || 
    "Unknown";

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Link to={`/u/${requester?.id || ""}`}>
            <Avatar className="h-12 w-12 ring-2 ring-background group-hover:ring-primary/20 transition-all">
              <AvatarFallback className="bg-primary/10 text-primary">
                {name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </Link>
          
          <div className="flex-1 min-w-0">
            <Link 
              to={`/u/${requester?.id || ""}`}
              className="font-medium hover:text-primary transition-colors"
            >
              {name}
            </Link>
            <p className="text-sm text-muted-foreground truncate">
              {requester?.role || "Professional"} 
              {requester?.university && ` at ${requester.university}`}
            </p>
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={isLoading}
              onClick={() => declineMutation.mutate(request.id)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              disabled={isLoading}
              onClick={() => acceptMutation.mutate(request.id)}
              className="h-8"
            >
              <Check className="h-4 w-4 mr-1" />
              Accept
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
