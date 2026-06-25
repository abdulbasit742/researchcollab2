import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { VoiceSearchButton } from "@/components/search/VoiceSearchButton";
import { AccountStatusBadge } from "@/components/account/AccountStatusBadge";
import { useAuth } from "@/contexts/AuthContext";
import { getRoleDashboardPath, getRoleLabel } from "@/config/roles";
import {
  getPrimaryRoleNavItems,
  getRoleNavGroups,
  type NavIconKey,
} from "@/config/navigation";
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
  ShieldCheck,
  Building2,
  Landmark,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { KeyboardShortcutsHelp } from "@/components/navigation/KeyboardShortcutsHelp";
import { UserAvatarMenu } from "@/components/layout/UserAvatarMenu";
import { AnnouncementBanner } from "@/components/layout/AnnouncementBanner";

const navIconMap: Record<NavIconKey, LucideIcon> = {
  home: Home,
  projects: FolderKanban,
  opportunities: Target,
  messages: MessageSquare,
  research: FileText,
  reviews: ClipboardCheck,
  search: Search,
  discover: BarChart3,
  grants: Handshake,
  admin: ShieldCheck,
  institution: Building2,
  sponsor: Handshake,
  governance: ShieldCheck,
  national: Landmark,
  wallet: Wallet,
};

const isActiveRoute = (pathname: string, href: string) => {
  if (href === "/") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
};

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { user, profile, userRole, signOut } = useAuth();
  const navigate = useNavigate();
  const currentRole = userRole?.role;
  const dashboardHref = getRoleDashboardPath(currentRole);
  const primaryNav = getPrimaryRoleNavItems(currentRole, 6);
  const mobileNavGroups = getRoleNavGroups(currentRole);

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
        <Link to={user ? dashboardHref : "/"} className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <GraduationCap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold">
            <span className="text-primary">RCollab</span>
          </span>
        </Link>

        {/* Desktop Navigation — Role aware */}
        {user && (
          <nav className="hidden lg:flex items-center gap-1">
            {primaryNav.map((item) => {
              const Icon = navIconMap[item.icon];
              const active = isActiveRoute(location.pathname, item.href);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-2">
          {user && (
            <>
              <div className="hidden xl:flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1.5">
                <span className="text-xs font-medium text-muted-foreground">{getRoleLabel(currentRole)}</span>
                <AccountStatusBadge status={profile?.account_status} />
              </div>
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

      {/* Mobile Navigation — Role aware grouped */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t bg-background overflow-y-auto max-h-[70vh]"
          >
            <div className="container py-3 px-4 space-y-4">
              {user && (
                <div className="rounded-lg border bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">Signed in as</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">{getRoleLabel(currentRole)}</span>
                    <AccountStatusBadge status={profile?.account_status} />
                  </div>
                </div>
              )}

              {user && mobileNavGroups.map((group) => (
                <div key={group.label}>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 mb-1">
                    {group.label}
                  </p>
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const Icon = navIconMap[item.icon];
                      const active = isActiveRoute(location.pathname, item.href);
                      return (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors touch-manipulation ${
                            active
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </Link>
                      );
                    })}
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
