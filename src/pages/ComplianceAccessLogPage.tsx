import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, FileText, Download, User } from "lucide-react";

interface AccessLogEntry {
  id: string;
  user_id: string | null;
  institution_id: string | null;
  entity_type: string;
  entity_id: string | null;
  access_type: string;
  created_at: string;
}

const DEMO_INSTITUTION_ID = "00000000-0000-0000-0000-000000000001";

export default function ComplianceAccessLogPage() {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["data-access-log", DEMO_INSTITUTION_ID],
    queryFn: async (): Promise<AccessLogEntry[]> => {
      const { data } = await supabase
        .from("data_access_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      return (data ?? []) as AccessLogEntry[];
    },
    staleTime: 2 * 60 * 1000,
  });

  const accessIcons: Record<string, React.ElementType> = {
    read: Eye,
    write: FileText,
    export: Download,
  };

  return (
    <div className="min-h-screen bg-background p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Eye className="h-6 w-6 text-primary" />
          Data Access Log
        </h1>
        <p className="text-sm text-muted-foreground">Transparent record of all data access events</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Access Events ({logs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground text-center py-8">Loading access log...</p>
          ) : logs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No access events recorded yet.</p>
          ) : (
            <div className="space-y-1 max-h-[600px] overflow-y-auto">
              {logs.map((log) => {
                const Icon = accessIcons[log.access_type] ?? Eye;
                return (
                  <div key={log.id} className="flex items-center gap-3 p-2.5 rounded text-sm hover:bg-muted/30">
                    <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-foreground">{log.entity_type}</span>
                      {log.entity_id && (
                        <span className="text-muted-foreground text-xs ml-1">({log.entity_id.slice(0, 8)}...)</span>
                      )}
                    </div>
                    <Badge variant="outline" className="text-[10px] shrink-0">{log.access_type}</Badge>
                    <div className="flex items-center gap-1 shrink-0">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">
                        {log.user_id?.slice(0, 8) ?? "system"}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
