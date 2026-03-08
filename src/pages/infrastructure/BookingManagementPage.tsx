import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { getBookings, updateBookingStatus } from "@/lib/infrastructure/scientificMarketplace";

export default function BookingManagementPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["sim-bookings", user?.id],
    queryFn: () => getBookings(user?.id || ""),
    enabled: !!user?.id,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateBookingStatus(id, status),
    onSuccess: () => { toast.success("Booking updated"); queryClient.invalidateQueries({ queryKey: ["sim-bookings"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const statusColors: Record<string, string> = { pending: "secondary", confirmed: "default", active: "default", completed: "outline", cancelled: "destructive" };
  const statusIcons: Record<string, any> = { pending: AlertCircle, confirmed: CheckCircle, active: Clock, completed: CheckCircle, cancelled: XCircle };

  const grouped = {
    active: bookings.filter((b: any) => ["pending", "confirmed", "active"].includes(b.status)),
    past: bookings.filter((b: any) => ["completed", "cancelled"].includes(b.status)),
  };

  return (
    <MainLayout>
      <Helmet><title>Booking Management | RCollab</title></Helmet>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Booking Management</h1>
          <p className="text-muted-foreground mt-1">Manage your scientific infrastructure bookings</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{grouped.active.length}</p><p className="text-xs text-muted-foreground">Active Bookings</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{grouped.past.length}</p><p className="text-xs text-muted-foreground">Completed</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">${bookings.reduce((s: number, b: any) => s + (b.total_cost || 0), 0).toLocaleString()}</p><p className="text-xs text-muted-foreground">Total Spent</p></CardContent></Card>
        </div>

        <Tabs defaultValue="active">
          <TabsList><TabsTrigger value="active">Active ({grouped.active.length})</TabsTrigger><TabsTrigger value="past">Past ({grouped.past.length})</TabsTrigger></TabsList>
          {(["active", "past"] as const).map(tab => (
            <TabsContent key={tab} value={tab}>
              {isLoading ? <p className="text-center py-8 text-muted-foreground">Loading...</p> : grouped[tab].length === 0 ? (
                <Card><CardContent className="py-12 text-center"><Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3" /><p className="text-muted-foreground">No {tab} bookings</p></CardContent></Card>
              ) : (
                <div className="space-y-3">
                  {grouped[tab].map((b: any) => {
                    const Icon = statusIcons[b.status] || Clock;
                    return (
                      <Card key={b.id}>
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Icon className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{b.sim_listings?.title || "Resource"}</p>
                              <p className="text-sm text-muted-foreground">{new Date(b.start_date).toLocaleDateString()} — {new Date(b.end_date).toLocaleDateString()}</p>
                              {b.purpose && <p className="text-xs text-muted-foreground mt-1">{b.purpose}</p>}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold">${b.total_cost}</span>
                            <Badge variant={statusColors[b.status] as any}>{b.status}</Badge>
                            {b.status === "pending" && <Button size="sm" variant="destructive" onClick={() => statusMutation.mutate({ id: b.id, status: "cancelled" })}>Cancel</Button>}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </MainLayout>
  );
}
