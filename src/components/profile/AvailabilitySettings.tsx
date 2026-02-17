import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Radio,
  Clock,
  Briefcase,
  DollarSign,
  Target,
  Zap,
  Save,
} from "lucide-react";

const INTENTS = [
  { key: "projects", label: "Looking for Projects", icon: Briefcase },
  { key: "collaborators", label: "Seeking Collaborators", icon: Target },
  { key: "mentoring", label: "Open to Mentoring", icon: Radio },
  { key: "hiring", label: "Hiring", icon: Zap },
];

export function AvailabilitySettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: availability, isLoading } = useQuery({
    queryKey: ["user-availability", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("user_availability")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  const [status, setStatus] = useState("available");
  const [intents, setIntents] = useState<string[]>([]);
  const [capacity, setCapacity] = useState(0);
  const [budgetMin, setBudgetMin] = useState(0);
  const [budgetMax, setBudgetMax] = useState(0);
  const [hoursPerWeek, setHoursPerWeek] = useState(0);

  useEffect(() => {
    if (availability) {
      setStatus(availability.status || "available");
      setIntents((availability.intent as string[]) || []);
      setCapacity(availability.capacity || 0);
      setBudgetMin(Number(availability.preferred_budget_min) || 0);
      setBudgetMax(Number(availability.preferred_budget_max) || 0);
      setHoursPerWeek(availability.available_hours_per_week || 0);
    }
  }, [availability]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");

      const payload = {
        user_id: user.id,
        status,
        intent: intents,
        capacity,
        preferred_budget_min: budgetMin,
        preferred_budget_max: budgetMax,
        available_hours_per_week: hoursPerWeek,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("user_availability")
        .upsert(payload, { onConflict: "user_id" });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-availability"] });
      toast.success("Availability updated!");
    },
    onError: () => toast.error("Failed to save availability"),
  });

  const toggleIntent = (key: string) => {
    setIntents((prev) =>
      prev.includes(key) ? prev.filter((i) => i !== key) : [...prev, key]
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-6">
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Radio className="h-5 w-5 text-primary" />
          Availability & Intent
        </CardTitle>
        <CardDescription>
          Broadcast your availability so the right opportunities find you
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status */}
        <div className="space-y-2">
          <Label>Availability Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full_time">Full-Time Available</SelectItem>
              <SelectItem value="part_time">Part-Time</SelectItem>
              <SelectItem value="project_only">Project-Only</SelectItem>
              <SelectItem value="available">Generally Available</SelectItem>
              <SelectItem value="unavailable">Unavailable</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Intent */}
        <div className="space-y-2">
          <Label>What are you looking for?</Label>
          <div className="flex flex-wrap gap-2">
            {INTENTS.map(({ key, label, icon: Icon }) => (
              <Badge
                key={key}
                variant={intents.includes(key) ? "default" : "outline"}
                className="cursor-pointer gap-1.5 py-1.5 px-3"
                onClick={() => toggleIntent(key)}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Capacity */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5" />
              Project Capacity
            </Label>
            <Input
              type="number"
              min={0}
              max={10}
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              placeholder="How many more projects?"
            />
            <p className="text-xs text-muted-foreground">Projects you can take on</p>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Hours / Week
            </Label>
            <Input
              type="number"
              min={0}
              max={80}
              value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(Number(e.target.value))}
              placeholder="Available hours"
            />
            <p className="text-xs text-muted-foreground">Hours available per week</p>
          </div>
        </div>

        {/* Budget Range */}
        <div className="space-y-2">
          <Label className="flex items-center gap-1.5">
            <DollarSign className="h-3.5 w-3.5" />
            Preferred Budget Range (PKR)
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              min={0}
              value={budgetMin}
              onChange={(e) => setBudgetMin(Number(e.target.value))}
              placeholder="Min budget"
            />
            <Input
              type="number"
              min={0}
              value={budgetMax}
              onChange={(e) => setBudgetMax(Number(e.target.value))}
              placeholder="Max budget"
            />
          </div>
        </div>

        <Button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="w-full gap-2"
        >
          <Save className="h-4 w-4" />
          {mutation.isPending ? "Saving..." : "Save Availability"}
        </Button>
      </CardContent>
    </Card>
  );
}
