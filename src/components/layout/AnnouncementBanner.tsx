import { useState } from "react";
import { X, Megaphone } from "lucide-react";
import { Link } from "react-router-dom";

const DISMISS_KEY = "announcement-dismissed-v1";

export function AnnouncementBanner() {
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem(DISMISS_KEY) === "true";
  });

  if (dismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, "true");
    setDismissed(true);
  };

  return (
    <div className="bg-primary text-primary-foreground text-sm py-2 px-4 relative">
      <div className="container flex items-center justify-center gap-2">
        <Megaphone className="h-4 w-4 shrink-0" />
        <p className="text-center">
          <span className="font-medium">New!</span> Explore our Research Papers, Events, and Learning modules.{" "}
          <Link to="/features" className="underline underline-offset-2 font-medium hover:opacity-80">
            See what's new →
          </Link>
        </p>
        <button
          onClick={handleDismiss}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-primary-foreground/20 transition-colors"
          aria-label="Dismiss announcement"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
