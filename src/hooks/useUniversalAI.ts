import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type AIDomain =
  | "knowledge"
  | "career"
  | "deals"
  | "messages"
  | "trust"
  | "research"
  | "profile"
  | "matching"
  | "general";

interface UseUniversalAIOptions {
  onError?: (error: string) => void;
}

export function useUniversalAI(options?: UseUniversalAIOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const ask = useCallback(
    async <T = any>(
      domain: AIDomain,
      action: string,
      context: any
    ): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: fnError } = await supabase.functions.invoke(
          "ai-universal",
          {
            body: { domain, action, context },
          }
        );

        if (fnError) {
          const msg = fnError.message || "AI request failed";
          setError(msg);
          options?.onError?.(msg);
          toast({
            title: "AI Error",
            description: msg,
            variant: "destructive",
          });
          return null;
        }

        if (data?.error) {
          setError(data.error);
          options?.onError?.(data.error);
          toast({
            title: "AI Error",
            description: data.error,
            variant: "destructive",
          });
          return null;
        }

        return data as T;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        setError(msg);
        options?.onError?.(msg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [toast, options]
  );

  // Streaming version for chat
  const streamChat = useCallback(
    async ({
      domain = "general" as AIDomain,
      action = "chat",
      messages,
      onDelta,
      onDone,
    }: {
      domain?: AIDomain;
      action?: string;
      messages: { role: "user" | "assistant"; content: string }[];
      onDelta: (text: string) => void;
      onDone: () => void;
    }) => {
      setLoading(true);
      setError(null);

      try {
        const resp = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-universal`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({ domain, action, messages, stream: true }),
          }
        );

        if (!resp.ok) {
          const errData = await resp.json().catch(() => ({}));
          const msg =
            errData.error ||
            (resp.status === 429
              ? "Rate limit exceeded. Try again later."
              : resp.status === 402
              ? "AI credits exhausted. Add credits in Settings."
              : "AI request failed");
          setError(msg);
          toast({ title: "AI Error", description: msg, variant: "destructive" });
          onDone();
          return;
        }

        if (!resp.body) {
          onDone();
          return;
        }

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let idx: number;
          while ((idx = buffer.indexOf("\n")) !== -1) {
            let line = buffer.slice(0, idx);
            buffer = buffer.slice(idx + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (!line.startsWith("data: ")) continue;
            const json = line.slice(6).trim();
            if (json === "[DONE]") {
              onDone();
              setLoading(false);
              return;
            }
            try {
              const parsed = JSON.parse(json);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) onDelta(content);
            } catch {
              buffer = line + "\n" + buffer;
              break;
            }
          }
        }

        onDone();
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Stream error";
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  return { ask, streamChat, loading, error };
}
