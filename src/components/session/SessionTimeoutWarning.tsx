import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Clock } from "lucide-react";

const IDLE_TIMEOUT = 25 * 60 * 1000; // 25 minutes
const WARNING_BEFORE = 5 * 60 * 1000; // Show warning 5 min before

export function SessionTimeoutWarning() {
  const { user, signOut } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());

  const resetTimer = useCallback(() => {
    setLastActivity(Date.now());
    setShowWarning(false);
  }, []);

  useEffect(() => {
    if (!user) return;

    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    const handler = () => setLastActivity(Date.now());
    events.forEach((e) => window.addEventListener(e, handler, { passive: true }));

    const interval = setInterval(() => {
      const elapsed = Date.now() - lastActivity;
      if (elapsed >= IDLE_TIMEOUT) {
        signOut();
        setShowWarning(false);
      } else if (elapsed >= IDLE_TIMEOUT - WARNING_BEFORE) {
        setShowWarning(true);
      }
    }, 30000);

    return () => {
      events.forEach((e) => window.removeEventListener(e, handler));
      clearInterval(interval);
    };
  }, [user, lastActivity, signOut]);

  if (!user) return null;

  return (
    <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" />
            Session Expiring Soon
          </AlertDialogTitle>
          <AlertDialogDescription>
            You've been inactive for a while. Your session will expire in a few minutes. 
            Click "Stay Signed In" to continue working.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => signOut()}>Sign Out</AlertDialogCancel>
          <AlertDialogAction onClick={resetTimer}>Stay Signed In</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
