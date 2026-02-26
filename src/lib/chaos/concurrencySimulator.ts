/**
 * Concurrency Simulator — fires N parallel operations and captures results.
 */

import { requireChaos } from "./chaosController";
import { buildChaosReport, logChaosReport, persistChaosReport, type ChaosResult } from "./chaosReport";

async function runParallel(
  name: string,
  count: number,
  fn: (i: number) => Promise<ChaosResult>
): Promise<ChaosResult[]> {
  return Promise.all(Array.from({ length: count }, (_, i) => fn(i)));
}

export async function simulateConcurrentDeals(count = 20): Promise<void> {
  requireChaos();
  const { supabase } = await import("@/integrations/supabase/client");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Auth required");

  const results = await runParallel("deal", count, async (i) => {
    const start = performance.now();
    try {
      const { error } = await supabase.from("deal_rooms").insert({
        title: `Chaos Deal ${Date.now()}_${i}`,
        buyer_id: user.id,
        seller_id: user.id,
        status: "draft",
        budget_amount: 100,
        budget_currency: "PKR",
      });
      return { operation: `concurrent_deal_${i}`, success: !error, durationMs: Math.round(performance.now() - start), error: error?.message };
    } catch (err) {
      return { operation: `concurrent_deal_${i}`, success: false, durationMs: Math.round(performance.now() - start), error: String(err) };
    }
  });

  const report = buildChaosReport("concurrent_deal_creation", results);
  logChaosReport(report);
  await persistChaosReport(report);
}

export async function simulateConcurrentMessages(threadId: string, count = 100): Promise<void> {
  requireChaos();
  const { supabase } = await import("@/integrations/supabase/client");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Auth required");

  const results = await runParallel("msg", count, async (i) => {
    const start = performance.now();
    try {
      const { error } = await supabase.from("messages").insert({
        thread_id: threadId,
        sender_id: user.id,
        body: `Chaos msg ${Date.now()}-${i}`,
      });
      return { operation: `concurrent_msg_${i}`, success: !error, durationMs: Math.round(performance.now() - start), error: error?.message };
    } catch (err) {
      return { operation: `concurrent_msg_${i}`, success: false, durationMs: Math.round(performance.now() - start), error: String(err) };
    }
  });

  const report = buildChaosReport("concurrent_messages", results);
  logChaosReport(report);
  await persistChaosReport(report);
}
