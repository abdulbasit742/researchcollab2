import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";

interface PlatformImpactIndexProps {
  index: number;
  breakdown?: {
    escrowVolume: number;
    completionRate: number;
    hiringConversion: number;
    sponsorRetention: number;
    trustStability: number;
  };
}

const segments = [
  { label: "Escrow Volume", weight: "25%", key: "escrowVolume" },
  { label: "Completion Rate", weight: "25%", key: "completionRate" },
  { label: "Hiring Conversion", weight: "20%", key: "hiringConversion" },
  { label: "Sponsor Retention", weight: "15%", key: "sponsorRetention" },
  { label: "Trust Stability", weight: "15%", key: "trustStability" },
] as const;

export function PlatformImpactIndex({ index, breakdown }: PlatformImpactIndexProps) {
  const pct = Math.min(100, Math.max(0, index));
  const r = 54;
  const circ = 2 * Math.PI * r;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          Platform Impact Index
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          {/* Gauge */}
          <div className="flex-shrink-0">
            <svg width={128} height={128} viewBox="0 0 128 128">
              <circle cx={64} cy={64} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth={10} />
              <motion.circle
                cx={64} cy={64} r={r} fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth={10}
                strokeLinecap="round"
                strokeDasharray={circ}
                initial={{ strokeDashoffset: circ }}
                animate={{ strokeDashoffset: circ - (circ * pct / 100) }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                transform="rotate(-90 64 64)"
              />
              <text x={64} y={60} textAnchor="middle" className="fill-foreground text-2xl font-bold">{pct.toFixed(1)}</text>
              <text x={64} y={78} textAnchor="middle" className="fill-muted-foreground text-[9px] uppercase tracking-wider">Score</text>
            </svg>
          </div>

          {/* Breakdown */}
          {breakdown && (
            <div className="flex-1 space-y-2">
              {segments.map((seg) => {
                const val = breakdown[seg.key] ?? 0;
                return (
                  <div key={seg.key} className="flex items-center gap-2 text-xs">
                    <span className="w-28 text-muted-foreground truncate">{seg.label}</span>
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-primary rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, val)}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                      />
                    </div>
                    <span className="w-10 text-right font-mono text-muted-foreground">{val.toFixed(0)}</span>
                    <span className="w-8 text-muted-foreground/60">{seg.weight}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
