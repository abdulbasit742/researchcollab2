import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, RotateCcw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Version {
  id: string;
  version_number: number;
  change_summary: string | null;
  word_count: number;
  created_by: string;
  created_at: string;
}

interface VersionHistoryPanelProps {
  documentId: string;
  onRestore: (content: any) => void;
}

export function VersionHistoryPanel({ documentId, onRestore }: VersionHistoryPanelProps) {
  const [versions, setVersions] = useState<Version[]>([]);

  const fetchVersions = useCallback(async () => {
    const { data } = await supabase
      .from("document_versions")
      .select("id, version_number, change_summary, word_count, created_by, created_at")
      .eq("document_id", documentId)
      .order("version_number", { ascending: false });
    if (data) setVersions(data as unknown as Version[]);
  }, [documentId]);

  useEffect(() => { fetchVersions(); }, [fetchVersions]);

  const restore = async (versionId: string) => {
    const { data } = await supabase
      .from("document_versions")
      .select("content")
      .eq("id", versionId)
      .single();
    if (data) onRestore((data as any).content);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <History className="h-3.5 w-3.5" />
          Version History ({versions.length})
        </h4>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {versions.length === 0 && (
            <p className="text-xs text-muted-foreground italic">No versions saved yet</p>
          )}
          {versions.map(v => (
            <div key={v.id} className="rounded-lg border p-2.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium text-xs">v{v.version_number}</span>
                <span className="text-[10px] text-muted-foreground">
                  {formatDistanceToNow(new Date(v.created_at), { addSuffix: true })}
                </span>
              </div>
              {v.change_summary && (
                <p className="text-xs text-muted-foreground mt-1">{v.change_summary}</p>
              )}
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[10px] text-muted-foreground">{v.word_count} words</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 text-[10px] gap-1"
                  onClick={() => restore(v.id)}
                >
                  <RotateCcw className="h-3 w-3" /> Restore
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
