import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { useAuth } from "@/contexts/AuthContext";
import { startPresenceTracking, stopPresenceTracking } from "@/lib/presenceService";
import { unsubscribeAll, getActiveChannelCount } from "@/lib/realtimeClient";

interface RealtimeContextType {
  isConnected: boolean;
  activeSubscriptions: number;
  reconnect: () => void;
}

const RealtimeContext = createContext<RealtimeContextType>({
  isConnected: false,
  activeSubscriptions: 0,
  reconnect: () => {},
});

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [activeSubscriptions, setActiveSubscriptions] = useState(0);

  // Start presence tracking when user logs in
  useEffect(() => {
    if (!user) {
      setIsConnected(false);
      return;
    }

    setIsConnected(true);
    startPresenceTracking(user.id);

    // Poll active channel count for debugging
    const interval = setInterval(() => {
      setActiveSubscriptions(getActiveChannelCount());
    }, 5000);

    return () => {
      clearInterval(interval);
      stopPresenceTracking(user.id);
      setIsConnected(false);
    };
  }, [user]);

  // Cleanup all subscriptions on unmount (app close)
  useEffect(() => {
    return () => {
      unsubscribeAll();
    };
  }, []);

  const reconnect = useCallback(() => {
    if (!user) return;
    // Re-initialize presence
    startPresenceTracking(user.id);
    setIsConnected(true);
  }, [user]);

  return (
    <RealtimeContext.Provider
      value={{ isConnected, activeSubscriptions, reconnect }}
    >
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  return useContext(RealtimeContext);
}
