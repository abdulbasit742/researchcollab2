import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ResearchTimeline {
  id: string;
  owner_user_id: string;
  title: string;
  description: string | null;
  research_domain: string | null;
  visibility: "private" | "collaborators" | "public";
  status: "idea" | "draft" | "active" | "paused" | "completed";
  created_at: string;
  updated_at: string;
}

interface ResearchEntry {
  id: string;
  research_timeline_id: string;
  entry_type: "idea" | "note" | "experiment" | "dataset" | "draft" | "revision" | "result";
  title: string;
  content: string | null;
  created_by: string;
  created_at: string;
}

interface ResearchVersion {
  id: string;
  research_entry_id: string;
  version_number: number;
  content_snapshot: string;
  change_summary: string | null;
  created_by: string;
  created_at: string;
}

interface ResearchCollaborator {
  id: string;
  research_timeline_id: string;
  user_id: string;
  role: "viewer" | "contributor" | "editor";
  added_at: string;
}

interface ResearchArtifact {
  id: string;
  research_timeline_id: string;
  related_entry_id: string | null;
  file_url: string;
  artifact_type: "dataset" | "code" | "image" | "pdf" | "notes" | "other";
  file_name: string | null;
  file_size_bytes: number | null;
  uploaded_by: string;
  created_at: string;
}

export function useResearchTimelines() {
  const { user } = useAuth();
  const [timelines, setTimelines] = useState<ResearchTimeline[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTimelines = useCallback(async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from("research_timelines")
      .select("*")
      .or(`owner_user_id.eq.${user.id},visibility.eq.public`)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching timelines:", error);
    } else {
      setTimelines(data as ResearchTimeline[]);
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    fetchTimelines();
  }, [fetchTimelines]);

  const createTimeline = async (timeline: {
    title: string;
    description?: string;
    research_domain?: string;
    visibility?: "private" | "collaborators" | "public";
    status?: "idea" | "draft" | "active" | "paused" | "completed";
  }) => {
    if (!user?.id) return { success: false, error: "Not authenticated" };

    const { data, error } = await supabase
      .from("research_timelines")
      .insert({ ...timeline, owner_user_id: user.id })
      .select()
      .single();

    if (error) {
      toast.error("Failed to create research timeline");
      return { success: false, error };
    }

    toast.success("Research timeline created");
    await fetchTimelines();
    return { success: true, data };
  };

  const updateTimeline = async (id: string, updates: Partial<ResearchTimeline>) => {
    const { error } = await supabase
      .from("research_timelines")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update timeline");
      return { success: false, error };
    }

    toast.success("Timeline updated");
    await fetchTimelines();
    return { success: true };
  };

  return {
    timelines,
    loading,
    fetchTimelines,
    createTimeline,
    updateTimeline,
  };
}

