import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Document {
  id: string;
  owner_id: string;
  project_id: string | null;
  title: string;
  content: any;
  version_number: number;
  citation_count: number;
  word_count: number;
  ai_assisted: boolean;
  format_style: string;
  status: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [currentDoc, setCurrentDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchDocuments = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("is_archived", false)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      setDocuments((data as any[]) || []);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const createDocument = useCallback(async (title?: string, projectId?: string) => {
    if (!user) return null;
    try {
      const { data, error } = await supabase
        .from("documents")
        .insert({
          owner_id: user.id,
          title: title || "Untitled Document",
          project_id: projectId || null,
          content: { type: "doc", content: [{ type: "paragraph", content: "" }] },
        })
        .select()
        .single();
      if (error) throw error;
      return data as Document;
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      return null;
    }
  }, [user, toast]);

  const updateDocument = useCallback(async (id: string, updates: Partial<Document>) => {
    try {
      const { error } = await supabase
        .from("documents")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  }, [toast]);

  const deleteDocument = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from("documents")
        .update({ is_archived: true })
        .eq("id", id);
      if (error) throw error;
      setDocuments(prev => prev.filter(d => d.id !== id));
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  }, [toast]);

  const fetchDocument = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      setCurrentDoc(data as Document);
      return data as Document;
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    documents, currentDoc, loading,
    fetchDocuments, createDocument, updateDocument, deleteDocument, fetchDocument,
  };
}
