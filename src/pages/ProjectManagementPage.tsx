import { MainLayout } from "@/components/layout/MainLayout";
import { ProjectManagementDashboard } from "@/components/platform";

export default function ProjectManagementPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Project Management</h1>
          <p className="text-muted-foreground mt-2">
            Track projects, sprints, and time across your work
          </p>
        </div>
        
        <ProjectManagementDashboard />
      </div>
    </MainLayout>
  );
}
