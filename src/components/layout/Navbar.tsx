import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { useAuth } from "@/contexts/AuthContext";
import { useUnreadCount } from "@/hooks/useMessaging";
import {
  Menu,
  X,
  GraduationCap,
  Users,
  Briefcase,
  Wrench,
  Sparkles,
  BookOpen,
  Heart,
  FileText,
  Share2,
  LogOut,
  MessageSquare,
  Home,
  Target,
} from "lucide-react";

const navItems = [
  {
    label: "Home",
    href: "/home",
    icon: Home,
  },
  {
    label: "Opportunities",
    href: "/offers",
    icon: Target,
  },
  {
    label: "Matches",
    href: "/matches",
    icon: Heart,
  },
  {
    label: "AI Tools",
    href: "/tools",
    icon: Wrench,
  },
  {
    label: "Earn",
    href: "/earn",
    icon: Briefcase,
  },
  {
    label: "Blog",
    href: "/blog",
    icon: BookOpen,
  },
];

function MessagesNavItem({ onClick }: { onClick?: () => void }) {
  const location = useLocation();
  const unreadCount = useUnreadCount();
  const isActive = location.pathname.startsWith("/messages");

  return (
    <Link
      to="/messages"
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative ${
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      }`}
    >
      <div className="relative">
        <MessageSquare className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 h-4 w-4 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-medium">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </div>
      Messages
    </Link>
  );
}

function MobileMessagesNavItem({ onClick }: { onClick?: () => void }) {
  const location = useLocation();
  const unreadCount = useUnreadCount();
  const isActive = location.pathname.startsWith("/messages");

  return (
    <Link
      to="/messages"
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      }`}
    >
      <div className="relative">
        <MessageSquare className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-medium">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </div>
      Messages
      {unreadCount > 0 && (
        <span className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
          {unreadCount}
        </span>
      )}
    </Link>
  );
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  return (
    <header 
      className={`sticky top-0 z-50 w-full border-b backdrop-blur-xl safe-area-top transition-all duration-300 ${
        isScrolled 
          ? "bg-background/95 border-border shadow-md" 
          : "bg-background/80 border-transparent"
      }`}
    >
      <div className="container flex h-14 md:h-16 items-center justify-between px-3 md:px-6">
        <Link to="/" className="flex items-center gap-1.5 md:gap-2">
          <div className="flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-lg gradient-primary">
            <GraduationCap className="h-4 w-4 md:h-5 md:w-5 text-primary-foreground" />
          </div>
          <span className="text-base md:text-xl font-bold">
            <span className="hidden xs:inline">Researcher</span>
            <span className="xs:hidden">R</span>
            <span className="text-primary">Collab</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === item.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
          <MessagesNavItem />
        </nav>

        <div className="hidden md:flex items-center gap-2 lg:gap-3">
          <NotificationBell />
          <Link to="/subscriptions">
            <Button variant="ghost" size="sm">
              My Tools
            </Button>
          </Link>
          <Link to="/wallet">
            <Button variant="ghost" size="sm">
              Wallet
            </Button>
          </Link>
          {user ? (
            <>
              <Link to="/profile">
                <Button variant="ghost" size="sm">
                  Profile
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/auth?tab=signup">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Actions */}
        <div className="flex lg:hidden items-center gap-1">
          <NotificationBell />
          <button
            className="p-2 rounded-lg hover:bg-muted active:bg-muted/80 touch-manipulation"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t bg-background overflow-y-auto max-h-[calc(100vh-3.5rem)]"
          >
            <div className="container py-3 px-3 space-y-1">
              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2 pb-3 border-b">
                <Link to="/wallet" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    💰 Wallet
                  </Button>
                </Link>
                <Link to="/subscriptions" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    🛠️ My Tools
                  </Button>
                </Link>
              </div>
              
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors active:scale-[0.98] touch-manipulation ${
                    location.pathname === item.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted active:bg-muted"
                  }`}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {item.label}
                </Link>
              ))}
              <MobileMessagesNavItem onClick={() => setIsOpen(false)} />
              
              <div className="pt-3 border-t flex flex-col gap-2">
                {user ? (
                  <>
                    <Link to="/profile" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full h-11 touch-manipulation">
                        Profile
                      </Button>
                    </Link>
                    <Button className="w-full h-11 touch-manipulation" onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/auth" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full h-11 touch-manipulation">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/auth?tab=signup" onClick={() => setIsOpen(false)}>
                      <Button className="w-full h-11 touch-manipulation">Get Started</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
