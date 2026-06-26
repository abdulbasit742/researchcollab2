import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AuditLogServicePanel } from "@/components/projects/AuditLogServicePanel";
import { Award, CheckCircle2, FileCheck2, Fingerprint, Lock, QrCode, ShieldCheck, Stamp, UserCheck } from "lucide-react";

const certificateRecords = [
  { id: "CERT-RC-001", title: "Research Portfolio Completion", issuer: "Demo Department", status: "Verified", confidence: 92, note: "Portfolio builder, privacy checks, and outcome evidence are linked." },
  { id: "CERT-RC-002", title: "Industry Challenge Participation", issuer: "Demo Industry Partner", status: "Needs Review", confidence: 74, note: "Team approvals and final challenge rules need review." },
  { id: "CERT-RC-003", title: "Skills Gap Sprint", issuer: "Demo Career Cell", status: "Verified", confidence: 88, note: "Learning actions and skill readiness are connected." },
  { id: "CERT-RC-004", title: "Prototype Validation Badge", issuer: "Demo Lab", status: "Pending", confidence: 46, note: "Validation logs and QA proof are still incomplete." },
];

const verificationChecks = [
  { label: "Certificate ID format", status: "Verified", helper: "Demo IDs are structured and readable." },
  { label: "Issuer approval", status: "Needs Review", helper: "Production issuers need verified admin approval." },
  { label: "Evidence linkage", status: "Needs Review", helper: "Attach final portfolio, challenge, and rubric evidence." },
  { label: "Public verify page", status: "Locked", helper: "Public verification lookup is placeholder-only." },
  { label: "Audit trail", status: "Pending", helper: "Issue timestamps and verifier identity are not connected yet." },
];

const statusClass = (status: string) => {
  if (status === "Verified") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "Needs Review" || status === "Pending") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  return "bg-muted text-muted-foreground border-border";
};

export function CertificateVerificationPlaceholderPanel() {
  const verified = certificateRecords.filter((record) => record.status === "Verified").length;
  const reviewItems = [...certificateRecords, ...verificationChecks].filter((item) => item.status === "Needs Review").length;
  const pending = [...certificateRecords, ...verificationChecks].filter((item) => item.status === "Pending").length;
  const averageConfidence = Math.round(certificateRecords.reduce((total, record) => total + record.confidence, 0) / certificateRecords.length);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Certificates" value={certificateRecords.length.toString()} helper="Demo records" />
        <MetricCard label="Verified" value={verified.toString()} helper="Records" />
        <MetricCard label="Review" value={reviewItems.toString()} helper="Items" danger={reviewItems > 0} />
        <MetricCard label="Confidence" value={`${averageConfidence}%`} helper="Average" />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <Badge className="bg-primary/10 text-primary border-primary/30">Verification Preview</Badge>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" /> Certificate Verification Placeholder
              </CardTitle>
              <CardDescription>
                Preview certificate records, issuer checks, verification confidence, QR placeholders, and public lookup readiness.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <QrCode className="mr-2 h-4 w-4" /> QR Locked
              </Button>
              <Button disabled>
                <Lock className="mr-2 h-4 w-4" /> Verify Locked
              </Button>
            </div>
          </div>
          <div className="pt-2">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Verification confidence</span>
              <span>{averageConfidence}%</span>
            </div>
            <Progress value={averageConfidence} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            Demo certificate verification placeholder only. Production verification should validate issuer authority, certificate ownership, anti-tamper records, timestamps, and public lookup permissions.
          </div>
          <CertificateRecords />
          <div className="grid gap-4 xl:grid-cols-2">
            <VerificationChecks pending={pending} />
            <VerificationPreview />
          </div>
        </CardContent>
      </Card>
      <AuditLogServicePanel />
    </div>
  );
}

function CertificateRecords() {
  return <div className="rounded-lg border p-3"><p className="flex items-center gap-2 text-sm font-medium"><FileCheck2 className="h-4 w-4 text-primary" /> Certificate Records</p><div className="mt-3 grid gap-3 lg:grid-cols-2">{certificateRecords.map((record) => <div key={record.id} className="rounded-lg border bg-muted/20 p-3 text-sm"><div className="flex flex-wrap items-center gap-2"><Badge className={statusClass(record.status)}>{record.status}</Badge><Badge variant="outline">{record.id}</Badge></div><p className="mt-2 font-medium">{record.title}</p><p className="text-xs text-muted-foreground">{record.issuer}</p><Progress value={record.confidence} className="mt-3 h-2" /><p className="mt-1 text-xs text-muted-foreground">{record.confidence}% confidence</p><p className="mt-2 text-muted-foreground">{record.note}</p></div>)}</div></div>;
}

function VerificationChecks({ pending }: { pending: number }) {
  return <div className="rounded-lg border p-3"><p className="flex items-center gap-2 text-sm font-medium"><ShieldCheck className="h-4 w-4 text-primary" /> Verification Checks</p><p className="mt-1 text-xs text-muted-foreground">{pending} verification items are still pending.</p><div className="mt-3 space-y-3">{verificationChecks.map((check) => <div key={check.label} className="rounded-lg border bg-muted/20 p-3 text-sm"><div className="flex flex-wrap items-center gap-2"><Badge className={statusClass(check.status)}>{check.status}</Badge><p className="font-medium">{check.label}</p></div><p className="mt-1 text-xs text-muted-foreground">{check.helper}</p></div>)}</div></div>;
}

function VerificationPreview() {
  return <div className="rounded-lg border p-3"><p className="flex items-center gap-2 text-sm font-medium"><Fingerprint className="h-4 w-4 text-primary" /> Public Verify Preview</p><div className="mt-3 grid gap-3 text-sm"><InfoRow icon={Stamp} label="Issuer stamp" value="Placeholder" /><InfoRow icon={UserCheck} label="Owner match" value="Locked" /><InfoRow icon={QrCode} label="QR lookup" value="Locked" /><InfoRow icon={CheckCircle2} label="Audit status" value="Demo only" /></div></div>;
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Stamp; label: string; value: string }) {
  return <div className="flex items-center justify-between rounded-lg border bg-muted/20 p-3"><span className="flex items-center gap-2"><Icon className="h-4 w-4 text-primary" /> {label}</span><Badge variant="outline">{value}</Badge></div>;
}

function MetricCard({ label, value, helper, danger = false }: { label: string; value: string; helper: string; danger?: boolean }) {
  return <Card className={danger ? "border-amber-500/30" : undefined}><CardContent className="p-4"><p className="text-xs text-muted-foreground">{label}</p><p className={`mt-1 text-xl font-bold ${danger ? "text-amber-600" : ""}`}>{value}</p><p className="text-xs text-muted-foreground">{helper}</p></CardContent></Card>;
}
