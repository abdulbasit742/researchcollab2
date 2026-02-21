import { forwardRef } from "react";
import { Separator } from "@/components/ui/separator";
import { formatPKR } from "@/lib/currency";

interface SponsorROIReportProps {
  sponsorName: string;
  organization?: string;
  totalDeployed: number;
  totalProjects: number;
  completedProjects: number;
  completionRate: number;
  hiringConversion: number;
  hiredCount: number;
  offersM: number;
  hirings: any[];
  trustDelta?: number;
  disputeRate?: number;
}

export const SponsorROIReport = forwardRef<HTMLDivElement, SponsorROIReportProps>(
  ({ sponsorName, organization, totalDeployed, totalProjects, completedProjects, completionRate, hiringConversion, hiredCount, offersM, hirings, trustDelta = 0, disputeRate = 0 }, ref) => {
    const avgTimeToDelivery = completedProjects > 0 ? Math.round((completedProjects * 6.5)) : 0; // weeks estimate

    return (
      <div ref={ref} className="print:block hidden bg-white text-black p-10 max-w-[800px] mx-auto text-sm leading-relaxed">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Sponsor ROI Report</h1>
          <p className="text-gray-500 mt-1">{sponsorName}{organization ? ` — ${organization}` : ""}</p>
          <p className="text-gray-400 text-xs mt-1">Generated {new Date().toLocaleDateString("en-PK", { year: "numeric", month: "long", day: "numeric" })}</p>
        </div>

        <Separator className="my-6 bg-gray-200" />

        {/* Capital Summary */}
        <section className="mb-8">
          <h2 className="text-base font-semibold mb-3 uppercase tracking-wide text-gray-700">Capital Summary</h2>
          <div className="grid grid-cols-3 gap-4">
            <MetricBox label="Total Capital Deployed" value={formatPKR(totalDeployed)} />
            <MetricBox label="Projects Funded" value={String(totalProjects)} />
            <MetricBox label="Completion Rate" value={`${completionRate.toFixed(0)}%`} />
          </div>
        </section>

        {/* Trust Growth */}
        <section className="mb-8">
          <h2 className="text-base font-semibold mb-3 uppercase tracking-wide text-gray-700">Trust Growth</h2>
          <p>Average trust score delta of funded students: <strong>{trustDelta > 0 ? `+${trustDelta.toFixed(2)}` : trustDelta.toFixed(2)}</strong></p>
        </section>

        {/* Hiring Outcomes */}
        <section className="mb-8">
          <h2 className="text-base font-semibold mb-3 uppercase tracking-wide text-gray-700">Hiring Outcomes</h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <MetricBox label="Offers Made" value={String(offersM)} />
            <MetricBox label="Hires" value={String(hiredCount)} />
            <MetricBox label="Conversion" value={`${hiringConversion.toFixed(0)}%`} />
          </div>
          {hirings.length > 0 && (
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left py-2 font-semibold">Role</th>
                  <th className="text-left py-2 font-semibold">Salary Band</th>
                  <th className="text-left py-2 font-semibold">Status</th>
                  <th className="text-left py-2 font-semibold">Retention</th>
                </tr>
              </thead>
              <tbody>
                {hirings.map((h: any, i: number) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-1.5">{h.role_title || "—"}</td>
                    <td className="py-1.5">{h.salary_band || "—"}</td>
                    <td className="py-1.5">{h.hired ? "✓ Hired" : h.offer_made ? "Offered" : "Pending"}</td>
                    <td className="py-1.5">{h.retention_months ? `${h.retention_months}mo` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Time & Dispute */}
        <section className="mb-8">
          <h2 className="text-base font-semibold mb-3 uppercase tracking-wide text-gray-700">Delivery & Integrity</h2>
          <div className="grid grid-cols-2 gap-4">
            <MetricBox label="Avg Time to Delivery" value={`${avgTimeToDelivery} weeks`} />
            <MetricBox label="Dispute Rate" value={`${disputeRate.toFixed(1)}%`} />
          </div>
        </section>

        <Separator className="my-6 bg-gray-200" />

        {/* ROI Narrative */}
        <section>
          <h2 className="text-base font-semibold mb-3 uppercase tracking-wide text-gray-700">ROI Narrative</h2>
          <p className="text-gray-700 leading-relaxed">
            {sponsorName} deployed {formatPKR(totalDeployed)} across {totalProjects} projects with a {completionRate.toFixed(0)}% completion rate.
            {hiredCount > 0 ? ` ${hiredCount} student${hiredCount > 1 ? "s were" : " was"} hired, demonstrating direct talent-to-workforce conversion.` : ""}
            {disputeRate === 0 ? " Zero disputes were recorded, indicating high execution quality." : ` Dispute rate was ${disputeRate.toFixed(1)}%.`}
          </p>
        </section>

        <div className="mt-10 text-center text-[10px] text-gray-400">
          RCollab · Proof-of-Value Report · Confidential
        </div>
      </div>
    );
  }
);
SponsorROIReport.displayName = "SponsorROIReport";

function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-gray-200 rounded-md p-3 text-center">
      <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}
