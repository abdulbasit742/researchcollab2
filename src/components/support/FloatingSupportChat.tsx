import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { buildWhatsAppUrl } from "@/config/support";
import supportAvatar from "@/assets/support-avatar.png";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function FloatingSupportChat() {
  const location = useLocation();
  const { profile } = useAuth();

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
          <button
            onClick={handleClick}
            aria-label="Need help? Chat with Support"
            className="fixed bottom-6 right-6 z-50 h-14 w-14 md:h-12 md:w-12 rounded-full shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 animate-pulse-subtle overflow-hidden border-2 border-primary/20 bg-background"
          >
            <img
              src={supportAvatar}
              alt="Support"
              className="h-full w-full object-cover"
            />
          </button>
        </TooltipTrigger>
        <TooltipContent side="left" className="bg-popover text-popover-foreground">
          <p>Need help? Chat with Support</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
