import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { useIsMobile } from "@/hooks/use-mobile";

const DISMISS_KEY = "pwa-banner-dismissed";

export function PWAInstallBanner() {
  const { canInstall, isInstalled, install } = usePWAInstall();
  const isMobile = useIsMobile();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const wasDismissed = sessionStorage.getItem(DISMISS_KEY);
    setDismissed(!!wasDismissed);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem(DISMISS_KEY, "1");
  };

  const handleInstall = async () => {
    const accepted = await install();
    if (accepted) handleDismiss();
  };

  const show = canInstall && !isInstalled && !dismissed;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: isMobile ? 100 : -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: isMobile ? 100 : -80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`fixed z-[60] ${
            isMobile
              ? "bottom-20 left-3 right-3"
              : "top-4 left-1/2 -translate-x-1/2 w-full max-w-md"
          }`}
        >
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card/95 backdrop-blur-lg p-3 shadow-lg">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg gradient-primary shrink-0">
              <Download className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">Install the App</p>
              <p className="text-xs text-muted-foreground truncate">
                Faster access, offline support & more
              </p>
            </div>
            <Button size="sm" onClick={handleInstall} className="shrink-0">
              Install
            </Button>
            <button
              onClick={handleDismiss}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors shrink-0"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
