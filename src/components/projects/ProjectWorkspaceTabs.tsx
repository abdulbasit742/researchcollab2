import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AbstractGeneratorPanel } from "@/components/projects/AbstractGeneratorPanel";
import { AIToolsHub } from "@/components/projects/AIToolsHub";
import { CitationWarningSystem } from "@/components/projects/CitationWarningSystem";
import { DocumentExportPlaceholder } from "@/components/projects/DocumentExportPlaceholder";
import { EvidenceLinkingSystem } from "@/components/projects/EvidenceLinkingSystem";
import { FYPFinalReportBuilder } from "@/components/projects/FYPFinalReportBuilder";
import { LiteratureReviewAssistantPanel } from "@/components/projects/LiteratureReviewAssistantPanel";
import { LiteratureReviewMatrix } from "@/components/projects/LiteratureReviewMatrix";
import { MethodologyAssistantPanel } from "@/components/projects/MethodologyAssistantPanel";
import { MethodologyBuilder } from "@/components/projects/MethodologyBuilder";
import { MilestoneManager } from "@/components/projects/MilestoneManager";
import { ProjectActivityTimeline } from "@/components/projects/ProjectActivityTimeline";
import { ProjectHealthScoreCard } from "@/components/projects/ProjectHealthScoreCard";
import { ProjectRiskAlerts } from "@/components/projects/ProjectRiskAlerts";
import { ReportSectionStatusTracker } from "@/components/projects/ReportSectionStatusTracker";
import { ResearchGapFinderPanel } from "@/components/projects/ResearchGapFinderPanel";
import { ResearchProposalBuilder } from "@/components/projects/ResearchProposalBuilder";
import { SupervisorInvitePanel } from "@/components/projects/SupervisorInvitePanel";
import { SupervisorSectionCommentsPanel } from "@/components/projects/SupervisorSectionCommentsPanel";
import { TaskManager } from "@/components/projects/TaskManager";
import { TeamMemberInvitePanel } from "@/components/projects/TeamMemberInvitePanel";
import { VersionHistoryPanel } from "@/components/projects/VersionHistoryPanel";
import { VivaPrepAssistantPanel } from "@/components/projects/VivaPrepAssistantPanel";
import {
  DEMO_PROJECT_WORKSPACE,
  PROJECT_WORKSPACE_TABS,
  getProjectWorkspaceStatusClass,
  getProjectWorkspaceStatusLabel,
  type ProjectWorkspaceSummary,
} from "@/config/projectWorkspace";
import {
  Activity,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  DollarSign,
  FileText,
  FolderOpen,
  Milestone,
  Users,
  type LucideIcon,
} from "lucide-react";

const tabIconMap: Record<string, LucideIcon> = {
  overview: FolderOpen,
  milestones: Milestone,
  tasks: ClipboardList,
  files: FileText,
  team: Users,
  funding: DollarSign,
  activity: Activity,
};

type ProjectWorkspaceTabsProps = {
  project?: ProjectWorkspaceSummary;
};

