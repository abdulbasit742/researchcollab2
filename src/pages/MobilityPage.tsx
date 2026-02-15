import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useMobilityRequests, useVisitingScholar, useMobilityApprovals } from "@/hooks/useResearchMobility";
import { useAuth } from "@/contexts/AuthContext";
import { Plane, Plus, Building2, Clock, CheckCircle2, XCircle, AlertCircle, MapPin } from "lucide-react";
import { format } from "date-fns";

export default function MobilityPage() {
  const { user } = useAuth();
  const { requests, loading, createRequest, submitRequest } = useMobilityRequests();
  const { records, activeRecord, loading: recordsLoading } = useVisitingScholar();

  const [createOpen, setCreateOpen] = useState(false);
  const [newRequest, setNewRequest] = useState({
    host_institution_id: "",
    mobility_type: "visiting_scholar",
    proposed_start_date: "",
    proposed_end_date: "",
    purpose_statement: "",
    funding_source: "",
  });

  const handleCreateRequest = async () => {
    const result = await createRequest({
      ...newRequest,
      applicant_scholar_passport_id: user?.id || "",
      funding_details: {},
    });
    if (result.success) {
      setCreateOpen(false);
      setNewRequest({
        host_institution_id: "",
        mobility_type: "visiting_scholar",
        proposed_start_date: "",
        proposed_end_date: "",
        purpose_statement: "",
        funding_source: "",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "pending":
      case "draft":
        return <Clock className="h-4 w-4 text-amber-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const mobilityTypeLabels: Record<string, string> = {
    visiting_scholar: "Visiting Scholar",
    sabbatical: "Sabbatical",
    exchange: "Exchange Program",
    secondment: "Secondment",
    short_term: "Short-term Visit",
  };

  return (
    <MainLayout>
      <div className="container py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <Plane className="h-8 w-8 text-primary" />
              Research Mobility
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage visiting scholar positions and research mobility
            </p>
          </div>
          
          {user && (
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Mobility Request
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create Mobility Request</DialogTitle>
                  <DialogDescription>
                    Apply for a visiting scholar or research mobility position
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Mobility Type</Label>
                    <Select
                      value={newRequest.mobility_type}
                      onValueChange={(v) => setNewRequest({ ...newRequest, mobility_type: v })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="visiting_scholar">Visiting Scholar</SelectItem>
                        <SelectItem value="sabbatical">Sabbatical</SelectItem>
                        <SelectItem value="exchange">Exchange Program</SelectItem>
                        <SelectItem value="secondment">Secondment</SelectItem>
                        <SelectItem value="short_term">Short-term Visit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        value={newRequest.proposed_start_date}
                        onChange={(e) => setNewRequest({ ...newRequest, proposed_start_date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        value={newRequest.proposed_end_date}
                        onChange={(e) => setNewRequest({ ...newRequest, proposed_end_date: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Purpose Statement</Label>
                    <Textarea
                      value={newRequest.purpose_statement}
                      onChange={(e) => setNewRequest({ ...newRequest, purpose_statement: e.target.value })}
                      placeholder="Describe the purpose of your visit..."
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Funding Source</Label>
                    <Input
                      value={newRequest.funding_source}
                      onChange={(e) => setNewRequest({ ...newRequest, funding_source: e.target.value })}
                      placeholder="e.g., Self-funded, Grant, Fellowship"
                    />
                  </div>
                  <Button onClick={handleCreateRequest} className="w-full">
                    Create Request
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Active Position */}
        {activeRecord && (
          <Card className="border-green-500/50 bg-green-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                Active Visiting Position
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-green-500/10">
                    <Building2 className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="font-semibold">Visiting Scholar</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(activeRecord.active_from), "PP")} - {format(new Date(activeRecord.active_until), "PP")}
                    </p>
                    {activeRecord.office_location && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {activeRecord.office_location}
                      </p>
                    )}
                  </div>
                </div>
                <Badge variant="default" className="bg-green-500">
                  {activeRecord.access_scope}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList>
            <TabsTrigger value="requests">
              <Clock className="h-4 w-4 mr-2" />
              My Requests
            </TabsTrigger>
            <TabsTrigger value="history">
              <Building2 className="h-4 w-4 mr-2" />
              Visit History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            ) : requests.length === 0 ? (
              <Card className="p-12 text-center">
                <Plane className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No mobility requests</h3>
                <p className="text-muted-foreground mb-4">
                  Create a request to start your research mobility journey
                </p>
                <Button onClick={() => setCreateOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Request
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <Card key={request.id}>
                    <CardContent className="py-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          {getStatusIcon(request.status)}
                          <div>
                            <p className="font-semibold">
                              {mobilityTypeLabels[request.mobility_type] || request.mobility_type}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(request.proposed_start_date), "PP")} - {format(new Date(request.proposed_end_date), "PP")}
                            </p>
                            {request.purpose_statement && (
                              <p className="text-sm mt-2 line-clamp-2">{request.purpose_statement}</p>
                            )}
                            {request.funding_source && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Funding: {request.funding_source}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            request.status === "approved" ? "default" :
                            request.status === "rejected" ? "destructive" :
                            "secondary"
                          }>
                            {request.status}
                          </Badge>
                          {request.status === "draft" && (
                            <Button 
                              size="sm"
                              onClick={() => submitRequest(request.id)}
                            >
                              Submit
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {recordsLoading ? (
              <Skeleton className="h-64" />
            ) : records.length === 0 ? (
              <Card className="p-12 text-center">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No visit history</h3>
                <p className="text-muted-foreground">
                  Your past visiting scholar positions will appear here
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {records.map((record) => (
                  <Card key={record.id}>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-muted">
                            <Building2 className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">Visiting Scholar</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(record.active_from), "PP")} - {format(new Date(record.active_until), "PP")}
                            </p>
                            {record.office_location && (
                              <p className="text-xs text-muted-foreground">{record.office_location}</p>
                            )}
                          </div>
                        </div>
                        <Badge variant={record.is_active ? "default" : "secondary"}>
                          {record.is_active ? "Active" : "Completed"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
