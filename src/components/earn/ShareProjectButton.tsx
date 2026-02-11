import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ShareProjectButtonProps {
  projectId: string;
  projectTitle: string;
  variant?: "ghost" | "outline" | "default";
  size?: "icon" | "sm" | "default";
}

export function ShareProjectButton({ projectId, projectTitle, variant = "outline", size = "sm" }: ShareProjectButtonProps) {
  const { toast } = useToast();

  const handleShare = async () => {
    const url = `${window.location.origin}/earn/projects/${projectId}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: projectTitle, text: `Check out this project: ${projectTitle}`, url });
      } catch (err: any) {
        if (err.name !== "AbortError") {
          fallbackCopy(url);
        }
      }
    } else {
      fallbackCopy(url);
    }
  };

  const fallbackCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link Copied!", description: "Project link copied to clipboard." });
    } catch {
      toast({ title: "Share Failed", description: "Could not copy the link.", variant: "destructive" });
    }
  };

  return (
    <Button variant={variant} size={size} onClick={handleShare}>
      <Share2 className="h-4 w-4" />
      {size !== "icon" && <span className="ml-1">Share</span>}
    </Button>
  );
}
