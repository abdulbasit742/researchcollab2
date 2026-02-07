import { useState, useEffect } from "react";
 import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/layout/NotificationBell";
 import { VoiceSearchButton } from "@/components/search/VoiceSearchButton";
import { useAuth } from "@/contexts/AuthContext";
import { useUnreadCount } from "@/hooks/useMessaging";
import {
  Menu,
  X,
  GraduationCap,
  Users,
  Briefcase,
  MessageSquare,
  Home,
  Target,
  User,
  LogOut,
  TrendingUp,
   Search,
} from "lucide-react";

// Simplified, focused navigation - only core actions
const navItems = [
  { label: "Home", href: "/home", icon: Home },
  { label: "Network", href: "/network", icon: Users },
  { label: "Opportunities", href: "/offers", icon: Target },
  { label: "Deals", href: "/deals", icon: Briefcase },
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
   const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

   const handleVoiceSearch = (transcript: string) => {
     if (transcript.trim()) {
       navigate(`/search?q=${encodeURIComponent(transcript.trim())}`);
     }
   };
 
  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  return (
    <header 
      className={`sticky top-0 z-50 w-full border-b backdrop-blur-xl safe-area-top transition-all duration-200 ${
        isScrolled 
          ? "bg-background/95 border-border shadow-sm" 
          : "bg-background/80 border-transparent"
      }`}
    >
      <div className="container flex h-14 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/home" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <GraduationCap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold">
            R<span className="text-primary">Collab</span>
          </span>
        </Link>

        {/* Desktop Navigation - Clean, minimal */}
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

        {/* Desktop Actions - Simplified */}
        <div className="hidden lg:flex items-center gap-2">
           <VoiceSearchButton
             onTranscript={handleVoiceSearch}
             className="h-9 w-9"
           />
          <NotificationBell />
          {user ? (
            <>
              <Link to="/progress">
                <Button variant="ghost" size="sm" className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Progress
                </Button>
              </Link>
              <Link to="/profile">
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="ghost" size="sm">Sign In</Button>
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
            className="p-2 rounded-lg hover:bg-muted touch-manipulation"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation - Streamlined */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t bg-background overflow-y-auto max-h-[70vh]"
          >
            <div className="container py-3 px-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors touch-manipulation ${
                    location.pathname === item.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
              <MobileMessagesNavItem onClick={() => setIsOpen(false)} />
              
              <div className="pt-3 border-t space-y-2">
                {user ? (
                  <>
                    <Link to="/progress" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full justify-start gap-2 h-11">
                        <TrendingUp className="h-4 w-4" />
                        Career Progress
                      </Button>
                    </Link>
                    <Link to="/profile" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full justify-start gap-2 h-11">
                        <User className="h-4 w-4" />
                        Profile
                      </Button>
                    </Link>
                    <Button className="w-full h-11" onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/auth" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full h-11">Sign In</Button>
                    </Link>
                    <Link to="/auth?tab=signup" onClick={() => setIsOpen(false)}>
                      <Button className="w-full h-11">Get Started</Button>
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
