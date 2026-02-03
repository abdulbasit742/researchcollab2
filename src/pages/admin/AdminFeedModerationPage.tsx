import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import {
  Flag,
  MessageSquare,
  MoreHorizontal,
  Eye,
  EyeOff,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ReportedPost {
  id: string;
  post_id: string | null;
  comment_id: string | null;
  reporter_id: string;
  reason: string;
  details: string | null;
  status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  resolution_notes: string | null;
  created_at: string;
  reporter?: { full_name: string | null };
  post?: { content: string; author_id: string; author?: { full_name: string | null } };
}

export default function AdminFeedModerationPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("pending");

  const { data: reports, isLoading } = useQuery({
    queryKey: ["admin-reported-posts", activeTab],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reported_posts")
        .select(`
          *,
          reporter:profiles!reported_posts_reporter_id_fkey(full_name),
          post:posts(content, author_id, author:profiles!posts_author_id_fkey(full_name))
        `)
        .eq("status", activeTab)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ReportedPost[];
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["admin-feed-stats"],
    queryFn: async () => {
      const [postsResult, reportsResult, commentsResult] = await Promise.all([
        supabase.from("posts").select("id", { count: "exact", head: true }),
        supabase.from("reported_posts").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("post_comments").select("id", { count: "exact", head: true }),
      ]);

      return {
        totalPosts: postsResult.count || 0,
        pendingReports: reportsResult.count || 0,
        totalComments: commentsResult.count || 0,
      };
    },
  });

  const resolveReport = useMutation({
    mutationFn: async ({ reportId, action, notes }: { reportId: string; action: "resolved" | "dismissed"; notes?: string }) => {
      const { error } = await supabase
        .from("reported_posts")
        .update({
          status: action,
          reviewed_at: new Date().toISOString(),
          resolution_notes: notes,
        })
        .eq("id", reportId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reported-posts"] });
      queryClient.invalidateQueries({ queryKey: ["admin-feed-stats"] });
      toast({ title: "Report updated" });
    },
  });

  const hidePost = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from("posts")
        .update({ is_hidden: true, hidden_reason: "Moderation action" })
        .eq("id", postId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reported-posts"] });
      toast({ title: "Post hidden" });
    },
  });

  const deletePost = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase.from("posts").delete().eq("id", postId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reported-posts"] });
      queryClient.invalidateQueries({ queryKey: ["admin-feed-stats"] });
      toast({ title: "Post deleted" });
    },
  });

  const getReasonBadge = (reason: string) => {
    const colors: Record<string, string> = {
      spam: "bg-yellow-500/10 text-yellow-600",
      harassment: "bg-red-500/10 text-red-600",
      misinformation: "bg-orange-500/10 text-orange-600",
      inappropriate_content: "bg-pink-500/10 text-pink-600",
      copyright_violation: "bg-purple-500/10 text-purple-600",
      off_topic: "bg-blue-500/10 text-blue-600",
      other: "bg-muted text-muted-foreground",
    };
    return colors[reason] || colors.other;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Feed Moderation</h1>
          <p className="text-muted-foreground">Review reported posts and manage content</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{stats?.totalPosts || 0}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Flag className="h-5 w-5 text-destructive" />
                <span className="text-2xl font-bold">{stats?.pendingReports || 0}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Comments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-500" />
                <span className="text-2xl font-bold">{stats?.totalComments || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reports Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Reported Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="reviewing">Reviewing</TabsTrigger>
                <TabsTrigger value="resolved">Resolved</TabsTrigger>
                <TabsTrigger value="dismissed">Dismissed</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-4">
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : reports && reports.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Content</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Reporter</TableHead>
                        <TableHead>Reported</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell className="max-w-xs">
                            <p className="truncate text-sm">
                              {report.post?.content || "Content not available"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              by {report.post?.author?.full_name || "Unknown"}
                            </p>
                          </TableCell>
                          <TableCell>
                            <Badge className={getReasonBadge(report.reason)}>
                              {report.reason.replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{report.reporter?.full_name || "Anonymous"}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {report.post_id && (
                                  <>
                                    <DropdownMenuItem onClick={() => hidePost.mutate(report.post_id!)}>
                                      <EyeOff className="h-4 w-4 mr-2" />
                                      Hide Post
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      className="text-destructive"
                                      onClick={() => deletePost.mutate(report.post_id!)}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete Post
                                    </DropdownMenuItem>
                                  </>
                                )}
                                {activeTab === "pending" && (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() => resolveReport.mutate({ reportId: report.id, action: "resolved" })}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Mark Resolved
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => resolveReport.mutate({ reportId: report.id, action: "dismissed" })}
                                    >
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Dismiss
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Flag className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No {activeTab} reports</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
