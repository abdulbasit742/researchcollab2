import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Spreadsheet {
  id: string;
  owner_id: string;
  project_id: string | null;
  title: string;
  sheet_data: any;
  formula_support: boolean;
  ai_analysis_enabled: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export function useSpreadsheets() {
  const [spreadsheets, setSpreadsheets] = useState<Spreadsheet[]>([]);
  const [currentSheet, setCurrentSheet] = useState<Spreadsheet | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchSpreadsheets = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("spreadsheets")
        .select("*")
        .eq("is_archived", false)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      setSpreadsheets((data as any[]) || []);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const createSpreadsheet = useCallback(async (title?: string, projectId?: string) => {
    if (!user) return null;
    try {
      const defaultData = {
        sheets: [{
          name: "Sheet1",
          data: Array.from({ length: 20 }, () => Array.from({ length: 10 }, () => "")),
        }],
      };
      const { data, error } = await supabase
        .from("spreadsheets")
        .insert({
          owner_id: user.id,
          title: title || "Untitled Spreadsheet",
          project_id: projectId || null,
          sheet_data: defaultData,
        })
        .select()
        .single();
      if (error) throw error;
      return data as Spreadsheet;
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      return null;
    }
  }, [user, toast]);

  const updateSpreadsheet = useCallback(async (id: string, updates: Partial<Spreadsheet>) => {
    try {
      const { error } = await supabase
        .from("spreadsheets")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  }, [toast]);

  const deleteSpreadsheet = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from("spreadsheets")
        .update({ is_archived: true })
        .eq("id", id);
      if (error) throw error;
      setSpreadsheets(prev => prev.filter(s => s.id !== id));
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  }, [toast]);

  const fetchSpreadsheet = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("spreadsheets")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      setCurrentSheet(data as Spreadsheet);
      return data as Spreadsheet;
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    spreadsheets, currentSheet, loading,
    fetchSpreadsheets, createSpreadsheet, updateSpreadsheet, deleteSpreadsheet, fetchSpreadsheet,
  };
}
