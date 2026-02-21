import { forwardRef } from "react";
import { Separator } from "@/components/ui/separator";
import { formatPKR } from "@/lib/currency";
import type { ProofOfValueMetrics } from "@/hooks/useProofOfValue";

interface UniversityImpactReportProps {
  institutionName: string;
  metrics: ProofOfValueMetrics;
}

export const UniversityImpactReport = forwardRef<HTMLDivElement, UniversityImpactReportProps>(
  ({ institutionName, metrics }, ref) => (
    <div ref={ref} className="print:block hidden bg-white text-black p-10 max-w-[800px] mx-auto text-sm leading-relaxed">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold tracking-tight">University Impact Report</h1>
        <p className="text-gray-500 mt-1">{institutionName}</p>
        <p className="text-gray-400 text-xs mt-1">Generated {new Date().toLocaleDateString("en-PK", { year: "numeric", month: "long", day: "numeric" })}</p>
      </div>
      <Separator className="my-6 bg-gray-200" />

      <div className="grid grid-cols-3 gap-4 mb-8">
        <MBox label="Total Funded FYPs" value={String(metrics.total_funded_fyps)} />
        <MBox label="Escrow Volume" value={formatPKR(metrics.total_escrow_volume)} />
        <MBox label="Completion Rate" value={`${metrics.milestone_success_rate.toFixed(0)}%`} />
        <MBox label="Hiring Rate" value={`${metrics.hiring_conversion_rate.toFixed(0)}%`} />
        <MBox label="Startup Spin-offs" value={String(metrics.startup_count)} />
        <MBox label="Trust Score Avg Δ" value={metrics.trust_delta_avg > 0 ? `+${metrics.trust_delta_avg.toFixed(2)}` : metrics.trust_delta_avg.toFixed(2)} />
      </div>

      <section className="mb-8">
        <h2 className="text-base font-semibold mb-3 uppercase tracking-wide text-gray-700">Platform Impact Index</h2>
        <div className="flex items-center gap-4">
          <div className="text-4xl font-bold">{metrics.platform_impact_index.toFixed(1)}</div>
          <div className="text-xs text-gray-500 flex-1">
            <p>Composite score computed from escrow volume, completion rate, hiring conversion, sponsor retention, and trust stability.</p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold mb-3 uppercase tracking-wide text-gray-700">Key Metrics</h2>
        <table className="w-full border-collapse text-xs">
          <tbody>
            <TR label="Time to Funding" value={`${metrics.time_to_funding_days.toFixed(1)} days`} />
            <TR label="Time to Completion" value={`${metrics.time_to_completion_days.toFixed(1)} days`} />
            <TR label="Escrow Accuracy" value={`${metrics.escrow_accuracy_rate.toFixed(1)}%`} />
            <TR label="Sponsor Satisfaction" value={`${metrics.sponsor_satisfaction_score.toFixed(1)}%`} />
            <TR label="Student Completion" value={`${metrics.student_completion_rate.toFixed(1)}%`} />
            <TR label="Repeat Sponsor Rate" value={`${metrics.repeat_sponsor_rate.toFixed(1)}%`} />
            <TR label="Total Hires" value={String(metrics.total_hires)} />
          </tbody>
        </table>
      </section>

      <div className="mt-10 text-center text-[10px] text-gray-400">RCollab · University Impact Report · Confidential</div>
    </div>
  )
);
UniversityImpactReport.displayName = "UniversityImpactReport";

function MBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-gray-200 rounded-md p-3 text-center">
      <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}

function TR({ label, value }: { label: string; value: string }) {
  return (
    <tr className="border-b border-gray-100">
      <td className="py-2 font-medium text-gray-600">{label}</td>
      <td className="py-2 text-right font-bold">{value}</td>
    </tr>
  );
}
