import { AlertTriangle, Clock, X, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CrisisMode, CrisisLevel } from "@/types/crisis-coordination";
import { useEffect, useState } from "react";

interface CrisisBannerProps {
  crisis: CrisisMode;
  onEscalate?: () => void;
  onDeescalate?: () => void;
  onDeactivate?: () => void;
  timeRemaining?: number | null;
}

const levelStyles: Record<CrisisLevel, { bg: string; border: string; text: string }> = {
  advisory: { 
    bg: "bg-blue-500/10", 
    border: "border-blue-500", 
    text: "text-blue-600 dark:text-blue-400" 
  },
  elevated: { 
    bg: "bg-amber-500/10", 
    border: "border-amber-500", 
    text: "text-amber-600 dark:text-amber-400" 
  },
  critical: { 
    bg: "bg-orange-500/10", 
    border: "border-orange-500", 
    text: "text-orange-600 dark:text-orange-400" 
  },
  emergency: { 
    bg: "bg-red-500/10", 
    border: "border-red-500", 
    text: "text-red-600 dark:text-red-400" 
  },
};

const levelLabels: Record<CrisisLevel, string> = {
  advisory: "ADVISORY",
  elevated: "ELEVATED",
  critical: "CRITICAL",
  emergency: "EMERGENCY",
};

function formatTimeRemaining(ms: number): string {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function CrisisBanner({ 
  crisis, 
  onEscalate, 
  onDeescalate, 
  onDeactivate,
  timeRemaining 
}: CrisisBannerProps) {
  const [displayTime, setDisplayTime] = useState(timeRemaining);
  const style = levelStyles[crisis.level];

  useEffect(() => {
    if (timeRemaining === null || timeRemaining === undefined) return;
    
    setDisplayTime(timeRemaining);
    const interval = setInterval(() => {
      setDisplayTime(prev => prev ? Math.max(0, prev - 60000) : null);
    }, 60000);

    return () => clearInterval(interval);
  }, [timeRemaining]);

  if (!crisis.isActive) return null;

  return (
    <div 
      className={`
        w-full px-4 py-3 
        ${style.bg} ${style.border} border-b-2
        flex items-center justify-between
      `}
    >
      <div className="flex items-center gap-3">
        <AlertTriangle className={`h-5 w-5 ${style.text} ${crisis.level === "emergency" ? "animate-pulse" : ""}`} />
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`${style.text} border-current font-bold`}>
              {levelLabels[crisis.level]}
            </Badge>
            <span className={`font-semibold ${style.text}`}>{crisis.name}</span>
          </div>
          {crisis.uiOverrides.bannerMessage && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {crisis.uiOverrides.bannerMessage}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {displayTime !== null && displayTime !== undefined && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Expires in {formatTimeRemaining(displayTime)}</span>
          </div>
        )}

        <div className="flex items-center gap-1">
          {onDeescalate && crisis.level !== "advisory" && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onDeescalate}
              className="h-8"
            >
              <ChevronDown className="h-4 w-4 mr-1" />
              De-escalate
            </Button>
          )}
          {onEscalate && crisis.level !== "emergency" && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onEscalate}
              className={`h-8 ${style.text}`}
            >
              <ChevronUp className="h-4 w-4 mr-1" />
              Escalate
            </Button>
          )}
          {onDeactivate && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onDeactivate}
              className="h-8"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
