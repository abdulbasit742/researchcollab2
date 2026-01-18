import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { FloatingSupportChat } from "@/components/support/FloatingSupportChat";
import { MobileBottomNav } from "./MobileBottomNav";
import { useIsMobile } from "@/hooks/use-mobile";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const isMobile = useIsMobile();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className={`flex-1 ${isMobile ? 'pb-16' : ''}`}>{children}</main>
      {!isMobile && <Footer />}
      <FloatingSupportChat />
      <MobileBottomNav />
    </div>
  );
}
