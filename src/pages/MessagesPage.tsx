import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useThreads } from "@/hooks/useMessaging";
import { ThreadListItem } from "@/components/messages/ThreadListItem";
import { ThreadListSkeleton } from "@/components/skeletons/MessagesSkeleton";

export default function MessagesPage() {
  const { user } = useAuth();
  const { threads, isLoading, error, refetch } = useThreads();

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
          ) : threads.length === 0 ? (
            <CardContent className="p-8 md:p-12 text-center">
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
            </CardContent>
          ) : (
            <div className="divide-y">
              {threads.map((thread) => (
                <ThreadListItem key={thread.id} thread={thread} />
              ))}
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
}
