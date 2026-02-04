import { Navbar } from "@/components/layout/Navbar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { RecruitmentDashboard } from "@/components/platform";

export default function HRPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 pb-20 md:pb-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">HR & Talent Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage recruitment, job postings, and team performance
          </p>
        </div>
        
        <RecruitmentDashboard />
      </main>
      <MobileBottomNav />
    </div>
  );
}
