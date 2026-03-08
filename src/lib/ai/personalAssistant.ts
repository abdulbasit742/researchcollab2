/**
 * Personal AI Assistant — Service layer.
 * Additive system. Does NOT mutate core financial or trust engines.
 */
import { supabase } from "@/integrations/supabase/client";

// ─── Types ───
export interface PAIMessage {
  role: "user" | "assistant";
  content: string;
}

export interface PAIConversation {
  id: string;
  title: string;
  context_type: string;
  created_at: string;
  updated_at: string;
}

export interface PAIRecommendation {
  type: string;
  title: string;
  summary: string;
  relevance_score: number;
  action_suggestion?: string;
}

// ─── Conversations ───

export async function getConversations() {
  const { data, error } = await (supabase as any)
    .from("pai_conversations")
    .select("*")
    .eq("is_archived", false)
    .order("updated_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data ?? [];
}

export async function createConversation(title?: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await (supabase as any)
    .from("pai_conversations")
    .insert({ user_id: user.id, title: title || "New Conversation" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function archiveConversation(id: string) {
  const { error } = await (supabase as any)
    .from("pai_conversations")
    .update({ is_archived: true })
    .eq("id", id);
  if (error) throw error;
}

// ─── Messages ───

export async function getMessages(conversationId: string) {
  const { data, error } = await (supabase as any)
    .from("pai_messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(200);
  if (error) throw error;
  return data ?? [];
}

export async function saveMessage(conversationId: string, role: string, content: string) {
  const { data, error } = await (supabase as any)
    .from("pai_messages")
    .insert({ conversation_id: conversationId, role, content })
    .select()
    .single();
  if (error) throw error;

  // Update conversation timestamp
  await (supabase as any)
    .from("pai_conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  return data;
}

// ─── Streaming Chat ───

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pai-assistant`;

export async function streamChat({
  messages,
  onDelta,
  onDone,
  onError,
}: {
  messages: PAIMessage[];
  onDelta: (text: string) => void;
  onDone: () => void;
  onError?: (err: Error) => void;
}) {
  try {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages }),
    });

    if (!resp.ok) {
      const body = await resp.json().catch(() => ({}));
      throw new Error(body.error || `Request failed: ${resp.status}`);
    }

    if (!resp.body) throw new Error("No response body");

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let streamDone = false;

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") { streamDone = true; break; }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    // Final flush
    if (textBuffer.trim()) {
      for (let raw of textBuffer.split("\n")) {
        if (!raw) continue;
        if (raw.endsWith("\r")) raw = raw.slice(0, -1);
        if (raw.startsWith(":") || raw.trim() === "") continue;
        if (!raw.startsWith("data: ")) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch { /* ignore */ }
      }
    }

    onDone();
  } catch (e) {
    const err = e instanceof Error ? e : new Error("Unknown error");
    onError?.(err);
  }
}

// ─── Recommendations ───

export async function generateRecommendations(userProfile: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("pai-assistant", {
    body: { action: "generate_recommendations", payload: userProfile },
  });
  if (error) throw error;
  return (data?.recommendations ?? []) as PAIRecommendation[];
}

// ─── Recommendations DB ───

export async function getSavedRecommendations() {
  const { data, error } = await (supabase as any)
    .from("pai_recommendations")
    .select("*")
    .eq("dismissed", false)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  return data ?? [];
}

export async function dismissRecommendation(id: string) {
  const { error } = await (supabase as any)
    .from("pai_recommendations")
    .update({ dismissed: true })
    .eq("id", id);
  if (error) throw error;
}

// ─── Insights ───

export async function getInsights() {
  const { data, error } = await (supabase as any)
    .from("pai_insights")
    .select("*")
    .eq("is_read", false)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  return data ?? [];
}

export async function markInsightRead(id: string) {
  const { error } = await (supabase as any)
    .from("pai_insights")
    .update({ is_read: true })
    .eq("id", id);
  if (error) throw error;
}
