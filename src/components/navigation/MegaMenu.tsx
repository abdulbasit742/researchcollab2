import { Link } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Wallet, Trophy, Users, Compass as CompassIcon, Shield, FileText,
  Search, Wrench, BookOpen, Calendar, UserCheck, Zap,
  PenTool, Scale, Heart, BarChart3, CreditCard, Download,
  Star, Megaphone, Briefcase, Gamepad2, GraduationCap,
} from "lucide-react";

const categories = [
  {
    label: "Earn & Grow",
    items: [
      { label: "Earn Hub", href: "/earn", icon: Wallet, desc: "Projects, bids & stats" },
      { label: "Leaderboard", href: "/leaderboard", icon: Trophy, desc: "Trust-ranked pros" },
      { label: "Grants", href: "/grants", icon: Search, desc: "Discover funding" },
      { label: "Equity", href: "/equity", icon: BarChart3, desc: "Allocations tracker" },
    ],
  },
  {
    label: "Learn & Connect",
    items: [
      { label: "Learning", href: "/learning", icon: BookOpen, desc: "Courses & certs" },
      { label: "Network", href: "/network", icon: Users, desc: "Connections" },
      { label: "Events", href: "/events", icon: Calendar, desc: "Discover events" },
      { label: "Career", href: "/career", icon: CompassIcon, desc: "AI career copilot" },
    ],
  },
  {
    label: "Create & Build",
    items: [
      { label: "Research", href: "/research-papers", icon: FileText, desc: "Paper analysis" },
      { label: "Tools", href: "/tools", icon: Wrench, desc: "AI marketplace" },
      { label: "Blog", href: "/blog", icon: PenTool, desc: "Read & write" },
      { label: "Games", href: "/games", icon: Gamepad2, desc: "Learn by playing" },
    ],
  },
  {
    label: "Platform",
    items: [
      { label: "Passport", href: "/passport", icon: Shield, desc: "Credentials" },
      { label: "Governance", href: "/governance", icon: Scale, desc: "Decisions & pods" },
      { label: "Social", href: "/social", icon: Heart, desc: "Stories & live" },
      { label: "Impact", href: "/impact", icon: Star, desc: "Platform metrics" },
    ],
  },
  {
    label: "More",
    items: [
      { label: "HR", href: "/hr", icon: UserCheck, desc: "Recruitment" },
      { label: "Automation", href: "/automation", icon: Zap, desc: "Workflows" },
      { label: "Subscriptions", href: "/subscriptions", icon: CreditCard, desc: "Plans" },
      { label: "Install App", href: "/install", icon: Download, desc: "PWA install" },
      { label: "Features", href: "/features", icon: GraduationCap, desc: "Showcase" },
      { label: "Careers", href: "/careers", icon: Briefcase, desc: "Join the team" },
      { label: "Press", href: "/press", icon: Megaphone, desc: "Press kit" },
    ],
  },
];

export function MegaMenu() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        {categories.map((cat) => (
          <NavigationMenuItem key={cat.label}>
            <NavigationMenuTrigger className="text-sm h-9 px-3">{cat.label}</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="grid w-[320px] gap-1 p-3 md:w-[400px] md:grid-cols-2">
                {cat.items.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="flex items-center gap-3 rounded-lg p-3 hover:bg-muted transition-colors group"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{item.label}</div>
                      <div className="text-xs text-muted-foreground">{item.desc}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
