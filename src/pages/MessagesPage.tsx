import { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Users, Search, Archive } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useThreads } from "@/hooks/useMessaging";
import { useThreadSearch, useThreadArchive, useThreadMute } from "@/hooks/useChatControls";
import { useStarThread } from "@/hooks/useChatFeatures";
import { ThreadListItem } from "@/components/messages/ThreadListItem";
import { ThreadListSkeleton } from "@/components/skeletons/MessagesSkeleton";
import { toast } from "sonner";

export default function MessagesPage() {
  const { user } = useAuth();
  const { threads, isLoading, error, refetch } = useThreads();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"inbox" | "archived">("inbox");
  
  // Swipe action hooks
  const { archiveThread, unarchiveThread } = useThreadArchive();
  const { muteThread, unmuteThread } = useThreadMute();
  const { toggleStar } = useStarThread();

  // Swipe handlers
  const handleArchive = useCallback(async (threadId: string) => {
    const success = await archiveThread(threadId, user?.id === threads.find(t => t.id === threadId)?.user_a);
    if (success) {
      toast.success("Conversation archived");
      refetch();
    }
  }, [archiveThread, user, threads, refetch]);

  const handleUnarchive = useCallback(async (threadId: string) => {
    const success = await unarchiveThread(threadId, user?.id === threads.find(t => t.id === threadId)?.user_a);
    if (success) {
      toast.success("Conversation restored");
      refetch();
    }
  }, [unarchiveThread, user, threads, refetch]);

  const handleStar = useCallback(async (threadId: string, isUserA: boolean, currentlyStarred: boolean) => {
    const success = await toggleStar(threadId, isUserA, currentlyStarred);
    if (success) {
      toast.success(currentlyStarred ? "Removed from favorites" : "Added to favorites");
      refetch();
    }
  }, [toggleStar, refetch]);

  // Filter threads by archive status
  const { inboxThreads, archivedThreads } = useMemo(() => {
    if (!user) return { inboxThreads: [], archivedThreads: [] };

    const inbox: typeof threads = [];
    const archived: typeof threads = [];

    threads.forEach((thread) => {
      const isUserA = thread.user_a === user.id;
      const isArchived = isUserA
        ? (thread as any).archived_by_user_a
        : (thread as any).archived_by_user_b;

      if (isArchived) {
        archived.push(thread);
      } else {
        inbox.push(thread);
      }
    });

    return { inboxThreads: inbox, archivedThreads: archived };
  }, [threads, user]);

  // Apply search filter
  const currentThreads = activeTab === "inbox" ? inboxThreads : archivedThreads;
  const filteredThreads = useThreadSearch(currentThreads, searchQuery);

  if (!user) {
    return (
      <MainLayout>
        <div className="container py-16 px-4">
          <Card>
            <CardContent className="p-8 md:p-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Sign in to view messages</h2>
              <p className="text-muted-foreground mb-6">
                You need to be logged in to access your messages.
              </p>
              <Link to="/auth">
                <Button>Sign In</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="gradient-hero py-8 md:py-12">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl md:text-3xl font-bold">Messages</h1>
            <p className="text-muted-foreground mt-1">
              Your conversations with collaborators
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container py-6 px-4 md:px-6">
        {/* Search and Tabs */}
        <div className="mb-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="pl-10"
            />
          </div>
          
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "inbox" | "archived")}>
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="inbox" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Inbox
                {inboxThreads.length > 0 && (
                  <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">
                    {inboxThreads.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="archived" className="gap-2">
                <Archive className="h-4 w-4" />
                Archived
                {archivedThreads.length > 0 && (
                  <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">
                    {archivedThreads.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Card className="overflow-hidden">
          {isLoading ? (
            <ThreadListSkeleton />
          ) : error ? (
            <CardContent className="p-8 text-center">
              <p className="text-destructive mb-4">Failed to load messages</p>
              <Button variant="outline" onClick={() => refetch()}>
                Retry
              </Button>
            </CardContent>
          ) : filteredThreads.length === 0 ? (
            <CardContent className="p-8 md:p-12 text-center">
              {searchQuery ? (
                <>
                  <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No results found</h3>
                  <p className="text-muted-foreground">
                    Try a different search term
                  </p>
                </>
              ) : activeTab === "archived" ? (
                <>
                  <Archive className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No archived chats</h3>
                  <p className="text-muted-foreground">
                    Archived conversations will appear here
                  </p>
                </>
              ) : (
                <>
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No conversations yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start a conversation by messaging someone from their profile or a collaboration call.
                  </p>
                  <Link to="/collaborations">
                    <Button>
                      <Users className="h-4 w-4 mr-2" />
                      Browse Collaborations
                    </Button>
                  </Link>
                </>
              )}
            </CardContent>
          ) : (
            <div className="divide-y">
              {filteredThreads.map((thread) => (
                <ThreadListItem 
                  key={thread.id} 
                  thread={thread}
                  showArchived={activeTab === "archived"}
                  onArchive={handleArchive}
                  onUnarchive={handleUnarchive}
                  onStar={handleStar}
                />
              ))}
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
}
