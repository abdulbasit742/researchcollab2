/**
 * useAIWorkflow — Hook for calling AI workflow intelligence features.
 * All outputs are advisory-only and logged.
 */
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type AIFeature =
  | "milestone-plan"
  | "enhance-writing"
  | "task-suggestions"
  | "review-analysis"
  | "project-insights";

interface AIWorkflowResult<T = any> {
  result: T;
  ai_generated: boolean;
  disclaimer: string;
  tokens_used: number;
}

export function useAIWorkflow<T = any>() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AIWorkflowResult<T> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(
    async (feature: AIFeature, input: string, context?: Record<string, unknown>) => {
      setIsLoading(true);
      setError(null);
      setResult(null);

      try {
        const { data, error: fnError } = await supabase.functions.invoke("ai-workflow", {
          body: { feature, input, context },
        });

        if (fnError) {
          const msg = fnError.message || "AI request failed";
          setError(msg);
          toast.error(msg);
          return null;
        }

        if (data?.error) {
          setError(data.error);
          toast.error(data.error);
          return null;
        }

        setResult(data as AIWorkflowResult<T>);
        return data as AIWorkflowResult<T>;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        setError(msg);
        toast.error("AI service unavailable. Please try again.");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { generate, isLoading, result, error, reset };
}
