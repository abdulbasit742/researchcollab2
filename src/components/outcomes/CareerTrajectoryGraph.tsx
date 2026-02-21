import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp } from "lucide-react";

interface DataPoint {
  label: string;
  trustScore: number;
  earnings: number;
  milestones: number;
}

interface CareerTrajectoryGraphProps {
  data: DataPoint[];
}

export function CareerTrajectoryGraph({ data }: CareerTrajectoryGraphProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground text-sm">
          No career trajectory data available yet. Complete milestones to build your trajectory.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Career Trajectory
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
            <XAxis dataKey="label" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="trustScore" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} name="Trust Score" />
            <Line type="monotone" dataKey="earnings" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 3 }} name="Earnings (K)" />
            <Line type="monotone" dataKey="milestones" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={{ r: 3 }} name="Milestones" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
