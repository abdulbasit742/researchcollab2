import { Navbar } from "@/components/layout/Navbar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { ProjectManagementDashboard } from "@/components/platform";

export default function ProjectManagementPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 pb-20 md:pb-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Project Management</h1>
          <p className="text-muted-foreground mt-2">
            Track projects, sprints, and time across your work
          </p>
        </div>
        
        <ProjectManagementDashboard />
      </main>
      <MobileBottomNav />
    </div>
  );
}
