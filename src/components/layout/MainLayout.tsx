import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { FloatingSupportChat } from "@/components/support/FloatingSupportChat";
import { MobileBottomNav } from "./MobileBottomNav";
import { useIsMobile } from "@/hooks/use-mobile";
import { FloatingNudgeIndicator } from "@/components/ambient";
import { useAmbientIntelligence } from "@/hooks/useAmbientIntelligence";
import { useAuth } from "@/contexts/AuthContext";
import { GlobalAIChatButton } from "@/components/ai/GlobalAIChatButton";
import { SwipeBackNavigator } from "@/components/mobile/SwipeBackNavigator";
import { PWAInstallBanner } from "@/components/pwa/PWAInstallBanner";
import { ScrollProgress } from "@/components/ui/scroll-progress";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { unreadCount, highPriorityCount } = useAmbientIntelligence();

  return (
    <div className="flex min-h-[100dvh] flex-col overflow-x-hidden">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-primary focus:text-primary-foreground focus:text-sm focus:font-medium focus:shadow-lg"
      >
        Skip to main content
      </a>
      <ScrollProgress />
      <Navbar />
      <main id="main-content" tabIndex={-1} className={`flex-1 outline-none ${isMobile ? 'pb-20' : ''}`}>
        <SwipeBackNavigator>{children}</SwipeBackNavigator>
      </main>
      {!isMobile && <Footer />}
      <FloatingSupportChat />
      <GlobalAIChatButton />
      <MobileBottomNav />
      <PWAInstallBanner />
      {user && (unreadCount > 0 || highPriorityCount > 0) && (
        <FloatingNudgeIndicator 
          count={unreadCount} 
          highPriorityCount={highPriorityCount} 
        />
      )}
    </div>
  );
}
