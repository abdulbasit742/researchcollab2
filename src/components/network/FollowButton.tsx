import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";
import { useIsFollowing, useFollowUser, useUnfollowUser } from "@/hooks/useNetwork";
import { useAuth } from "@/contexts/AuthContext";

interface FollowButtonProps {
  userId: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function FollowButton({ userId, variant = "outline", size = "sm", className }: FollowButtonProps) {
  const { user } = useAuth();
  const { data: isFollowing, isLoading: checkingFollow } = useIsFollowing(userId);
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();
  
  // Don't show for own profile or unauthenticated
  if (!user || user.id === userId) return null;
  
  const isLoading = checkingFollow || followMutation.isPending || unfollowMutation.isPending;
  
  const handleClick = () => {
    if (isFollowing) {
      unfollowMutation.mutate(userId);
    } else {
      followMutation.mutate(userId);
    }
  };
  
  return (
    <Button
      variant={isFollowing ? "secondary" : variant}
      size={size}
      onClick={handleClick}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        <>
          <UserCheck className="h-4 w-4 mr-1" />
          Following
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4 mr-1" />
          Follow
        </>
      )}
    </Button>
  );
}
