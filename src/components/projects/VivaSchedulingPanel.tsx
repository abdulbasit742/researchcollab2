import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CalendarClock, Clock3, Lock, MapPin, ShieldCheck, UserCheck, Video } from "lucide-react";

const vivaSlots = [
  { id: "slot-1", team: "Smart Lab Assistant for FYP Teams", date: "Mon · 10:00 AM", mode: "Room A-204", status: "Ready", readiness: 82, panel: "Dr. Supervisor Preview, Dr. Data Systems", note: "Prototype demo and budget evidence need final review before slot lock." },
  { id: "slot-2", team: "Prototype Validation Kit", date: "Mon · 12:00 PM", mode: "Lab Review Room", status: "Blocked", readiness: 48, panel: "Dr. Lab Coordinator, Dr. Methods Lead", note: "Equipment usage plan and validation evidence are incomplete." },
  { id: "slot-3", team: "Defense Readiness Pack", date: "Tue · 09:30 AM", mode: "Online Viva", status: "Confirmed", readiness: 94, panel: "Dr. Supervisor Preview, External Reviewer", note: "Mock viva notes and final report sections are ready." },
  { id: "slot-4", team: "AI Literature Helper", date: "Tue · 11:30 AM", mode: "Room B-112", status: "Needs Review", readiness: 67, panel: "Dr. Methods Lead, Dr. Data Systems", note: "Literature matrix changes are requested before final schedule confirmation." },
];

const panelMembers = [
  { name: "Dr. Supervisor Preview", role: "Primary Supervisor", load: 3, status: "Busy" },
  { name: "Dr. Data Systems", role: "Technical Reviewer", load: 2, status: "Available" },
  { name: "Dr. Lab Coordinator", role: "Lab Reviewer", load: 4, status: "Overloaded" },
  { name: "External Reviewer", role: "External Panel", load: 1, status: "Available" },
];

const scheduleChecks = [
  { label: "Student team availability", status: "Ready", helper: "Three teams have confirmed demo availability." },
  { label: "Panel member conflicts", status: "Needs Review", helper: "One reviewer has overlapping review load." },
  { label: "Room / online link", status: "Needs Review", helper: "Two room bookings need final confirmation." },
  { label: "Evidence readiness", status: "Blocked", helper: "One team has missing validation evidence." },
  { label: "Notification audit", status: "Missing", helper: "Production notifications and audit logs are not connected yet." },
];

const statusClass = (status: string) => {
  if (status === "Ready" || status === "Confirmed" || status === "Available") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "Needs Review" || status === "Busy") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  if (status === "Blocked" || status === "Missing" || status === "Overloaded") return "bg-red-500/10 text-red-600 border-red-500/30";
  return "bg-muted text-muted-foreground border-border";
};

export function VivaSchedulingPanel() {
  const confirmed = vivaSlots.filter((slot) => slot.status === "Confirmed" || slot.status === "Ready").length;
  const blocked = vivaSlots.filter((slot) => slot.status === "Blocked").length;
  const reviewNeeded = vivaSlots.filter((slot) => slot.status === "Needs Review").length;
  const averageReadiness = Math.round(vivaSlots.reduce((total, slot) => total + slot.readiness, 0) / vivaSlots.length);
  const overloadedPanel = panelMembers.filter((member) => member.status === "Overloaded").length;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-6">
        <MetricCard label="Slots" value={vivaSlots.length.toString()} helper="Demo schedule" />
        <MetricCard label="Ready" value={confirmed.toString()} helper="Can confirm" />
        <MetricCard label="Review" value={reviewNeeded.toString()} helper="Needs checks" danger={reviewNeeded > 0} />
        <MetricCard label="Blocked" value={blocked.toString()} helper="Cannot lock" danger={blocked > 0} />
        <MetricCard label="Avg Ready" value={`${averageReadiness}%`} helper="Evidence score" />
        <MetricCard label="Panel Load" value={overloadedPanel.toString()} helper="Overloaded" danger={overloadedPanel > 0} />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <Badge className="bg-primary/10 text-primary border-primary/30">Viva Schedule Preview</Badge>
              <CardTitle className="flex items-center gap-2">
                <CalendarClock className="h-5 w-5 text-primary" /> Defense / Viva Scheduling
              </CardTitle>
              <CardDescription>
                Preview viva slots, panel members, rooms or online mode, readiness scores, conflict checks, and locked schedule actions.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <Clock3 className="mr-2 h-4 w-4" /> Auto Schedule Locked
              </Button>
              <Button disabled>
                <Lock className="mr-2 h-4 w-4" /> Confirm Locked
              </Button>
            </div>
          </div>
          <div className="pt-2">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Average viva readiness</span>
              <span>{averageReadiness}%</span>
            </div>
            <Progress value={averageReadiness} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            Demo viva schedule only. Production scheduling should verify official dates, panel availability, student visibility, room/meeting links, notification delivery, and audit history.
          </div>

          <VivaSlotCards />
          <div className="grid gap-4 xl:grid-cols-2">
            <PanelMembers />
            <ScheduleChecks />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function VivaSlotCards() {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <CalendarClock className="h-4 w-4 text-primary" /> Viva Slots
      </p>
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        {vivaSlots.map((slot) => (
          <div key={slot.id} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={statusClass(slot.status)}>{slot.status}</Badge>
              <Badge variant="outline" className="gap-1"><Clock3 className="h-3 w-3" /> {slot.date}</Badge>
              <Badge variant="secondary" className="gap-1">
                {slot.mode.toLowerCase().includes("online") ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                {slot.mode}
              </Badge>
            </div>
            <p className="mt-2 font-medium">{slot.team}</p>
            <p className="text-xs text-muted-foreground">Panel: {slot.panel}</p>
            <div className="mt-3 space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Readiness</span>
                <span>{slot.readiness}%</span>
              </div>
              <Progress value={slot.readiness} className="h-2" />
            </div>
            <p className="mt-2 text-muted-foreground">{slot.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PanelMembers() {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <UserCheck className="h-4 w-4 text-primary" /> Panel Members
      </p>
      <div className="mt-3 space-y-3">
        {panelMembers.map((member) => (
          <div key={member.name} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={statusClass(member.status)}>{member.status}</Badge>
              <Badge variant="outline">{member.load} slots</Badge>
            </div>
            <p className="mt-2 font-medium">{member.name}</p>
            <p className="text-xs text-muted-foreground">{member.role}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScheduleChecks() {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <ShieldCheck className="h-4 w-4 text-primary" /> Schedule Checks
      </p>
      <div className="mt-3 space-y-3">
        {scheduleChecks.map((check) => (
          <div key={check.label} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={statusClass(check.status)}>{check.status}</Badge>
              <p className="font-medium">{check.label}</p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{check.helper}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricCard({ label, value, helper, danger = false }: { label: string; value: string; helper: string; danger?: boolean }) {
  return (
    <Card className={danger ? "border-amber-500/30" : undefined}>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`mt-1 text-xl font-bold ${danger ? "text-amber-600" : ""}`}>{value}</p>
        <p className="text-xs text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}
