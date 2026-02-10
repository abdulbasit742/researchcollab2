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
import { AISuggestionCard } from "@/components/ai/AISuggestionCard";
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
      {/* Clean header */}
      <div className="border-b bg-card safe-area-top">
        <div className="container py-4 px-4">
          <h1 className="text-xl font-bold">Messages</h1>
          <p className="text-sm text-muted-foreground">Your conversations</p>
        </div>
      </div>

      <div className="container py-3 sm:py-6 px-3 sm:px-4 md:px-6 pb-safe">
        {/* Sticky search and tabs on mobile */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm -mx-3 px-3 sm:mx-0 sm:px-0 pb-3 sm:pb-4 space-y-2 sm:space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="pl-10 h-10 sm:h-11 text-base touch-manipulation"
            />
          </div>
          
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "inbox" | "archived")}>
            <TabsList className="w-full grid grid-cols-2 h-10 sm:h-11">
              <TabsTrigger value="inbox" className="gap-1.5 sm:gap-2 text-sm touch-manipulation">
                <MessageSquare className="h-4 w-4" />
                <span>Inbox</span>
                {inboxThreads.length > 0 && (
                  <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
                    {inboxThreads.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="archived" className="gap-1.5 sm:gap-2 text-sm touch-manipulation">
                <Archive className="h-4 w-4" />
                <span>Archived</span>
                {archivedThreads.length > 0 && (
                  <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">
                    {archivedThreads.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          {/* Swipe hint for mobile */}
          <p className="text-xs text-muted-foreground text-center sm:hidden">
            Swipe left to archive • Swipe right to star
          </p>
        </div>

        {inboxThreads.length > 0 && (
          <AISuggestionCard
            title="AI Conversation Summary"
            domain="messages"
            action="summary"
            context={{ threadCount: inboxThreads.length }}
            compact
            className="mb-3"
          />
        )}

        <Card className="overflow-hidden border-0 sm:border shadow-none sm:shadow-sm">
          {isLoading ? (
            <ThreadListSkeleton />
          ) : error ? (
            <CardContent className="p-6 sm:p-8 text-center">
              <p className="text-destructive mb-4 text-sm sm:text-base">Failed to load messages</p>
              <Button variant="outline" onClick={() => refetch()} className="touch-manipulation">
                Retry
              </Button>
            </CardContent>
          ) : filteredThreads.length === 0 ? (
            <CardContent className="p-6 sm:p-8 md:p-12 text-center">
              {searchQuery ? (
                <>
                  <Search className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">No results found</h3>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    Try a different search term
                  </p>
                </>
              ) : activeTab === "archived" ? (
                <>
                  <Archive className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">No archived chats</h3>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    Archived conversations will appear here
                  </p>
                </>
              ) : (
                <>
                  <Users className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">No conversations yet</h3>
                  <p className="text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base">
                    Start a conversation by messaging someone from their profile.
                  </p>
                  <Link to="/collaborations">
                    <Button className="touch-manipulation">
                      <Users className="h-4 w-4 mr-2" />
                      Browse Collaborations
                    </Button>
                  </Link>
                </>
              )}
            </CardContent>
          ) : (
            <div className="divide-y divide-border/50">
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
