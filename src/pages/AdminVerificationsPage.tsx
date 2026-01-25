import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  FileText,
  User,
  GraduationCap,
  Microscope,
  Users,
  Award
} from "lucide-react";
import { useAdminVerifications, VerificationSubmission } from "@/hooks/useVerification";
import { BADGES } from "@/data/verification";
import { toast } from "sonner";

const AdminVerificationsPage = () => {
  const { submissions, loading, reviewSubmission, refetch } = useAdminVerifications();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<(VerificationSubmission & { user_name?: string }) | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { color: string }> = {
      pending: { color: 'bg-amber-100 text-amber-700' },
      approved: { color: 'bg-emerald-100 text-emerald-700' },
      rejected: { color: 'bg-red-100 text-red-700' },
      requires_more_info: { color: 'bg-blue-100 text-blue-700' },
    };
    return styles[status] || { color: 'bg-slate-100 text-slate-700' };
  };

  const getRoleIcon = (role: string) => {
    const icons: Record<string, typeof User> = {
      student: GraduationCap,
      researcher: Microscope,
      partner: Users,
      affiliate: Users
    };
    return icons[role] || User;
  };

  const filteredSubmissions = submissions.filter(sub => {
    const matchesSearch = 
      (sub.user_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      sub.user_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = submissions.filter(s => s.status === 'pending').length;
  const verifiedCount = submissions.filter(s => s.status === 'approved').length;
  const rejectedCount = submissions.filter(s => s.status === 'rejected').length;

  const handleApprove = async (submission: VerificationSubmission) => {
    const result = await reviewSubmission(submission.id, "approved");
    if (result.success) {
      setReviewDialogOpen(false);
      toast.success("Verification approved!");
    }
  };

  const handleReject = async (submission: VerificationSubmission) => {
    if (!rejectionReason) {
      toast.error("Please provide a rejection reason");
      return;
    }
    const result = await reviewSubmission(submission.id, "rejected", rejectionReason);
    if (result.success) {
      setReviewDialogOpen(false);
      setRejectionReason('');
      toast.success("Verification rejected");
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Verification Management</h1>
            <p className="text-muted-foreground">Review and manage user verification requests</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Verification Management</h1>
          <p className="text-muted-foreground">Review and manage user verification requests</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingCount}</p>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{verifiedCount}</p>
                  <p className="text-sm text-muted-foreground">Approved</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{rejectedCount}</p>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                  <Award className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{Object.keys(BADGES).length}</p>
                  <p className="text-sm text-muted-foreground">Badge Types</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by user name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="requires_more_info">Needs Info</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Submissions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Verification Requests</CardTitle>
            <CardDescription>Review submitted documents and approve or reject verifications</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredSubmissions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-2" />
                <p>No verification requests found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">User</th>
                      <th className="text-left py-3 px-4 font-medium">Type</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-left py-3 px-4 font-medium">Submitted</th>
                      <th className="text-left py-3 px-4 font-medium">Documents</th>
                      <th className="text-right py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubmissions.map((submission) => {
                      const RoleIcon = getRoleIcon(submission.verification_type);
                      const statusStyle = getStatusBadge(submission.status);
                      
                      return (
                        <tr key={submission.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                <User className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-medium">{submission.user_name || "Unknown"}</p>
                                <p className="text-sm text-muted-foreground truncate max-w-[150px]">
                                  {submission.user_id}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <RoleIcon className="h-4 w-4 text-muted-foreground" />
                              <span className="capitalize">{submission.verification_type}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={statusStyle.color}>
                              {submission.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {new Date(submission.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{submission.documents?.length || 0} files</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedSubmission(submission);
                                  setReviewDialogOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Review
                              </Button>
                              {submission.status === 'pending' && (
                                <>
                                  <Button 
                                    size="sm" 
                                    className="bg-emerald-600 hover:bg-emerald-700"
                                    onClick={() => handleApprove(submission)}
                                  >
                                    <CheckCircle2 className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="destructive"
                                    onClick={() => {
                                      setSelectedSubmission(submission);
                                      setReviewDialogOpen(true);
                                    }}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Manage Badges Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Badge Management
            </CardTitle>
            <CardDescription>Manually assign or remove badges from users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {Object.values(BADGES).map((badge) => (
                <div 
                  key={badge.type}
                  className={`p-4 rounded-lg border ${badge.color} flex items-center gap-3`}
                >
                  <span className="text-2xl">{badge.icon}</span>
                  <div>
                    <p className="font-medium">{badge.label}</p>
                    <p className="text-xs opacity-80">{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Review Dialog */}
        <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review Verification</DialogTitle>
              <DialogDescription>
                Review submitted documents and verification details
              </DialogDescription>
            </DialogHeader>
            
            {selectedSubmission && (
              <div className="space-y-6">
                {/* User Info */}
                <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold">{selectedSubmission.user_name || selectedSubmission.user_id}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {selectedSubmission.verification_type} Verification
                    </p>
                  </div>
                  <Badge className={`ml-auto ${getStatusBadge(selectedSubmission.status).color}`}>
                    {selectedSubmission.status}
                  </Badge>
                </div>

                {/* Form Data */}
                <div className="space-y-3">
                  <h4 className="font-medium">Submitted Information</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {Object.entries(selectedSubmission.submitted_data || {}).map(([key, value]) => (
                      key !== 'type' && (
                        <div key={key} className="p-2 bg-muted rounded">
                          <p className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                          <p className="font-medium">
                            {Array.isArray(value) ? value.join(', ') : String(value) || 'Not provided'}
                          </p>
                        </div>
                      )
                    ))}
                  </div>
                </div>

                {/* Documents */}
                <div className="space-y-3">
                  <h4 className="font-medium">Documents ({selectedSubmission.documents?.length || 0})</h4>
                  <div className="space-y-2">
                    {(selectedSubmission.documents || []).map((doc: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">{doc.fileName || `Document ${idx + 1}`}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {doc.type?.replace(/_/g, ' ') || 'Document'}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">View</Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rejection Reason */}
                {selectedSubmission.status === 'pending' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Rejection Reason (if rejecting)</label>
                    <Textarea
                      placeholder="Explain why this verification is being rejected..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                    />
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
                Close
              </Button>
              {selectedSubmission?.status === 'pending' && (
                <>
                  <Button 
                    variant="destructive"
                    onClick={() => handleReject(selectedSubmission)}
                  >
                    Reject
                  </Button>
                  <Button 
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => handleApprove(selectedSubmission)}
                  >
                    Approve
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminVerificationsPage;