export function useResearchEntries(timelineId: string | null) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<ResearchEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = useCallback(async () => {
    if (!timelineId) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("research_entries")
      .select("*")
      .eq("research_timeline_id", timelineId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching entries:", error);
    } else {
      setEntries(data as ResearchEntry[]);
    }
    setLoading(false);
  }, [timelineId]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const createEntry = async (entry: {
    entry_type: ResearchEntry["entry_type"];
    title: string;
    content?: string;
  }) => {
    if (!user?.id || !timelineId) return { success: false, error: "Invalid state" };

    const { data, error } = await supabase
      .from("research_entries")
      .insert({
        ...entry,
        research_timeline_id: timelineId,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to create entry");
      return { success: false, error };
    }

    // Create initial version
    await supabase.from("research_versions").insert({
      research_entry_id: data.id,
      version_number: 1,
      content_snapshot: entry.content || "",
      change_summary: "Initial version",
      created_by: user.id,
    });

    toast.success("Entry added to timeline");
    await fetchEntries();
    return { success: true, data };
  };

  const updateEntry = async (id: string, updates: { title?: string; content?: string }) => {
    const { error } = await supabase
      .from("research_entries")
      .update(updates)
      .eq("id", id);

    if (error) {
      toast.error("Failed to update entry");
      return { success: false, error };
    }

    toast.success("Entry updated (version saved)");
    await fetchEntries();
    return { success: true };
  };

  return {
    entries,
    loading,
    fetchEntries,
    createEntry,
    updateEntry,
  };
}

export function useResearchVersions(entryId: string | null) {
  const [versions, setVersions] = useState<ResearchVersion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVersions = useCallback(async () => {
    if (!entryId) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("research_versions")
      .select("*")
      .eq("research_entry_id", entryId)
      .order("version_number", { ascending: false });

    if (error) {
      console.error("Error fetching versions:", error);
    } else {
      setVersions(data as ResearchVersion[]);
    }
    setLoading(false);
  }, [entryId]);

  useEffect(() => {
    fetchVersions();
  }, [fetchVersions]);

  return {
    versions,
    loading,
    fetchVersions,
  };
}

export function useResearchCollaborators(timelineId: string | null) {
  const { user } = useAuth();
  const [collaborators, setCollaborators] = useState<ResearchCollaborator[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCollaborators = useCallback(async () => {
    if (!timelineId) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("research_collaborators")
      .select("*")
      .eq("research_timeline_id", timelineId);

    if (error) {
      console.error("Error fetching collaborators:", error);
    } else {
      setCollaborators(data as ResearchCollaborator[]);
    }
    setLoading(false);
  }, [timelineId]);

  useEffect(() => {
    fetchCollaborators();
  }, [fetchCollaborators]);

  const addCollaborator = async (userId: string, role: ResearchCollaborator["role"]) => {
    if (!timelineId) return { success: false, error: "No timeline" };

    const { error } = await supabase
      .from("research_collaborators")
      .insert({
        research_timeline_id: timelineId,
        user_id: userId,
        role,
      });

    if (error) {
      toast.error("Failed to add collaborator");
      return { success: false, error };
    }

    toast.success("Collaborator added");
    await fetchCollaborators();
    return { success: true };
  };

  const updateCollaboratorRole = async (collaboratorId: string, role: ResearchCollaborator["role"]) => {
    const { error } = await supabase
      .from("research_collaborators")
      .update({ role })
      .eq("id", collaboratorId);

    if (error) {
      toast.error("Failed to update role");
      return { success: false, error };
    }

    toast.success("Role updated");
    await fetchCollaborators();
    return { success: true };
  };

  const removeCollaborator = async (collaboratorId: string) => {
    const { error } = await supabase
      .from("research_collaborators")
      .delete()
      .eq("id", collaboratorId);

    if (error) {
      toast.error("Failed to remove collaborator");
      return { success: false, error };
    }

    toast.success("Collaborator removed");
    await fetchCollaborators();
    return { success: true };
  };

  return {
    collaborators,
    loading,
    fetchCollaborators,
    addCollaborator,
    updateCollaboratorRole,
    removeCollaborator,
  };
}

export function useResearchArtifacts(timelineId: string | null) {
  const { user } = useAuth();
  const [artifacts, setArtifacts] = useState<ResearchArtifact[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchArtifacts = useCallback(async () => {
    if (!timelineId) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("research_artifacts")
      .select("*")
      .eq("research_timeline_id", timelineId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching artifacts:", error);
    } else {
      setArtifacts(data as ResearchArtifact[]);
    }
    setLoading(false);
  }, [timelineId]);

  useEffect(() => {
    fetchArtifacts();
  }, [fetchArtifacts]);

  const addArtifact = async (artifact: {
    file_url: string;
    artifact_type: ResearchArtifact["artifact_type"];
    file_name?: string;
    file_size_bytes?: number;
    related_entry_id?: string;
  }) => {
    if (!user?.id || !timelineId) return { success: false, error: "Invalid state" };

    const { data, error } = await supabase
      .from("research_artifacts")
      .insert({
        ...artifact,
        research_timeline_id: timelineId,
        uploaded_by: user.id,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to add artifact");
      return { success: false, error };
    }

    toast.success("Artifact uploaded");
    await fetchArtifacts();
    return { success: true, data };
  };

  return {
    artifacts,
    loading,
    fetchArtifacts,
    addArtifact,
  };
}
