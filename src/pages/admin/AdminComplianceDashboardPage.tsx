import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { KPICard } from "@/components/fyp/KPICard";
import { HealthBadge } from "@/components/fyp/HealthBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, FileCheck, AlertTriangle, DollarSign, Scale, Eye, CheckCircle, XCircle, Clock } from "lucide-react";

// Mock data
const kycQueue = [
  { id: "1", name: "TechCorp Inc", type: "sponsor", status: "under_review", submitted: "2026-02-15", level: "enhanced" },
  { id: "2", name: "Dr. Sarah Khan", type: "faculty", status: "pending", submitted: "2026-02-14", level: "basic" },
  { id: "3", name: "Ali Ahmed", type: "student", status: "approved", submitted: "2026-02-10", level: "basic" },
  { id: "4", name: "InnoVentures Ltd", type: "sponsor", status: "rejected", submitted: "2026-02-08", level: "full" },
];

const escrowLogs = [
  { id: "1", fyp: "AI Health Monitor", sponsor: "TechCorp", action: "funded", amount: 250000, actor: "TechCorp Admin", date: "2026-02-15" },
  { id: "2", fyp: "Smart Campus", sponsor: "EduTech", action: "milestone_released", amount: 50000, actor: "Dr. Khan", date: "2026-02-14" },
  { id: "3", fyp: "FinTrack App", sponsor: "PaySoft", action: "disputed", amount: 75000, actor: "Student Team", date: "2026-02-12" },
  { id: "4", fyp: "GreenEnergy IoT", sponsor: "EcoPower", action: "escrow_locked", amount: 180000, actor: "System", date: "2026-02-11" },
];

const disputes = [
  { id: "1", fyp: "FinTrack App", type: "quality_issue", status: "faculty_mediation", initiated: "Ali", respondent: "PaySoft", date: "2026-02-12" },
  { id: "2", fyp: "DataViz Platform", type: "deadline_breach", status: "initiated", initiated: "SoftCo", respondent: "Team B", date: "2026-02-10" },
];

const riskScores = [
  { id: "1", sponsor: "TechCorp Inc", score: 12, consistency: 92, disputes: 95, delays: 88, abandonment: 100 },
  { id: "2", sponsor: "PaySoft Ltd", score: 45, consistency: 60, disputes: 40, delays: 55, abandonment: 75 },
  { id: "3", sponsor: "EcoPower", score: 8, consistency: 95, disputes: 100, delays: 90, abandonment: 100 },
];

const ipContracts = [
  { id: "1", fyp: "AI Health Monitor", model: "shared", sponsor: "TechCorp", status: "active", signed: true },
  { id: "2", fyp: "Smart Campus", model: "sponsor_owned", sponsor: "EduTech", status: "pending_signatures", signed: false },
  { id: "3", fyp: "FinTrack App", model: "student_owned", sponsor: "PaySoft", status: "draft", signed: false },
];

const statusBadge = (status: string) => {
  const map: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
    pending: { variant: "outline", label: "Pending" },
    under_review: { variant: "secondary", label: "Under Review" },
    approved: { variant: "default", label: "Approved" },
    rejected: { variant: "destructive", label: "Rejected" },
    initiated: { variant: "outline", label: "Initiated" },
    evidence_submitted: { variant: "secondary", label: "Evidence" },
    faculty_mediation: { variant: "secondary", label: "Faculty Mediation" },
    admin_arbitration: { variant: "destructive", label: "Admin Arbitration" },
    resolved: { variant: "default", label: "Resolved" },
    active: { variant: "default", label: "Active" },
    pending_signatures: { variant: "outline", label: "Pending Signatures" },
    draft: { variant: "secondary", label: "Draft" },
  };
  const config = map[status] || { variant: "outline" as const, label: status };
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

