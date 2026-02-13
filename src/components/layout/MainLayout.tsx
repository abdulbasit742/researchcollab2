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

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { unreadCount, highPriorityCount } = useAmbientIntelligence();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className={`flex-1 ${isMobile ? 'pb-20' : ''}`}>
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
