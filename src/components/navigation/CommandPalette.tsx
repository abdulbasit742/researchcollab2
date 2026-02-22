import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import {
  Home, Wallet, Trophy, Users, Compass, Shield, FileText, Search,
  Wrench, BookOpen, Calendar, UserCheck, Zap, PenTool, Scale,
  Heart, BarChart3, CreditCard, Download, Star, Megaphone,
  Briefcase, Gamepad2, GraduationCap, Target, DollarSign, Rss,
  Film, User, Bell, MessageSquare, Settings,
} from "lucide-react";

const allRoutes = [
  { label: "Dashboard", href: "/home", icon: Home, group: "Core" },
  { label: "Feed", href: "/feed", icon: Rss, group: "Core" },
  { label: "FYP Browse", href: "/fyp", icon: Briefcase, group: "Core" },
  { label: "Explore", href: "/explore", icon: Compass, group: "Core" },
  { label: "Reels", href: "/reels", icon: Film, group: "Core" },
  { label: "Opportunities", href: "/offers", icon: Target, group: "Core" },
  { label: "Deals", href: "/deals", icon: DollarSign, group: "Core" },
  { label: "Messages", href: "/messages", icon: MessageSquare, group: "Core" },
  { label: "Notifications", href: "/notifications", icon: Bell, group: "Core" },
  { label: "Profile", href: "/profile", icon: User, group: "Core" },
  { label: "Settings", href: "/settings", icon: Settings, group: "Core" },
  { label: "Search", href: "/search", icon: Search, group: "Core" },
  { label: "Earn Hub", href: "/earn", icon: Wallet, group: "Earn & Grow" },
  { label: "Leaderboard", href: "/leaderboard", icon: Trophy, group: "Earn & Grow" },
  { label: "Grants", href: "/grants", icon: Search, group: "Earn & Grow" },
  { label: "Equity Dashboard", href: "/equity", icon: BarChart3, group: "Earn & Grow" },
  { label: "Wallet", href: "/wallet", icon: Wallet, group: "Earn & Grow" },
  { label: "Learning", href: "/learning", icon: BookOpen, group: "Learn & Connect" },
  { label: "Network", href: "/network", icon: Users, group: "Learn & Connect" },
  { label: "Events", href: "/events", icon: Calendar, group: "Learn & Connect" },
  { label: "Career Copilot", href: "/career", icon: Compass, group: "Learn & Connect" },
  { label: "Research Papers", href: "/research-papers", icon: FileText, group: "Create & Build" },
  { label: "Tools", href: "/tools", icon: Wrench, group: "Create & Build" },
  { label: "Blog", href: "/blog", icon: PenTool, group: "Create & Build" },
  { label: "Games", href: "/games", icon: Gamepad2, group: "Create & Build" },
  { label: "Passport", href: "/passport", icon: Shield, group: "Platform" },
  { label: "Governance", href: "/governance", icon: Scale, group: "Platform" },
  { label: "Social", href: "/social", icon: Heart, group: "Platform" },
  { label: "Impact", href: "/impact", icon: Star, group: "Platform" },
  { label: "HR", href: "/hr", icon: UserCheck, group: "More" },
  { label: "Automation", href: "/automation", icon: Zap, group: "More" },
  { label: "Subscriptions", href: "/subscriptions", icon: CreditCard, group: "More" },
  { label: "Install App", href: "/install", icon: Download, group: "More" },
  { label: "Features", href: "/features", icon: GraduationCap, group: "More" },
  { label: "Careers", href: "/careers", icon: Briefcase, group: "More" },
  { label: "Press Kit", href: "/press", icon: Megaphone, group: "More" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const groups = [...new Set(allRoutes.map((r) => r.group))];

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search pages... (Ctrl+K)" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {groups.map((group) => (
          <CommandGroup key={group} heading={group}>
            {allRoutes
              .filter((r) => r.group === group)
              .map((route) => (
                <CommandItem
                  key={route.href}
                  value={route.label}
                  onSelect={() => {
                    navigate(route.href);
                    setOpen(false);
                  }}
                >
                  <route.icon className="mr-2 h-4 w-4" />
                  {route.label}
                </CommandItem>
              ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
