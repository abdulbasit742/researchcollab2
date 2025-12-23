import { useNavigate } from "react-router-dom";
import { ArrowLeft, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PresenceIndicator } from "./PresenceIndicator";
import { useUserPresence } from "@/hooks/usePresence";
import { cn } from "@/lib/utils";

interface ChatHeaderProps {
  userId?: string;
  displayName: string;
  role?: string | null;
  isSupport?: boolean;
  typingText?: string | null;
  onWhatsAppEscalate?: () => void;
  isLoading?: boolean;
}

export function ChatHeader({
  userId,
  displayName,
  role,
  isSupport,
  typingText,
  onWhatsAppEscalate,
  isLoading,
}: ChatHeaderProps) {
  const navigate = useNavigate();
  const { isOnline, lastSeen } = useUserPresence(userId);

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="sticky top-0 z-40 bg-background border-b safe-area-top">
      <div className="container px-4">
        <div className="flex items-center gap-3 py-3 min-h-[60px]">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/messages")}
            className="shrink-0 h-11 w-11"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          {isLoading ? (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
              <div className="space-y-1.5">
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                <div className="h-3 w-16 bg-muted rounded animate-pulse" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="relative shrink-0">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="text-sm font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span
                  className={cn(
                    "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background",
                    isOnline ? "bg-green-500" : "bg-muted-foreground/40"
                  )}
                />
              </div>
              
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold truncate">{displayName}</h2>
                  {isSupport && (
                    <Badge variant="secondary" className="text-xs shrink-0">
                      Support
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  {typingText ? (
                    <span className="text-xs text-primary animate-pulse">
                      {typingText}
                    </span>
                  ) : (
                    <>
                      <PresenceIndicator
                        isOnline={isOnline}
                        lastSeen={lastSeen}
                        showText
                        size="sm"
                      />
                      {role && !isSupport && (
                        <Badge variant="outline" className="text-xs capitalize">
                          {role}
                        </Badge>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* WhatsApp Escalation for Support threads */}
              {isSupport && onWhatsAppEscalate && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onWhatsAppEscalate}
                  className="shrink-0 h-10 w-10"
                >
                  <Phone className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
