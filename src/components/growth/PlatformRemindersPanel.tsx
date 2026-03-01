import { usePlatformReminders } from "@/hooks/usePlatformReminders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, X } from "lucide-react";

export function PlatformRemindersPanel() {
  const { reminders, isLoading, dismiss } = usePlatformReminders();

  if (isLoading || reminders.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          Reminders
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {reminders.slice(0, 5).map((r) => (
          <div
            key={r.id}
            className="flex items-start justify-between gap-2 rounded-lg border border-border p-3 text-sm"
          >
            <p className="text-muted-foreground flex-1">{r.message}</p>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 shrink-0"
              onClick={() => dismiss(r.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
