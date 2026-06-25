import { Helmet } from "react-helmet-async";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProjectWorkspaceTabs } from "@/components/projects/ProjectWorkspaceTabs";

export default function ProjectWorkspacePage() {
  return (
    <MainLayout>
      <Helmet>
        <title>Project Workspace | RCollab</title>
        <meta name="description" content="Manage project overview, milestones, tasks, files, team, funding labels, and activity in one workspace." />
      </Helmet>

      <div className="container max-w-6xl px-4 py-6">
        <ProjectWorkspaceTabs />
      </div>
    </MainLayout>
  );
}
