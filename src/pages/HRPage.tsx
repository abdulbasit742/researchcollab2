import { MainLayout } from "@/components/layout/MainLayout";
import { RecruitmentDashboard } from "@/components/platform";

export default function HRPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">HR & Talent Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage recruitment, job postings, and team performance
          </p>
        </div>
        
        <RecruitmentDashboard />
      </div>
    </MainLayout>
  );
}
