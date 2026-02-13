import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Presentation {
  id: string;
  owner_id: string;
  project_id: string | null;
  title: string;
  slides_data: any;
  template_type: string;
  ai_design_assist: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export function usePresentations() {
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [currentPresentation, setCurrentPresentation] = useState<Presentation | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchPresentations = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("presentations")
        .select("*")
        .eq("is_archived", false)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      setPresentations((data as any[]) || []);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const createPresentation = useCallback(async (title?: string, templateType?: string, projectId?: string) => {
    if (!user) return null;
    try {
      const defaultSlides = {
        slides: [{
          id: "1",
          elements: [{ type: "title", content: title || "Untitled Presentation", x: 50, y: 100, fontSize: 36 }],
          notes: "",
          background: "#ffffff",
        }],
      };
      const { data, error } = await supabase
        .from("presentations")
        .insert({
          owner_id: user.id,
          title: title || "Untitled Presentation",
          project_id: projectId || null,
          template_type: templateType || "academic",
          slides_data: defaultSlides,
        })
        .select()
        .single();
      if (error) throw error;
      return data as Presentation;
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      return null;
    }
  }, [user, toast]);

  const updatePresentation = useCallback(async (id: string, updates: Partial<Presentation>) => {
    try {
      const { error } = await supabase
        .from("presentations")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  }, [toast]);

  const deletePresentation = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from("presentations")
        .update({ is_archived: true })
        .eq("id", id);
      if (error) throw error;
      setPresentations(prev => prev.filter(p => p.id !== id));
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  }, [toast]);

  const fetchPresentation = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("presentations")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      setCurrentPresentation(data as Presentation);
      return data as Presentation;
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    presentations, currentPresentation, loading,
    fetchPresentations, createPresentation, updatePresentation, deletePresentation, fetchPresentation,
  };
}
