import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck, Clock, Loader2 } from "lucide-react";
import { 
  useConnectionStatus, 
  useSendConnectionRequest, 
  useAcceptConnectionRequest 
} from "@/hooks/useNetwork";
import { useAuth } from "@/contexts/AuthContext";

interface ConnectButtonProps {
  userId: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function ConnectButton({ userId, variant = "default", size = "sm", className }: ConnectButtonProps) {
  const { user } = useAuth();
  const { data: status, isLoading: checkingStatus } = useConnectionStatus(userId);
  const sendRequest = useSendConnectionRequest();
  const acceptRequest = useAcceptConnectionRequest();
  
  // Don't show for own profile or unauthenticated
  if (!user || user.id === userId) return null;
  
  const isLoading = checkingStatus || sendRequest.isPending || acceptRequest.isPending;
  
  const handleClick = () => {
    if (status?.status === "none") {
      sendRequest.mutate(userId);
    } else if (status?.status === "pending_received" && status.requestId) {
      acceptRequest.mutate(status.requestId);
    }
  };
  
  // Already connected
  if (status?.status === "connected") {
    return (
      <Button variant="secondary" size={size} disabled className={className}>
        <UserCheck className="h-4 w-4 mr-1" />
        Connected
      </Button>
    );
  }
  
  // Pending request I sent
  if (status?.status === "pending_sent") {
    return (
      <Button variant="secondary" size={size} disabled className={className}>
        <Clock className="h-4 w-4 mr-1" />
        Pending
      </Button>
    );
  }
  
  // Pending request I received
  if (status?.status === "pending_received") {
    return (
      <Button variant="default" size={size} onClick={handleClick} disabled={isLoading} className={className}>
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <UserPlus className="h-4 w-4 mr-1" />
            Accept
          </>
        )}
      </Button>
    );
  }
  
  // No connection
  return (
    <Button variant={variant} size={size} onClick={handleClick} disabled={isLoading} className={className}>
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <UserPlus className="h-4 w-4 mr-1" />
          Connect
        </>
      )}
    </Button>
  );
}
