import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  DEMO_ORDER_WORKROOM,
  getOrderWorkroomCounts,
  getOrderWorkroomItemStatusClass,
  getOrderWorkroomItemStatusLabel,
  getOrderWorkroomStatusClass,
  getOrderWorkroomStatusLabel,
  type OrderWorkroom,
  type OrderWorkroomFile,
  type OrderWorkroomMessage,
  type OrderWorkroomMilestone,
} from "@/config/orderWorkroom";
import { CheckCircle2, FileText, Lock, MessageSquareText, PackageCheck, ShieldCheck, Workflow, type LucideIcon } from "lucide-react";

type OrderWorkroomPanelProps = {
  workroom?: OrderWorkroom;
};

export function OrderWorkroomPanel({ workroom = DEMO_ORDER_WORKROOM }: OrderWorkroomPanelProps) {
  const counts = getOrderWorkroomCounts(workroom);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-5">
        <MetricCard label="Progress" value={`${workroom.progress}%`} helper="Workroom status" danger={workroom.progress < 60} />
        <MetricCard label="Messages" value={counts.messages.toString()} helper="Thread notes" />
        <MetricCard label="Milestones" value={counts.milestones.toString()} helper="Order stages" />
        <MetricCard label="Files" value={counts.files.toString()} helper="Shared docs" />
        <MetricCard label="Blocked" value={counts.blocked.toString()} helper="Needs action" danger={counts.blocked > 0} />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={getOrderWorkroomStatusClass(workroom.status)}>{getOrderWorkroomStatusLabel(workroom.status)}</Badge>
                <Badge variant="outline">{workroom.packageLabel}</Badge>
              </div>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="h-5 w-5 text-primary" />
                Workroom for Orders
              </CardTitle>
              <CardDescription>
                Shared order workspace for buyer-seller communication, milestones, files, action checks, and delivery readiness.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <MessageSquareText className="mr-2 h-4 w-4" /> Send Message
              </Button>
              <Button disabled>
                <Lock className="mr-2 h-4 w-4" /> Submit Delivery
              </Button>
            </div>
          </div>
          <div className="pt-2">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Order workroom progress</span>
              <span>{workroom.progress}%</span>
            </div>
            <Progress value={workroom.progress} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            Demo workroom only: real order rooms should store permissions, message logs, file versions, delivery approvals, refund/dispute states, and payment-safe audit history.
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <InfoCard label="Order" value={workroom.orderTitle} />
            <InfoCard label="Buyer" value={workroom.buyerName} />
            <InfoCard label="Seller" value={workroom.sellerName} />
          </div>

          <div className="rounded-lg border bg-primary/5 p-4 text-sm">
            <p className="flex items-center gap-2 font-medium">
              <ShieldCheck className="h-4 w-4 text-primary" /> Next Action
            </p>
            <p className="mt-1 text-muted-foreground">{workroom.nextAction}</p>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <MessagesList messages={workroom.messages} />
            <MilestonesList milestones={workroom.milestones} />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <FilesList files={workroom.files} />
            <Checklist title="Workroom Rules" icon={CheckCircle2} items={workroom.actionChecklist} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MessagesList({ messages }: { messages: OrderWorkroomMessage[] }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <MessageSquareText className="h-4 w-4 text-primary" /> Messages
      </p>
      <div className="mt-3 space-y-3">
        {messages.map((message) => (
          <div key={message.id} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{message.role}</Badge>
              <p className="font-medium">{message.author}</p>
              <p className="text-xs text-muted-foreground">{message.timeLabel}</p>
            </div>
            <p className="mt-2 text-muted-foreground">{message.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MilestonesList({ milestones }: { milestones: OrderWorkroomMilestone[] }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <PackageCheck className="h-4 w-4 text-primary" /> Milestones
      </p>
      <div className="mt-3 space-y-3">
        {milestones.map((milestone) => (
          <div key={milestone.id} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={getOrderWorkroomItemStatusClass(milestone.status)}>{getOrderWorkroomItemStatusLabel(milestone.status)}</Badge>
              <p className="font-medium">{milestone.title}</p>
              <p className="text-xs text-muted-foreground">{milestone.dueLabel}</p>
            </div>
            <p className="mt-2 text-muted-foreground">{milestone.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function FilesList({ files }: { files: OrderWorkroomFile[] }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <FileText className="h-4 w-4 text-primary" /> Shared Files
      </p>
      <div className="mt-3 space-y-3">
        {files.map((file) => (
          <div key={file.id} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={getOrderWorkroomItemStatusClass(file.status)}>{getOrderWorkroomItemStatusLabel(file.status)}</Badge>
              <p className="font-medium">{file.name}</p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{file.typeLabel} · {file.owner}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Checklist({ title, icon: Icon, items }: { title: string; icon: LucideIcon; items: string[] }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <Icon className="h-4 w-4 text-primary" /> {title}
      </p>
      <div className="mt-2 space-y-2">
        {items.map((item) => (
          <p key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" /> {item}
          </p>
        ))}
      </div>
    </div>
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

function MetricCard({ label, value, helper, danger = false }: { label: string; value: string; helper: string; danger?: boolean }) {
  return (
    <Card className={danger ? "border-amber-500/30" : undefined}>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`mt-1 text-2xl font-bold ${danger ? "text-amber-600" : ""}`}>{value}</p>
        <p className="text-xs text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}
