import { Card, CardContent } from "@/components/ui/card";
import { WhyTooltip } from "@/components/ui/why-tooltip";
import { TrendingUp, DollarSign, CheckCircle, History } from "lucide-react";

interface ChangeItem {
  type: 'trust' | 'earnings' | 'completion' | 'general';
  value: string;
  positive?: boolean;
}

interface WhatChangedProps {
  changes: ChangeItem[];
  period?: string;
  loading?: boolean;
}

const typeConfig = {
  trust: { icon: TrendingUp, label: 'Trust' },
  earnings: { icon: DollarSign, label: 'Earnings' },
  completion: { icon: CheckCircle, label: 'Completed' },
  general: { icon: History, label: 'Update' },
};

/**
 * System 71: The Single Daily Loop - Step 4
 * "Here is what changed because you acted"
 */
export function WhatChanged({ changes, period = "Yesterday", loading = false }: WhatChangedProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="py-3">
          <div className="h-4 w-48 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (changes.length === 0) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-r from-primary/5 to-transparent border-primary/20">
      <CardContent className="py-3">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <History className="h-4 w-4" />
            <span>{period}:</span>
            <WhyTooltip 
              why="This shows the impact of your recent actions."
              problem="Reinforces the connection between effort and results."
            />
          </div>
          
          <div className="flex items-center gap-4 flex-wrap">
            {changes.map((change, index) => {
              const config = typeConfig[change.type];
              const Icon = config.icon;
              return (
                <div 
                  key={index}
                  className={`flex items-center gap-1.5 text-sm font-medium ${
                    change.positive !== false ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{change.value}</span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
