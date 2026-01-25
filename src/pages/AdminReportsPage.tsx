import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Flag, CheckCircle, XCircle, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface Report {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  thread_id: string | null;
  message_id: string | null;
  reason: string;
  description: string | null;
  status: string;
  created_at: string;
  reporter_name?: string;
  reported_name?: string;
}

export default function AdminReportsPage() {
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "resolved" | "all">("pending");

  useEffect(() => {
    fetchReports();
  }, [filter]);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      let query = supabase.from("reports").select("*").order("created_at", { ascending: false });
      
      if (filter !== "all") {
        query = query.eq("status", filter === "pending" ? "pending" : "resolved");
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch user names
      const userIds = [...new Set(data?.flatMap(r => [r.reporter_id, r.reported_user_id]) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);

      const enriched = data?.map(r => ({
        ...r,
        reporter_name: profileMap.get(r.reporter_id) || "Unknown",
        reported_name: profileMap.get(r.reported_user_id) || "Unknown",
      })) || [];

      setReports(enriched);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (reportId: string, status: "resolved" | "dismissed") => {
    try {
      const { error } = await supabase
        .from("reports")
        .update({ status, resolved_at: new Date().toISOString() })
        .eq("id", reportId);

      if (error) throw error;
      toast({ title: `Report ${status}` });
      fetchReports();
    } catch (err) {
      toast({ title: "Failed to update", variant: "destructive" });
    }
  };

  const reasonColors: Record<string, string> = {
    spam: "bg-yellow-500/10 text-yellow-600",
    harassment: "bg-red-500/10 text-red-600",
    fake: "bg-orange-500/10 text-orange-600",
    offensive: "bg-purple-500/10 text-purple-600",
    other: "bg-gray-500/10 text-gray-600",
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">Review user reports</p>
        </div>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6 h-32" />
              </Card>
            ))}
          </div>
        ) : reports.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Flag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold">No reports</h3>
              <p className="text-muted-foreground">No reports to review</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {reports.map(report => (
              <Card key={report.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={reasonColors[report.reason]}>{report.reason}</Badge>
                        <Badge variant={report.status === "pending" ? "secondary" : "outline"}>
                          {report.status}
                        </Badge>
                      </div>
                      <p className="text-sm">
                        <strong>{report.reporter_name}</strong> reported{" "}
                        <strong>{report.reported_name}</strong>
                      </p>
                      {report.description && (
                        <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(new Date(report.created_at), "MMM d, yyyy h:mm a")}
                      </p>
                    </div>
                    
                    {report.status === "pending" && (
                      <div className="flex gap-2 shrink-0">
                        {report.thread_id && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={`/messages/${report.thread_id}`}><Eye className="h-4 w-4" /></a>
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => updateStatus(report.id, "dismissed")}>
                          <XCircle className="h-4 w-4" />
                        </Button>
                        <Button size="sm" onClick={() => updateStatus(report.id, "resolved")}>
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}