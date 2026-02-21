import { Link, useLocation } from "react-router-dom";
import { Home, Rss, Compass, Film, User } from "lucide-react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDemoWalkthrough } from "@/contexts/DemoWalkthroughContext";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: typeof Home;
  label: string;
  route: string;
  badge?: number;
}

export function MobileBottomNav() {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { isActive: isTourActive } = useDemoWalkthrough();

  const navItems: NavItem[] = [
    { icon: Home, label: "Home", route: "/home" },
    { icon: Rss, label: "Feed", route: "/feed" },
    { icon: Compass, label: "Explore", route: "/explore" },
    { icon: Film, label: "Reels", route: "/reels" },
    { icon: User, label: "Profile", route: "/profile" },
  ];

  // Hide on desktop or when tour is active
  if (!isMobile || isTourActive) return null;

  const isActive = (route: string) => {
    if (route === "/") return location.pathname === "/";
    return location.pathname.startsWith(route);
  };

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed bottom-0 left-0 right-0 z-50 w-full bg-background border-t border-border will-change-transform"
      style={{ transform: 'translateZ(0)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around py-2 px-2">
        {navItems.map((item) => {
          const active = isActive(item.route);
          const Icon = item.icon;

          return (
            <Link
              key={item.route}
              to={item.route}
              className={cn(
                "relative flex flex-col items-center justify-center w-full h-full gap-0.5 touch-manipulation transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:rounded-lg",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div className="relative">
                <motion.div
                  initial={false}
                  animate={active ? { scale: 1.1 } : { scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
                </motion.div>
                
                {item.badge && item.badge > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-bold text-primary-foreground bg-destructive rounded-full"
                  >
                    {item.badge > 9 ? "9+" : item.badge}
                  </motion.span>
                )}
              </div>
              
              <span className={cn(
                "text-[10px] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}>
                {item.label}
              </span>

              {active && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
