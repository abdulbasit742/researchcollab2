import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, MoreHorizontal, UserMinus, Shield } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface NetworkConnectionCardProps {
  connection: {
    id: string;
    connected_at: string;
    connection_strength?: number;
    connectedUser: {
      id: string;
      full_name: string | null;
      first_name: string | null;
      last_name: string | null;
      role: string | null;
      university: string | null;
    } | null;
  };
  onMessage?: (userId: string) => void;
  onRemove?: (connectionId: string) => void;
}

export function NetworkConnectionCard({ 
  connection, 
  onMessage,
  onRemove 
}: NetworkConnectionCardProps) {
  const user = connection.connectedUser;
  const name = user?.full_name || 
    `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || 
    "Unknown";

  // Connection strength indicator
  const getStrengthColor = (strength?: number) => {
    if (!strength) return "bg-muted";
    if (strength >= 80) return "bg-emerald-500";
    if (strength >= 50) return "bg-blue-500";
    if (strength >= 30) return "bg-amber-500";
    return "bg-muted";
  };

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Link to={`/u/${user?.id}`} className="relative">
            <Avatar className="h-12 w-12 ring-2 ring-background group-hover:ring-primary/20 transition-all">
              <AvatarFallback className="bg-primary/10 text-primary">
                {name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {connection.connection_strength && (
              <div 
                className={cn(
                  "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background",
                  getStrengthColor(connection.connection_strength)
                )}
                title={`Connection strength: ${connection.connection_strength}%`}
              />
            )}
          </Link>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Link 
                to={`/u/${user?.id}`}
                className="font-medium hover:text-primary transition-colors truncate"
              >
                {name}
              </Link>
              {connection.connection_strength && connection.connection_strength >= 80 && (
                <Badge variant="outline" className="text-[10px] gap-1 text-emerald-600 border-emerald-200">
                  <Shield className="h-2.5 w-2.5" />
                  Strong
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {user?.role || "Professional"}
              {user?.university && ` • ${user.university}`}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Connected {formatDistanceToNow(new Date(connection.connected_at), { addSuffix: true })}
            </p>
          </div>

          <div className="flex items-center gap-1">
            {onMessage && user?.id && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onMessage(user.id)}
                className="h-8 w-8 p-0"
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to={`/u/${user?.id}`}>View Profile</Link>
                </DropdownMenuItem>
                {onRemove && (
                  <DropdownMenuItem 
                    onClick={() => onRemove(connection.id)}
                    className="text-destructive"
                  >
                    <UserMinus className="h-4 w-4 mr-2" />
                    Remove Connection
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