export function ProjectWorkspaceTabs({ project = DEMO_PROJECT_WORKSPACE }: ProjectWorkspaceTabsProps) {
  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{project.type}</Badge>
                <Badge className={getProjectWorkspaceStatusClass(project.status)}>
                  {getProjectWorkspaceStatusLabel(project.status)}
                </Badge>
                <Badge variant="secondary">Risk: {project.riskLevel}</Badge>
              </div>
              <CardTitle className="text-2xl">{project.title}</CardTitle>
              <CardDescription>
                {project.department} · {project.timeline} · {project.budgetLabel}
              </CardDescription>
            </div>
            <div className="min-w-48 rounded-lg border bg-background/70 p-4">
              <p className="text-xs text-muted-foreground">Workspace Progress</p>
              <div className="mt-2 flex items-center gap-3">
                <Progress value={project.progress} className="h-2" />
                <span className="text-sm font-semibold">{project.progress}%</span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="flex h-auto flex-wrap justify-start gap-2 bg-muted/40 p-2">
          {PROJECT_WORKSPACE_TABS.map((tab) => {
            const Icon = tabIconMap[tab.id];
            return (
              <TabsTrigger key={tab.id} value={tab.id} className="gap-2 data-[state=active]:bg-background">
                <Icon className="h-4 w-4" />
                {tab.label}
                {tab.badge ? <Badge variant="secondary" className="text-[10px]">{tab.badge}</Badge> : null}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <ProjectHealthScoreCard project={project} />
          <ProjectRiskAlerts project={project} />
          <AIToolsHub />
          <ResearchGapFinderPanel />
          <LiteratureReviewAssistantPanel />
          <AbstractGeneratorPanel />
          <MethodologyAssistantPanel />
          <VivaPrepAssistantPanel />
          <WorkspacePanel
            icon={FolderOpen}
            title="Project Overview"
            description="Scope, owner, project type, readiness, and key execution context."
          >
            <div className="grid gap-4 md:grid-cols-3">
              <InfoCard label="Owner" value={project.owner} />
              <InfoCard label="Timeline" value={project.timeline} />
              <InfoCard label="Budget" value={project.budgetLabel} />
            </div>
            <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
              This overview is the workspace home. Next features will connect this to real project records, health scoring, AI tools, research gap finding, literature review drafting, abstract generation, methodology assistance, viva prep, and report builders.
            </div>
          </WorkspacePanel>
        </TabsContent>

        <TabsContent value="milestones">
          <MilestoneManager />
        </TabsContent>

        <TabsContent value="tasks">
          <TaskManager />
        </TabsContent>

        <TabsContent value="files" className="space-y-4">
          <ReportSectionStatusTracker />
          <SupervisorSectionCommentsPanel />
          <VersionHistoryPanel />
          <CitationWarningSystem />
          <EvidenceLinkingSystem />
          <DocumentExportPlaceholder />
          <FYPFinalReportBuilder />
          <ResearchProposalBuilder />
          <LiteratureReviewMatrix />
          <MethodologyBuilder />
          <WorkspacePanel
            icon={FileText}
            title="Files & Evidence"
            description="Attach reports, datasets, screenshots, videos, references, and final deliverables."
          >
            <PlaceholderList
              items={[
                "Proposal / problem brief",
                "Literature matrix or technical specification",
                "Citation warnings and reference checks",
                "Evidence links and claim support",
                "PDF/DOCX export package readiness",
                "Methodology and validation plan",
                "Supervisor comments and response notes",
                "Version history snapshots",
                "Demo screenshots and test evidence",
                "Final report and handover package",
              ]}
            />
          </WorkspacePanel>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <SupervisorInvitePanel />
          <TeamMemberInvitePanel />
          <WorkspacePanel
            icon={Users}
            title="Team"
            description="Manage students, researchers, supervisors, sponsors, and invited reviewers."
          >
            <PlaceholderList
              items={[
                "Project owner",
                "Student/research team",
                "Supervisor or reviewer",
                "Sponsor or institution contact",
              ]}
            />
          </WorkspacePanel>
        </TabsContent>

        <TabsContent value="funding">
          <WorkspacePanel
            icon={DollarSign}
            title="Funding & Demo Labels"
            description="Track budget, demo contribution records, milestone releases, and safety labels."
          >
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
              Demo-safe mode: this workspace does not move real funds. Real payment, escrow, or payout flows require verified accounts, policy review, and production payment setup.
            </div>
            <PlaceholderList
              items={["Budget estimate", "Milestone release labels", "Contribution ledger", "Sponsor review notes"]}
            />
          </WorkspacePanel>
        </TabsContent>

        <TabsContent value="activity">
          <ProjectActivityTimeline />
        </TabsContent>
      </Tabs>
    </div>
  );
}

type WorkspacePanelProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  children: ReactNode;
};

function WorkspacePanel({ icon: Icon, title, description, children }: WorkspacePanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}

function PlaceholderList({ items }: { items: string[] }) {
  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <div key={item} className="flex items-center gap-3 rounded-lg border p-3 text-sm">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <span>{item}</span>
          <CalendarDays className="ml-auto h-4 w-4 text-muted-foreground" />
        </div>
      ))}
    </div>
  );
}
