import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { BADGES, BadgeType } from "@/data/verification";

interface BadgeDisplayProps {
  badges: BadgeType[];
  size?: 'sm' | 'md' | 'lg';
  maxDisplay?: number;
  showLabels?: boolean;
}

export const BadgeDisplay = ({ 
  badges, 
  size = 'md', 
  maxDisplay = 3,
  showLabels = false 
}: BadgeDisplayProps) => {
  const displayedBadges = badges.slice(0, maxDisplay);
  const remainingCount = badges.length - maxDisplay;
  
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      {displayedBadges.map((badgeType) => {
        const badge = BADGES[badgeType];
        if (!badge) return null;
        
        return (
          <Tooltip key={badgeType}>
            <TooltipTrigger asChild>
              <Badge 
                variant="outline" 
                className={`${badge.color} ${sizeClasses[size]} border cursor-help transition-all hover:scale-105`}
              >
                <span className="mr-1">{badge.icon}</span>
                {showLabels && <span>{badge.label}</span>}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-medium">{badge.label}</p>
              <p className="text-xs text-muted-foreground">{badge.description}</p>
            </TooltipContent>
          </Tooltip>
        );
      })}
      {remainingCount > 0 && (
        <Badge variant="secondary" className={`${sizeClasses[size]} bg-muted`}>
          +{remainingCount}
        </Badge>
      )}
    </div>
  );
};

interface SingleBadgeProps {
  badgeType: BadgeType;
  size?: 'sm' | 'md' | 'lg';
}

export const SingleBadge = ({ badgeType, size = 'md' }: SingleBadgeProps) => {
  const badge = BADGES[badgeType];
  if (!badge) return null;
  
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge 
          variant="outline" 
          className={`${badge.color} ${sizeClasses[size]} border cursor-help transition-all hover:scale-105`}
        >
          <span className="mr-1">{badge.icon}</span>
          <span>{badge.label}</span>
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-xs">{badge.description}</p>
      </TooltipContent>
    </Tooltip>
  );
};
