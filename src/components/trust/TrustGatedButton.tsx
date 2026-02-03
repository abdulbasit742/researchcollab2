import { forwardRef } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMyTrustProfile } from "@/hooks/useMyTrustProfile";
import { AlertCircle, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrustGatedButtonProps extends ButtonProps {
  minTrustScore?: number;
  action?: string;
}

export const TrustGatedButton = forwardRef<HTMLButtonElement, TrustGatedButtonProps>(
  ({ minTrustScore = 30, action = "perform this action", children, disabled, className, ...props }, ref) => {
    const { trustProfile, loading } = useMyTrustProfile();
    
    const currentTrustScore = trustProfile?.trust_score ?? 0;
    const isBlocked = currentTrustScore < minTrustScore;
    const isDisabled = disabled || isBlocked;

    if (isBlocked) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                ref={ref}
                disabled
                className={cn("gap-1.5", className)}
                {...props}
              >
                <AlertCircle className="h-4 w-4" />
                {children}
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <div className="space-y-1">
                <p className="font-medium flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Trust Score Required
                </p>
                <p className="text-xs text-muted-foreground">
                  You need a trust score of at least {minTrustScore} to {action}.
                  Your current score is {currentTrustScore}.
                </p>
                <p className="text-xs text-muted-foreground">
                  Complete work, meet deadlines, and maintain quality to increase your score.
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <Button
        ref={ref}
        disabled={isDisabled}
        className={className}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

TrustGatedButton.displayName = "TrustGatedButton";
