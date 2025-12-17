import { TrustScore as TrustScoreType, getTrustLevel } from "@/data/verification";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Shield, ShieldCheck, ShieldAlert } from "lucide-react";

interface TrustScoreProps {
  trustScore: TrustScoreType;
  size?: 'sm' | 'md' | 'lg';
  showBreakdown?: boolean;
}

export const TrustScoreDisplay = ({ 
  trustScore, 
  size = 'md',
  showBreakdown = false 
}: TrustScoreProps) => {
  const { label, color } = getTrustLevel(trustScore.total);
  
  const sizeConfig = {
    sm: { circle: 40, stroke: 4, text: 'text-xs', icon: 12 },
    md: { circle: 56, stroke: 5, text: 'text-sm', icon: 16 },
    lg: { circle: 80, stroke: 6, text: 'text-base', icon: 20 }
  };
  
  const config = sizeConfig[size];
  const radius = (config.circle - config.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (trustScore.total / 100) * circumference;
  
  const getIcon = () => {
    if (trustScore.total >= 75) return <ShieldCheck className={`${color}`} size={config.icon} />;
    if (trustScore.total >= 50) return <Shield className={`${color}`} size={config.icon} />;
    return <ShieldAlert className={`${color}`} size={config.icon} />;
  };

  const getStrokeColor = () => {
    if (trustScore.total >= 75) return 'stroke-emerald-500';
    if (trustScore.total >= 50) return 'stroke-amber-500';
    return 'stroke-slate-400';
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2 cursor-help">
          <div className="relative" style={{ width: config.circle, height: config.circle }}>
            <svg className="transform -rotate-90" width={config.circle} height={config.circle}>
              <circle
                cx={config.circle / 2}
                cy={config.circle / 2}
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth={config.stroke}
                className="text-muted/30"
              />
              <circle
                cx={config.circle / 2}
                cy={config.circle / 2}
                r={radius}
                fill="none"
                strokeWidth={config.stroke}
                strokeLinecap="round"
                className={getStrokeColor()}
                strokeDasharray={circumference}
                strokeDashoffset={circumference - progress}
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`font-bold ${config.text} ${color}`}>{trustScore.total}</span>
            </div>
          </div>
          <div className="flex flex-col">
            {getIcon()}
            <span className={`${config.text} font-medium ${color}`}>{label}</span>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent className="w-64">
        <div className="space-y-2">
          <p className="font-semibold">Trust Score Breakdown</p>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Verification Status</span>
              <span className="font-medium">+{trustScore.breakdown.verificationStatus}</span>
            </div>
            <div className="flex justify-between">
              <span>Completed Offers</span>
              <span className="font-medium">+{trustScore.breakdown.completedOffers}</span>
            </div>
            <div className="flex justify-between">
              <span>On-Time Delivery</span>
              <span className="font-medium">+{trustScore.breakdown.onTimeDeliveryRate}</span>
            </div>
            <div className="flex justify-between">
              <span>Dispute-Free History</span>
              <span className="font-medium">+{trustScore.breakdown.disputeFreeHistory}</span>
            </div>
            <div className="flex justify-between">
              <span>Ratings & Reviews</span>
              <span className="font-medium">+{trustScore.breakdown.ratingsScore}</span>
            </div>
            <div className="flex justify-between">
              <span>Account Age</span>
              <span className="font-medium">+{trustScore.breakdown.accountAge}</span>
            </div>
            <div className="border-t pt-1 flex justify-between font-semibold">
              <span>Total</span>
              <span>{trustScore.total}/100</span>
            </div>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

interface TrustScoreCardProps {
  trustScore: TrustScoreType;
}

export const TrustScoreCard = ({ trustScore }: TrustScoreCardProps) => {
  const { label, color } = getTrustLevel(trustScore.total);
  
  const breakdownItems = [
    { label: 'Verification', value: trustScore.breakdown.verificationStatus, max: 30 },
    { label: 'Completed Work', value: trustScore.breakdown.completedOffers, max: 20 },
    { label: 'On-Time Rate', value: trustScore.breakdown.onTimeDeliveryRate, max: 15 },
    { label: 'Dispute-Free', value: trustScore.breakdown.disputeFreeHistory, max: 15 },
    { label: 'Ratings', value: trustScore.breakdown.ratingsScore, max: 10 },
    { label: 'Account Age', value: trustScore.breakdown.accountAge, max: 10 }
  ];

  return (
    <div className="bg-card rounded-xl border p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Trust Score</h3>
        <div className={`text-3xl font-bold ${color}`}>{trustScore.total}</div>
      </div>
      
      <div className="flex items-center gap-2">
        <ShieldCheck className={`${color}`} size={20} />
        <span className={`font-medium ${color}`}>{label}</span>
      </div>
      
      <div className="space-y-3">
        {breakdownItems.map((item) => (
          <div key={item.label} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-medium">{item.value}/{item.max}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${(item.value / item.max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
