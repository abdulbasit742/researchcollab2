import { forwardRef } from "react";
import { Separator } from "@/components/ui/separator";
import { formatPKR } from "@/lib/currency";
import type { ProofOfValueMetrics } from "@/hooks/useProofOfValue";

interface GovernmentBriefReportProps {
  metrics: ProofOfValueMetrics;
}

export const GovernmentBriefReport = forwardRef<HTMLDivElement, GovernmentBriefReportProps>(
  ({ metrics }, ref) => (
    <div ref={ref} className="print:block hidden bg-white text-black p-10 max-w-[800px] mx-auto text-sm leading-relaxed">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Innovation Impact Brief</h1>
        <p className="text-gray-500 mt-1">RCollab Platform — Economic Contribution Summary</p>
        <p className="text-gray-400 text-xs mt-1">Generated {new Date().toLocaleDateString("en-PK", { year: "numeric", month: "long", day: "numeric" })}</p>
      </div>
      <Separator className="my-6 bg-gray-200" />

      <section className="mb-8">
        <h2 className="text-base font-semibold mb-4 uppercase tracking-wide text-gray-700">Economic Contribution</h2>
        <div className="grid grid-cols-2 gap-4">
          <MBox label="Total Escrow Volume" value={formatPKR(metrics.total_escrow_volume)} />
          <MBox label="Funded FYP Projects" value={String(metrics.total_funded_fyps)} />
          <MBox label="Employment Generated" value={`${metrics.total_hires} hires`} />
          <MBox label="Innovation Index" value={metrics.platform_impact_index.toFixed(1)} />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold mb-3 uppercase tracking-wide text-gray-700">Execution Quality</h2>
        <div className="grid grid-cols-3 gap-4">
          <MBox label="Milestone Success" value={`${metrics.milestone_success_rate.toFixed(0)}%`} />
          <MBox label="Escrow Accuracy" value={`${metrics.escrow_accuracy_rate.toFixed(0)}%`} />
          <MBox label="Completion Rate" value={`${metrics.student_completion_rate.toFixed(0)}%`} />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold mb-3 uppercase tracking-wide text-gray-700">Talent Workforce Pipeline</h2>
        <p className="text-gray-700 leading-relaxed">
          The platform has facilitated {metrics.total_hires} direct employment conversions from academic projects to industry roles,
          with a hiring conversion rate of {metrics.hiring_conversion_rate.toFixed(0)}%. Sponsor retention stands at {metrics.repeat_sponsor_rate.toFixed(0)}%,
          indicating sustained industry confidence in the talent pipeline.
        </p>
      </section>

      <Separator className="my-6 bg-gray-200" />
      <p className="text-[10px] text-gray-400 text-center">RCollab · Government Innovation Brief · Confidential</p>
    </div>
  )
);
GovernmentBriefReport.displayName = "GovernmentBriefReport";

function MBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-gray-200 rounded-md p-3 text-center">
      <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}