const actionBadge = (action: string) => {
  const map: Record<string, string> = {
    funded: "bg-success/10 text-success",
    escrow_locked: "bg-primary/10 text-primary",
    milestone_released: "bg-success/10 text-success",
    disputed: "bg-critical/10 text-critical",
    refunded: "bg-warning/10 text-warning",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${map[action] || "bg-muted text-muted-foreground"}`}>
      {action.replace(/_/g, " ")}
    </span>
  );
};

export default function AdminComplianceDashboardPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Compliance & Trust Center</h1>
          <p className="text-sm text-muted-foreground mt-1">KYC verifications, escrow auditing, IP contracts, disputes & risk monitoring</p>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <KPICard title="Active Escrows" value="12" icon={DollarSign} trend="up" trendValue="+3" />
          <KPICard title="Pending KYC" value="4" icon={Shield} trend="neutral" trendValue="0" />
          <KPICard title="Contracts Signed" value="18" icon={FileCheck} trend="up" trendValue="+5" />
          <KPICard title="Open Disputes" value="2" icon={AlertTriangle} trend="down" trendValue="-1" />
          <KPICard title="High-Risk Sponsors" value="1" icon={Scale} trend="neutral" trendValue="0" />
          <KPICard title="Incomplete IP" value="3" icon={Eye} trend="down" trendValue="-2" />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="kyc" className="space-y-4">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="kyc">KYC Queue</TabsTrigger>
            <TabsTrigger value="escrow">Escrow Audit</TabsTrigger>
            <TabsTrigger value="contracts">IP Contracts</TabsTrigger>
            <TabsTrigger value="disputes">Disputes</TabsTrigger>
            <TabsTrigger value="risk">Sponsor Risk</TabsTrigger>
          </TabsList>

          {/* KYC Tab */}
          <TabsContent value="kyc">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">KYC Verification Queue</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Entity</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {kycQueue.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">{item.type}</Badge>
                        </TableCell>
                        <TableCell className="capitalize text-sm text-muted-foreground">{item.level}</TableCell>
                        <TableCell>{statusBadge(item.status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{item.submitted}</TableCell>
                        <TableCell>
                          {item.status === "pending" || item.status === "under_review" ? (
                            <div className="flex gap-1.5">
                              <Button size="sm" variant="default" className="h-7 text-xs"><CheckCircle className="h-3 w-3 mr-1" />Approve</Button>
                              <Button size="sm" variant="destructive" className="h-7 text-xs"><XCircle className="h-3 w-3 mr-1" />Reject</Button>
                            </div>
                          ) : (
                            <Button size="sm" variant="ghost" className="h-7 text-xs"><Eye className="h-3 w-3 mr-1" />View</Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Escrow Audit Tab */}
          <TabsContent value="escrow">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Escrow Audit Trail</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>FYP</TableHead>
                      <TableHead>Sponsor</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead className="text-right">Amount (PKR)</TableHead>
                      <TableHead>Actor</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {escrowLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">{log.fyp}</TableCell>
                        <TableCell className="text-sm">{log.sponsor}</TableCell>
                        <TableCell>{actionBadge(log.action)}</TableCell>
                        <TableCell className="text-right font-mono text-sm">{log.amount.toLocaleString()}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{log.actor}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{log.date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* IP Contracts Tab */}
          <TabsContent value="contracts">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">IP Contracts</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>FYP</TableHead>
                      <TableHead>IP Model</TableHead>
                      <TableHead>Sponsor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Signed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ipContracts.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.fyp}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">{c.model.replace(/_/g, " ")}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">{c.sponsor}</TableCell>
                        <TableCell>{statusBadge(c.status)}</TableCell>
                        <TableCell>
                          {c.signed ? (
                            <CheckCircle className="h-4 w-4 text-success" />
                          ) : (
                            <Clock className="h-4 w-4 text-muted-foreground" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Disputes Tab */}
          <TabsContent value="disputes">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Active Disputes</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>FYP</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Initiated By</TableHead>
                      <TableHead>Respondent</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {disputes.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell className="font-medium">{d.fyp}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">{d.type.replace(/_/g, " ")}</Badge>
                        </TableCell>
                        <TableCell>{statusBadge(d.status)}</TableCell>
                        <TableCell className="text-sm">{d.initiated}</TableCell>
                        <TableCell className="text-sm">{d.respondent}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{d.date}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" className="h-7 text-xs">
                            <Scale className="h-3 w-3 mr-1" />Arbitrate
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Risk Tab */}
          <TabsContent value="risk">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sponsor Risk Scores</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sponsor</TableHead>
                      <TableHead>Risk Score</TableHead>
                      <TableHead>Funding Consistency</TableHead>
                      <TableHead>Dispute History</TableHead>
                      <TableHead>Approval Delays</TableHead>
                      <TableHead>Abandonment</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {riskScores.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.sponsor}</TableCell>
                        <TableCell>
                          <HealthBadge
                            level={r.score <= 20 ? "healthy" : r.score <= 50 ? "at-risk" : "critical"}
                            score={r.score}
                          />
                        </TableCell>
                        <TableCell className="font-mono text-sm">{r.consistency}%</TableCell>
                        <TableCell className="font-mono text-sm">{r.disputes}%</TableCell>
                        <TableCell className="font-mono text-sm">{r.delays}%</TableCell>
                        <TableCell className="font-mono text-sm">{r.abandonment}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
