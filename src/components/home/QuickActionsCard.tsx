import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  DollarSign,
  Award,
  MessageSquare,
  Zap,
} from "lucide-react";

const quickActions = [
  {
    icon: Briefcase,
    label: "Browse Projects",
    href: "/offers",
    variant: "default" as const,
  },
  {
    icon: DollarSign,
    label: "Post Project",
    href: "/earn",
    variant: "outline" as const,
  },
  {
    icon: Award,
    label: "Find Grants",
    href: "/grants",
    variant: "outline" as const,
  },
  {
    icon: MessageSquare,
    label: "Messages",
    href: "/messages",
    variant: "outline" as const,
  },
];

export function QuickActionsCard() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {quickActions.map((action) => (
          <Button
            key={action.href}
            variant={action.variant}
            size="sm"
            asChild
            className="w-full justify-start gap-2"
          >
            <Link to={action.href}>
              <action.icon className="h-4 w-4" />
              {action.label}
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
