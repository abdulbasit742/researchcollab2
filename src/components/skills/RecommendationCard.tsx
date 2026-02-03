import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Quote, Check, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import type { Recommendation } from "@/hooks/useRecommendations";

interface RecommendationCardProps {
  recommendation: Recommendation;
  showActions?: boolean;
  onApprove?: () => void;
  onHide?: () => void;
}

export function RecommendationCard({ 
  recommendation, 
  showActions,
  onApprove,
  onHide,
}: RecommendationCardProps) {
  const recommender = recommendation.recommender;
  
  const displayName = recommender?.full_name || "Unknown User";
  
  const getContextLabel = (type: string) => {
    switch (type) {
      case "project": return "Project Collaboration";
      case "organization": return "Organization";
      case "supervision": return "Supervision";
      case "collaboration": return "Collaboration";
      default: return "General";
    }
  };
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Quote className="h-6 w-6 text-primary/40 flex-shrink-0 mt-1" />
          
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground italic leading-relaxed">
              "{recommendation.content}"
            </p>
            
            <div className="flex items-center gap-3 mt-4">
              <Link to={`/u/${recommender?.id}`}>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={recommender?.avatar_url || undefined} alt={displayName} />
                  <AvatarFallback>{displayName.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Link>
              
              <div className="flex-1 min-w-0">
                <Link to={`/u/${recommender?.id}`} className="font-medium text-sm hover:underline">
                  {displayName}
                </Link>
                <div className="flex items-center gap-2 flex-wrap">
                  {recommender?.role && (
                    <span className="text-xs text-muted-foreground capitalize">
                      {recommender.role}
                    </span>
                  )}
                  {recommender?.university && (
                    <span className="text-xs text-muted-foreground">
                      • {recommender.university}
                    </span>
                  )}
                </div>
              </div>
              
              <Badge variant="outline" className="text-xs">
                {getContextLabel(recommendation.context_type)}
              </Badge>
            </div>
            
            <p className="text-xs text-muted-foreground mt-2">
              {formatDistanceToNow(new Date(recommendation.created_at), { addSuffix: true })}
            </p>
            
            {showActions && (
              <div className="flex gap-2 mt-3">
                <Button size="sm" onClick={onApprove}>
                  <Check className="h-4 w-4 mr-1" />
                  Approve
                </Button>
                <Button size="sm" variant="outline" onClick={onHide}>
                  <EyeOff className="h-4 w-4 mr-1" />
                  Hide
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
