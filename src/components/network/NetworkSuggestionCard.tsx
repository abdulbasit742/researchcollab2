import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X } from "lucide-react";
import { Link } from "react-router-dom";
import { ConnectButton } from "./ConnectButton";
import { MutualConnectionsBadge } from "./MutualConnectionsBadge";
import { useDismissSuggestion } from "@/hooks/useNetwork";

interface NetworkSuggestionCardProps {
  suggestion: {
    id: string;
    reason: string;
    suggested_user: {
      id: string;
      full_name: string | null;
      first_name?: string | null;
      last_name?: string | null;
      avatar_url: string | null;
      role: string | null;
      university: string | null;
      bio: string | null;
    };
  };
}

export function NetworkSuggestionCard({ suggestion }: NetworkSuggestionCardProps) {
  const dismissMutation = useDismissSuggestion();
  const user = suggestion.suggested_user;
  
  const displayName = user.full_name || 
    `${user.first_name || ""} ${user.last_name || ""}`.trim() || 
    "Unknown User";
  
  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case "mutual_connections": return "People you may know";
      case "same_org": return "From your organization";
      case "same_university": return "From your university";
      case "same_skills": return "Similar skills";
      default: return "Suggested for you";
    }
  };
  
  return (
    <Card className="relative overflow-hidden">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-6 w-6 opacity-60 hover:opacity-100"
        onClick={() => dismissMutation.mutate(suggestion.id)}
      >
        <X className="h-4 w-4" />
      </Button>
      
      <CardContent className="p-4">
        <div className="flex flex-col items-center text-center">
          <Link to={`/u/${user.id}`}>
            <Avatar className="h-16 w-16 mb-3">
              <AvatarImage src={user.avatar_url || undefined} alt={displayName} />
              <AvatarFallback className="text-lg">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
          
          <Link to={`/u/${user.id}`} className="hover:underline">
            <h4 className="font-semibold text-sm line-clamp-1">{displayName}</h4>
          </Link>
          
          {user.role && (
            <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
          )}
          
          {user.university && (
            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{user.university}</p>
          )}
          
          <MutualConnectionsBadge userId={user.id} className="mt-2" />
          
          <p className="text-xs text-muted-foreground mt-2 mb-3">
            {getReasonLabel(suggestion.reason)}
          </p>
          
          <ConnectButton userId={user.id} className="w-full" />
        </div>
      </CardContent>
    </Card>
  );
}
