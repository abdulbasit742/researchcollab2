import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { debounce } from "@/lib/utils";

export interface Draft {
  id: string;
  user_id: string;
  draft_type: "project" | "bid" | "offer" | "message";
  title: string | null;
  content: Record<string, any>;
  auto_saved: boolean;
  created_at: string;
  updated_at: string;
}

export function useDrafts(draftType?: Draft["draft_type"]) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDrafts();
    }
  }, [user, draftType]);

  const fetchDrafts = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from("user_drafts")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (draftType) {
        query = query.eq("draft_type", draftType);
      }

      const { data, error } = await query.limit(20);

      if (error) throw error;
      setDrafts(data as Draft[]);
    } catch (err) {
      console.error("Error fetching drafts:", err);
    } finally {
      setLoading(false);
    }
  };

  const saveDraft = async (
    type: Draft["draft_type"],
    content: Record<string, any>,
    title?: string,
    draftId?: string
  ) => {
    if (!user) return { success: false, error: "Not authenticated" };

    try {
      if (draftId) {
        // Update existing draft
        const { error } = await supabase
          .from("user_drafts")
          .update({
            title,
            content,
            updated_at: new Date().toISOString(),
          })
          .eq("id", draftId);

        if (error) throw error;
      } else {
        // Create new draft
        const { data, error } = await supabase
          .from("user_drafts")
          .insert({
            user_id: user.id,
            draft_type: type,
            title,
            content,
          })
          .select()
          .single();

        if (error) throw error;
        return { success: true, draft: data as Draft };
      }

      await fetchDrafts();
      return { success: true };
    } catch (err: any) {
      console.error("Error saving draft:", err);
      return { success: false, error: err.message };
    }
  };

  const deleteDraft = async (draftId: string) => {
    try {
      const { error } = await supabase
        .from("user_drafts")
        .delete()
        .eq("id", draftId);

      if (error) throw error;

      toast({
        title: "Draft Deleted",
        description: "Your draft has been deleted.",
      });

      await fetchDrafts();
      return { success: true };
    } catch (err: any) {
      console.error("Error deleting draft:", err);
      return { success: false, error: err.message };
    }
  };

  return {
    drafts,
    loading,
    refetch: fetchDrafts,
    saveDraft,
    deleteDraft,
  };
}

export function useAutoSave(
  draftType: Draft["draft_type"],
  draftId?: string,
  saveDelayMs: number = 3000
) {
  const { saveDraft } = useDrafts();
  const [currentDraftId, setCurrentDraftId] = useState<string | undefined>(draftId);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSave = useCallback(
    debounce(async (content: Record<string, any>, title?: string) => {
      setIsSaving(true);
      const result = await saveDraft(draftType, content, title, currentDraftId);
      
      if (result.success) {
        if (!currentDraftId && result.draft) {
          setCurrentDraftId(result.draft.id);
        }
        setLastSaved(new Date());
      }
      setIsSaving(false);
    }, saveDelayMs),
    [draftType, currentDraftId, saveDraft]
  );

  const triggerSave = (content: Record<string, any>, title?: string) => {
    debouncedSave(content, title);
  };

  return {
    currentDraftId,
    setCurrentDraftId,
    isSaving,
    lastSaved,
    triggerSave,
  };
}
