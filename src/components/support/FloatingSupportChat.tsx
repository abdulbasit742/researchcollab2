import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { buildWhatsAppUrl } from "@/config/support";
import supportAvatar from "@/assets/support-avatar.png";
import { MessageCircle, User } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function FloatingSupportChat() {
  const location = useLocation();
  const { profile } = useAuth();
  const [showLabel, setShowLabel] = useState(true);
  const [isPressed, setIsPressed] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Show label for 3 seconds on mount/route change
  useEffect(() => {
    setShowLabel(true);
    const timer = setTimeout(() => setShowLabel(false), 3000);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const handleClick = () => {
    const url = buildWhatsAppUrl(
      profile?.full_name || profile?.first_name,
      profile?.role,
      location.pathname
    );
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 flex items-center gap-2">
            {/* Expandable label - mobile only */}
            <div
              className={`md:hidden bg-primary text-primary-foreground text-sm font-medium px-3 py-1.5 rounded-full shadow-md transition-all duration-300 ${
                showLabel ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 pointer-events-none"
              }`}
            >
              Support
            </div>
            
            <button
              onClick={handleClick}
              onTouchStart={() => setIsPressed(true)}
              onTouchEnd={() => setIsPressed(false)}
              onMouseDown={() => setIsPressed(true)}
              onMouseUp={() => setIsPressed(false)}
              onMouseLeave={() => setIsPressed(false)}
              aria-label="Support chat"
              className={`relative h-14 w-14 md:h-13 md:w-13 rounded-full shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 animate-pulse-subtle overflow-hidden border-2 border-primary/20 bg-background ${
                isPressed ? "scale-90" : "hover:scale-105"
              }`}
            >
              {/* Avatar */}
              {imgError ? (
                <div className="h-full w-full flex items-center justify-center bg-primary/10">
                  <User className="h-7 w-7 text-primary" />
                </div>
              ) : (
                <img
                  src={supportAvatar}
                  alt="Support"
                  className="h-full w-full object-cover"
                  onError={() => setImgError(true)}
                />
              )}
              
              {/* Chat badge */}
              <div className="absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full bg-primary flex items-center justify-center shadow-sm border-2 border-background">
                <MessageCircle className="h-2.5 w-2.5 text-primary-foreground" />
              </div>
            </button>
          </div>
        </TooltipTrigger>
        <TooltipContent side="left" className="hidden md:block bg-popover text-popover-foreground">
          <p>Need help? Chat with Support</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
