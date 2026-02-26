/**
 * Go-Live Checklist Generator — produces a human-readable launch readiness checklist.
 */

import { createLogger } from "@/lib/core/logger";

const log = createLogger("goLiveChecklist");

export interface ChecklistItem {
  category: string;
  item: string;
  status: "ready" | "not_ready" | "manual_check";
  notes?: string;
}

export interface GoLiveChecklist {
  items: ChecklistItem[];
  launchReady: boolean;
  timestamp: string;
}

export function generateGoLiveChecklist(auditResults: {
  preLaunchPassed: boolean;
  financialPassed: boolean;
  tenantPassed: boolean;
  stripePassed: boolean;
  securityPassed: boolean;
  stressPassed: boolean;
}): GoLiveChecklist {
  const items: ChecklistItem[] = [
    // Technical
    { category: "Technical", item: "Pre-launch validation passed", status: auditResults.preLaunchPassed ? "ready" : "not_ready" },
    { category: "Technical", item: "All database migrations applied", status: "manual_check", notes: "Verify via Cloud dashboard" },
    { category: "Technical", item: "Stress test passed", status: auditResults.stressPassed ? "ready" : "not_ready" },
    { category: "Technical", item: "Error monitoring active", status: "manual_check", notes: "Confirm observability layer operational" },

    // Financial
    { category: "Financial", item: "Financial integrity audit passed", status: auditResults.financialPassed ? "ready" : "not_ready" },
    { category: "Financial", item: "Wallet ledger consistent", status: auditResults.financialPassed ? "ready" : "not_ready" },
    { category: "Financial", item: "Escrow invariants holding", status: auditResults.financialPassed ? "ready" : "not_ready" },
    { category: "Financial", item: "Stripe live mode configured", status: auditResults.stripePassed ? "ready" : "not_ready" },

    // Security
    { category: "Security", item: "Security audit passed", status: auditResults.securityPassed ? "ready" : "not_ready" },
    { category: "Security", item: "Chaos mode disabled", status: auditResults.securityPassed ? "ready" : "not_ready" },
    { category: "Security", item: "RLS policies active on all tables", status: "manual_check", notes: "Verify via Cloud linter" },
    { category: "Security", item: "Rate limiting configured", status: "manual_check" },

    // Tenant
    { category: "Tenant Isolation", item: "Tenant isolation audit passed", status: auditResults.tenantPassed ? "ready" : "not_ready" },
    { category: "Tenant Isolation", item: "No cross-tenant data leaks", status: auditResults.tenantPassed ? "ready" : "not_ready" },

    // Operational
    { category: "Operational", item: "Database backup within 24 hours", status: "manual_check" },
    { category: "Operational", item: "Admin contact verified", status: "manual_check" },
    { category: "Operational", item: "Incident response contact defined", status: "manual_check" },

    // Legal
    { category: "Legal", item: "Terms of Service published", status: "manual_check" },
    { category: "Legal", item: "Privacy Policy published", status: "manual_check" },
    { category: "Legal", item: "IP ownership terms defined", status: "manual_check" },
  ];

  const blockers = items.filter((i) => i.status === "not_ready");
  const launchReady = blockers.length === 0;

  log.info(`Go-live checklist: ${launchReady ? "READY" : `${blockers.length} blockers`}`);

  return { items, launchReady, timestamp: new Date().toISOString() };
}
