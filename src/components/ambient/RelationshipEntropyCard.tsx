import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  MessageSquare, 
  Calendar, 
  TrendingDown, 
  TrendingUp, 
  Minus,
  ExternalLink,
  RefreshCw
} from "lucide-react";
import { Link } from "react-router-dom";
import type { RelationshipEntropy } from "@/hooks/useAmbientIntelligence";

interface RelationshipEntropyCardProps {
  relationship: RelationshipEntropy;
  onReconnect?: (connectionId: string) => void;
  compact?: boolean;
  className?: string;
}

const getTrendIcon = (trend?: string) => {
  switch (trend) {
    case "increasing":
      return { icon: TrendingUp, color: "text-emerald-500", label: "Growing" };
    case "decreasing":
      return { icon: TrendingDown, color: "text-amber-500", label: "Cooling" };
    case "dormant":
      return { icon: RefreshCw, color: "text-red-500", label: "Dormant" };
    default:
      return { icon: Minus, color: "text-muted-foreground", label: "Stable" };
  }
};

const getEntropyLevel = (score: number) => {
  if (score >= 80) return { label: "Critical", color: "text-red-500", bg: "bg-red-500" };
  if (score >= 60) return { label: "High", color: "text-orange-500", bg: "bg-orange-500" };
  if (score >= 40) return { label: "Medium", color: "text-amber-500", bg: "bg-amber-500" };
  return { label: "Low", color: "text-emerald-500", bg: "bg-emerald-500" };
};

export function RelationshipEntropyCard({ 
  relationship, 
  onReconnect,
  compact = false,
  className 
}: RelationshipEntropyCardProps) {
  const trend = getTrendIcon(relationship.interaction_trend);
  const entropy = getEntropyLevel(relationship.entropy_score);
  const TrendIcon = trend.icon;

  const initials = relationship.connection?.full_name
    ?.split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  if (compact) {
    return (
      <div className={cn("flex items-center gap-3 p-3 rounded-lg border", className)}>
        <Avatar className="h-8 w-8">
          <AvatarImage src={undefined} />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {relationship.connection?.full_name || "Unknown"}
          </p>
          <p className="text-xs text-muted-foreground">
            {relationship.days_since_interaction} days ago
          </p>
        </div>
        <Badge variant="outline" className={cn("text-xs", entropy.color)}>
          {entropy.label}
        </Badge>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-4 rounded-xl border bg-card",
        className
      )}
    >
      <div className="flex items-start gap-3 mb-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={undefined} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold truncate">
              {relationship.connection?.full_name || "Unknown Connection"}
            </h4>
            <Badge variant="outline" className={cn("text-xs shrink-0", entropy.color)}>
              {entropy.label} entropy
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <TrendIcon className={cn("h-3 w-3", trend.color)} />
            <span>{trend.label}</span>
            <span>•</span>
            <Calendar className="h-3 w-3" />
            <span>
              {relationship.days_since_interaction 
                ? `${relationship.days_since_interaction} days since interaction`
                : "Recently active"}
            </span>
          </div>
        </div>
      </div>

      {/* Entropy meter */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-muted-foreground">Relationship Entropy</span>
          <span className={cn("text-xs font-medium", entropy.color)}>
            {Math.round(relationship.entropy_score)}%
          </span>
        </div>
        <Progress 
          value={relationship.entropy_score} 
          className="h-1.5"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {relationship.interaction_frequency !== undefined && (
          <div className="p-2 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-0.5">Frequency</p>
            <p className="text-sm font-medium">
              {relationship.interaction_frequency.toFixed(1)}/month
            </p>
          </div>
        )}
        {relationship.relationship_value !== undefined && (
          <div className="p-2 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-0.5">Value Score</p>
            <p className="text-sm font-medium">
              {Math.round(relationship.relationship_value)}
            </p>
          </div>
        )}
      </div>

      {/* Suggested action */}
      {relationship.suggested_action && (
        <p className="text-xs text-muted-foreground italic mb-4 p-2 bg-muted/30 rounded">
          💡 {relationship.suggested_action}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        {onReconnect && (
          <Button 
            size="sm" 
            variant="default"
            onClick={() => onReconnect(relationship.connection_id)}
            className="flex-1"
          >
            <MessageSquare className="h-3 w-3 mr-1" />
            Reconnect
          </Button>
        )}
        <Link to={`/profile/${relationship.connection_id}`}>
          <Button size="sm" variant="outline">
            <ExternalLink className="h-3 w-3" />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}

// List of entropy relationships
interface RelationshipEntropyListProps {
  relationships: RelationshipEntropy[];
  onReconnect?: (connectionId: string) => void;
  maxVisible?: number;
  className?: string;
}

export function RelationshipEntropyList({ 
  relationships, 
  onReconnect,
  maxVisible = 5,
  className 
}: RelationshipEntropyListProps) {
  const visible = relationships.slice(0, maxVisible);
  const atRisk = relationships.filter(r => r.entropy_score >= 60).length;

  return (
    <div className={cn("space-y-3", className)}>
      {atRisk > 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <RefreshCw className="h-3 w-3" />
          <span>{atRisk} connection{atRisk !== 1 ? "s" : ""} need attention</span>
        </div>
      )}
      {visible.map((relationship) => (
        <RelationshipEntropyCard
          key={relationship.id}
          relationship={relationship}
          onReconnect={onReconnect}
          compact
        />
      ))}
      {relationships.length > maxVisible && (
        <p className="text-xs text-muted-foreground text-center">
          +{relationships.length - maxVisible} more connections
        </p>
      )}
    </div>
  );
}
