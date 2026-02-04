import { Navbar } from "@/components/layout/Navbar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { AutomationDashboard } from "@/components/platform";

export default function AutomationPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 pb-20 md:pb-8">
        <AutomationDashboard />
      </main>
      <MobileBottomNav />
    </div>
  );
}
