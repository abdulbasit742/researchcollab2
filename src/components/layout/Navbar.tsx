import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { VoiceSearchButton } from "@/components/search/VoiceSearchButton";
import { useAuth } from "@/contexts/AuthContext";
import {
  Menu,
  X,
  GraduationCap,
  Briefcase,
  Home,
  Target,
  User,
  LogOut,
  DollarSign,
  Rss,
  Compass,
  Film,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

// Pilot-focused navigation — core modules + social
const navItems = [
  { label: "Dashboard", href: "/home", icon: Home },
  { label: "Feed", href: "/feed", icon: Rss },
  { label: "FYP", href: "/fyp", icon: Briefcase },
  { label: "Explore", href: "/explore", icon: Compass },
  { label: "Reels", href: "/reels", icon: Film },
  { label: "Opportunities", href: "/offers", icon: Target },
  { label: "Deals", href: "/deals", icon: DollarSign },
];

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
        <Link to={user ? "/home" : "/"} className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <GraduationCap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold">
            <span className="text-primary">RCollab</span>
          </span>
        </Link>

        {/* Desktop Navigation - Core modules only */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname.startsWith(item.href)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-2">
          <VoiceSearchButton
            onTranscript={handleVoiceSearch}
            className="h-9 w-9"
          />
          <ThemeToggle />
          <NotificationBell />
          {user ? (
            <>
              <Link to="/profile">
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2" aria-label="Sign out">
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
          <ThemeToggle />
          <NotificationBell />
          <button
            className="p-2 rounded-lg hover:bg-muted touch-manipulation"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
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
                    location.pathname.startsWith(item.href)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}

              <div className="pt-3 border-t space-y-2">
                {user ? (
                  <>
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
