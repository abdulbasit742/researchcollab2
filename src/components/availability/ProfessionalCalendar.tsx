import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useAvailability } from "@/hooks/useAvailability";
import { Calendar, Clock, Globe, Users, Briefcase, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export function ProfessionalCalendar() {
  const { 
    timezone, 
    workingHours, 
    availabilityWindows, 
    projectAvailability,
    hasCapacity,
    calculateTimezoneOverlap 
  } = useAvailability();

  const [currentWeek, setCurrentWeek] = useState(new Date());

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const fullDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  // Mock collaborators for timezone overlap
  const collaboratorOverlaps = calculateTimezoneOverlap([
    { userId: "1", userName: "Dr. Sarah Chen", timezone: "Europe/London" },
    { userId: "2", userName: "Prof. Tanaka", timezone: "Asia/Tokyo" },
    { userId: "3", userName: "Alex Thompson", timezone: "America/New_York" },
  ]);

  const getWindowTypeColor = (type: string) => {
    switch (type) {
      case "available": return "bg-green-500/20 border-green-500/50 text-green-700";
      case "busy": return "bg-yellow-500/20 border-yellow-500/50 text-yellow-700";
      case "focus": return "bg-purple-500/20 border-purple-500/50 text-purple-700";
      case "meeting": return "bg-blue-500/20 border-blue-500/50 text-blue-700";
      case "blocked": return "bg-red-500/20 border-red-500/50 text-red-700";
      default: return "bg-muted";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-border/50 bg-gradient-to-br from-background to-muted/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-primary" />
              Professional Calendar
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Globe className="h-4 w-4" />
              {timezone}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge 
                variant={hasCapacity ? "default" : "secondary"}
                className={hasCapacity ? "bg-green-500" : ""}
              >
                {hasCapacity ? "Available for Projects" : "At Capacity"}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {projectAvailability.currentProjects}/{projectAvailability.maxConcurrentProjects} active projects
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Open to opportunities</span>
              <Switch checked={projectAvailability.isOpenToProjects} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Working Hours */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Working Hours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {workingHours.map((day, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg text-center ${
                  day.isWorkingDay ? "bg-primary/10" : "bg-muted/50"
                }`}
              >
                <p className="text-xs font-medium">{weekDays[day.dayOfWeek]}</p>
                {day.isWorkingDay ? (
                  <p className="text-xs text-muted-foreground mt-1">
                    {day.startTime}-{day.endTime}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">Off</p>
                )}
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="mt-3">
            Edit Working Hours
          </Button>
        </CardContent>
      </Card>

      {/* Week View */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Upcoming Schedule</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setCurrentWeek(new Date(currentWeek.getTime() - 7 * 86400000))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                {currentWeek.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - 
                {new Date(currentWeek.getTime() + 6 * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
              <Button variant="ghost" size="sm" onClick={() => setCurrentWeek(new Date(currentWeek.getTime() + 7 * 86400000))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {availabilityWindows.slice(0, 5).map((window, index) => (
            <motion.div
              key={window.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-3 rounded-lg border ${getWindowTypeColor(window.type)}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{window.title}</p>
                  {window.description && (
                    <p className="text-xs opacity-70 mt-0.5">{window.description}</p>
                  )}
                </div>
                <div className="text-right text-xs">
                  <p>{window.startTime.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</p>
                  <p className="opacity-70">
                    {window.startTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} - 
                    {window.endTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
              {window.isRecurring && (
                <Badge variant="outline" className="mt-2 text-xs">
                  Repeats {window.recurrencePattern}
                </Badge>
              )}
            </motion.div>
          ))}
          <Button variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Time Block
          </Button>
        </CardContent>
      </Card>

      {/* Timezone Overlap */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            Timezone Overlap with Collaborators
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {collaboratorOverlaps.map((overlap) => (
            <div key={overlap.userId} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="font-medium text-sm">{overlap.userName}</p>
                <p className="text-xs text-muted-foreground">{overlap.timezone}</p>
              </div>
              <div className="text-right">
                <Badge 
                  variant={overlap.overlapQuality === "excellent" ? "default" : 
                          overlap.overlapQuality === "good" ? "secondary" : "outline"}
                  className={overlap.overlapQuality === "excellent" ? "bg-green-500" : 
                            overlap.overlapQuality === "good" ? "bg-blue-500/10 text-blue-600" : ""}
                >
                  {overlap.overlapHours}h overlap
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  {overlap.overlapWindows[0]?.start} - {overlap.overlapWindows[0]?.end}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Project Preferences */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Project Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Available Hours/Week</p>
              <p className="text-lg font-bold">{projectAvailability.availableHoursPerWeek}h</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Preferred Duration</p>
              <p className="text-lg font-bold capitalize">{projectAvailability.preferredProjectDuration}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Preferred Size</p>
              <p className="text-lg font-bold capitalize">{projectAvailability.preferredProjectSize}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Earliest Start</p>
              <p className="text-lg font-bold">
                {projectAvailability.earliestStartDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="mt-4">
            Update Preferences
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
