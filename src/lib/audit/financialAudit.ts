/**
 * Financial Audit Layer — structured, regulator-safe audit summaries.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("financialAudit");

export interface AuditSummary {
  escrow: { totalLocked: number; totalReleased: number; totalRefunded: number; activeCount: number };
  wallet: { totalBalance: number; totalEscrow: number; walletCount: number };
  bonds: { totalIssued: number; totalPrincipal: number; activeCount: number; defaultRate: number };
  liquidityPools: { totalCommitted: number; totalAllocated: number; poolCount: number };
  reserveBacking: { totalUnits: number; totalBacking: number; backingRatio: number };
  defaultContainment: { totalDefaults: number; containedCount: number; cascadeRisk: string };
  generatedAt: string;
}

export async function generateFinancialAudit(): Promise<AuditSummary> {
  const [escrow, wallet, bonds, pools, reserves] = await Promise.all([
    getEscrowSummary(), getWalletSummary(), getBondSummary(), getPoolSummary(), getReserveSummary(),
  ]);

  const summary: AuditSummary = {
    escrow, wallet, bonds, liquidityPools: pools, reserveBacking: reserves,
    defaultContainment: { totalDefaults: 0, containedCount: 0, cascadeRisk: "low" },
    generatedAt: new Date().toISOString(),
  };

  log.info("Financial audit generated");
  return summary;
}

async function getEscrowSummary() {
  const { data: locked } = await (supabase as any).from("milestones").select("amount, status")
    .in("status", ["funded", "in_progress", "submitted"]);
  const { data: released } = await (supabase as any).from("milestones").select("amount")
    .eq("status", "completed");
  const { data: refunded } = await (supabase as any).from("milestones").select("amount")
    .eq("status", "refunded");

  return {
    totalLocked: (locked ?? []).reduce((s: number, m: any) => s + (m.amount ?? 0), 0),
    totalReleased: (released ?? []).reduce((s: number, m: any) => s + (m.amount ?? 0), 0),
    totalRefunded: (refunded ?? []).reduce((s: number, m: any) => s + (m.amount ?? 0), 0),
    activeCount: (locked ?? []).length,
  };
}

async function getWalletSummary() {
  const { data } = await supabase.from("wallets").select("available_balance, escrow_balance");
  const wallets = data ?? [];
  return {
    totalBalance: wallets.reduce((s, w) => s + (w.available_balance ?? 0), 0),
    totalEscrow: wallets.reduce((s, w) => s + (w.escrow_balance ?? 0), 0),
    walletCount: wallets.length,
  };
}

async function getBondSummary() {
  const { data: all } = await (supabase as any).from("research_bonds").select("total_principal, status, default_probability");
  const bonds = all ?? [];
  const active = bonds.filter((b: any) => b.status === "active");
  const defaulted = bonds.filter((b: any) => b.status === "defaulted");
  return {
    totalIssued: bonds.length,
    totalPrincipal: bonds.reduce((s: number, b: any) => s + (b.total_principal ?? 0), 0),
    activeCount: active.length,
    defaultRate: bonds.length > 0 ? Math.round((defaulted.length / bonds.length) * 100) : 0,
  };
}

async function getPoolSummary() {
  const { data } = await (supabase as any).from("capital_pools").select("total_committed, total_allocated, status");
  const pools = data ?? [];
  return {
    totalCommitted: pools.reduce((s: number, p: any) => s + (p.total_committed ?? 0), 0),
    totalAllocated: pools.reduce((s: number, p: any) => s + (p.total_allocated ?? 0), 0),
    poolCount: pools.length,
  };
}

async function getReserveSummary() {
  const { data } = await (supabase as any).from("reserve_units").select("backing_capital_amount, unit_value").eq("is_redeemed", false);
  const units = data ?? [];
  const totalBacking = units.reduce((s: number, u: any) => s + (u.backing_capital_amount ?? 0), 0);
  const totalValue = units.reduce((s: number, u: any) => s + (u.unit_value ?? 0), 0);
  return {
    totalUnits: units.length,
    totalBacking,
    backingRatio: totalValue > 0 ? Math.round((totalBacking / totalValue) * 100) : 100,
  };
}

/**
 * Audit mode — generates regulator-safe structured export.
 */
export async function generateAuditExport(format: "json" | "summary" = "json"): Promise<string> {
  const audit = await generateFinancialAudit();
  if (format === "summary") {
    return [
      `FINANCIAL AUDIT REPORT — ${audit.generatedAt}`,
      `Escrow: ${audit.escrow.activeCount} active, ${audit.escrow.totalLocked} locked`,
      `Wallets: ${audit.wallet.walletCount} total, ${audit.wallet.totalBalance} balance`,
      `Bonds: ${audit.bonds.totalIssued} issued, ${audit.bonds.defaultRate}% default rate`,
      `Pools: ${audit.liquidityPools.poolCount} pools, ${audit.liquidityPools.totalCommitted} committed`,
      `Reserves: ${audit.reserveBacking.totalUnits} units, ${audit.reserveBacking.backingRatio}% backed`,
    ].join("\n");
  }
  return JSON.stringify(audit, null, 2);
}
