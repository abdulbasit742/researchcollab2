import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WhyTooltip } from "@/components/ui/why-tooltip";
import { 
  CheckCircle2, 
  MessageSquare, 
  Target, 
  Clock,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";

interface TodayItem {
  id: string;
  type: 'milestone' | 'message' | 'opportunity' | 'action';
  title: string;
  subtitle?: string;
  urgent?: boolean;
  href: string;
}

interface WhatMattersTodayProps {
  items: TodayItem[];
  loading?: boolean;
}

const typeConfig = {
  milestone: { icon: CheckCircle2, color: 'text-green-600' },
  message: { icon: MessageSquare, color: 'text-blue-600' },
  opportunity: { icon: Target, color: 'text-primary' },
  action: { icon: Clock, color: 'text-amber-600' },
};

/**
 * System 71: The Single Daily Loop - Step 2
 * "Here is what matters today"
 */
export function WhatMattersToday({ items, loading = false }: WhatMattersTodayProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="h-5 w-40 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 bg-muted/50 rounded animate-pulse" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const urgentItems = items.filter(i => i.urgent);
  const regularItems = items.filter(i => !i.urgent);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            What Matters Today
            <WhyTooltip 
              why="These are your highest-priority items right now."
              problem="Helps you focus on what moves your career forward."
              ignoreConsequence="Missed deadlines, stale opportunities, broken trust."
            />
          </CardTitle>
          {items.length > 0 && (
            <Badge variant="outline" className="text-xs">
              {items.length} items
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <p className="text-sm font-medium">All caught up!</p>
            <p className="text-xs">Check back later for new opportunities.</p>
          </div>
        ) : (
          <>
            {/* Urgent items first */}
            {urgentItems.map(item => {
              const config = typeConfig[item.type];
              const Icon = config.icon;
              return (
                <Link 
                  key={item.id} 
                  to={item.href}
                  className="flex items-center justify-between p-3 rounded-lg border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${config.color}`} />
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      {item.subtitle && (
                        <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="text-[10px]">Urgent</Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}

            {/* Regular items */}
            {regularItems.map(item => {
              const config = typeConfig[item.type];
              const Icon = config.icon;
              return (
                <Link 
                  key={item.id} 
                  to={item.href}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${config.color}`} />
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      {item.subtitle && (
                        <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </Link>
              );
            })}
          </>
        )}
      </CardContent>
    </Card>
  );
}
