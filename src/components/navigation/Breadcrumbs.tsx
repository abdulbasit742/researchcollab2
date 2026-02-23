import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";

const routeLabels: Record<string, string> = {
  home: "Dashboard",
  feed: "Feed",
  explore: "Explore",
  reels: "Reels",
  profile: "Profile",
  fyp: "FYP",
  offers: "Opportunities",
  deals: "Deals",
  wallet: "Wallet",
  verification: "Verification",
  messages: "Messages",
  notifications: "Notifications",
  search: "Search",
  earn: "Earn",
  leaderboard: "Leaderboard",
  network: "Network",
  career: "Career",
  passport: "Passport",
  "research-papers": "Research",
  grants: "Grants",
  tools: "Tools",
  learning: "Learning",
  events: "Events",
  hr: "HR",
  automation: "Automation",
  blog: "Blog",
  governance: "Governance",
  social: "Social",
  impact: "Impact",
  equity: "Equity",
  subscriptions: "Subscriptions",
  install: "Install",
  features: "Features",
  careers: "Careers",
  press: "Press",
  games: "Games",
  about: "About",
  pricing: "Pricing",
  contact: "Contact",
  help: "Help",
  admin: "Admin",
  settings: "Settings",
};

export function Breadcrumbs() {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  if (segments.length === 0 || location.pathname === "/") return null;

  return (
    <nav aria-label="Breadcrumb" className="container px-4 py-2 flex items-center justify-between">
      <ol className="flex items-center gap-1 text-xs text-muted-foreground overflow-x-auto">
        <li>
          <Link to="/home" className="flex items-center hover:text-foreground transition-colors">
            <Home className="h-3 w-3" />
          </Link>
        </li>
        {segments.map((segment, i) => {
          const path = "/" + segments.slice(0, i + 1).join("/");
          const isLast = i === segments.length - 1;
          const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");

          return (
            <li key={path} className="flex items-center gap-1">
              <ChevronRight className="h-3 w-3 shrink-0" />
              {isLast ? (
                <span className={cn("font-medium text-foreground truncate max-w-[120px]")}>{label}</span>
              ) : (
                <Link to={path} className="hover:text-foreground transition-colors truncate max-w-[120px]">
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
      <FavoriteButton />
    </nav>
  );
}
