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
  Home,
  Target,
  User,
  LogOut,
  Handshake,
  MessageSquare,
  Search,
  FolderKanban,
  FileText,
  ClipboardCheck,
  BarChart3,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { KeyboardShortcutsHelp } from "@/components/navigation/KeyboardShortcutsHelp";
import { UserAvatarMenu } from "@/components/layout/UserAvatarMenu";
import { AnnouncementBanner } from "@/components/layout/AnnouncementBanner";

// Execution-focused navigation grouped by pillar
const primaryNav = [
  { label: "Dashboard", href: "/home", icon: Home },
  { label: "Projects", href: "/deals", icon: FolderKanban },
  { label: "Opportunities", href: "/offers", icon: Target },
  { label: "Messages", href: "/messages", icon: MessageSquare },
];

const mobileNavGroups = [
  {
    label: "Execution",
    items: [
      { label: "Dashboard", href: "/home", icon: Home },
      { label: "Projects", href: "/deals", icon: FolderKanban },
      { label: "Opportunities", href: "/offers", icon: Target },
      { label: "Reviews", href: "/reviews", icon: ClipboardCheck },
    ],
  },
  {
    label: "Collaboration",
    items: [
      { label: "Messages", href: "/messages", icon: MessageSquare },
      { label: "Search", href: "/search", icon: Search },
      { label: "Discover", href: "/discover", icon: BarChart3 },
    ],
  },
  {
    label: "Knowledge",
    items: [
      { label: "Research", href: "/research", icon: FileText },
      { label: "Grants", href: "/grants", icon: Handshake },
    ],
  },
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
    <>
    <AnnouncementBanner />
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

        {/* Desktop Navigation — Execution focused */}
        {user && (
          <nav className="hidden lg:flex items-center gap-1">
            {primaryNav.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname.startsWith(item.href) && item.href !== "/"
                    ? "bg-primary/10 text-primary"
                    : location.pathname === item.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        )}

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-2">
          {user && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => navigate("/search")}
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </Button>
              <VoiceSearchButton
                onTranscript={handleVoiceSearch}
                className="h-9 w-9"
              />
            </>
          )}
          <KeyboardShortcutsHelp />
          <ThemeToggle />
          <NotificationBell />
          {user ? (
            <UserAvatarMenu />
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

      {/* Mobile Navigation — Grouped */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t bg-background overflow-y-auto max-h-[70vh]"
          >
            <div className="container py-3 px-4 space-y-4">
              {mobileNavGroups.map((group) => (
                <div key={group.label}>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 mb-1">
                    {group.label}
                  </p>
                  <div className="space-y-0.5">
                    {group.items.map((item) => (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors touch-manipulation ${
                          location.pathname.startsWith(item.href)
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
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
    </>
  );
}
