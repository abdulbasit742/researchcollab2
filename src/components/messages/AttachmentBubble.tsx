import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Image, Download, ExternalLink, Loader2 } from "lucide-react";
import { useAttachments } from "@/hooks/useOffersConnections";
import { cn } from "@/lib/utils";

interface AttachmentData {
  fileName: string;
  fileType: string;
  path: string;
  size: number;
}

interface AttachmentBubbleProps {
  attachment: AttachmentData;
  caption?: string;
  isMine: boolean;
}

export function AttachmentBubble({ attachment, caption, isMine }: AttachmentBubbleProps) {
  const { getSignedUrl } = useAttachments();
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const isImage = attachment.fileType.startsWith("image/");
  const isPdf = attachment.fileType === "application/pdf";

  useEffect(() => {
    const fetchUrl = async () => {
      const url = await getSignedUrl(attachment.path);
      setSignedUrl(url || null);
      setIsLoading(false);
    };

    fetchUrl();
  }, [attachment.path, getSignedUrl]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (isLoading) {
    return (
      <div className={cn(
        "max-w-[85%] md:max-w-[70%]",
        isMine ? "ml-auto" : ""
      )}>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Loading attachment...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "max-w-[85%] md:max-w-[70%]",
        isMine ? "ml-auto" : ""
      )}
    >
      {isImage && signedUrl && !imageError ? (
        <div className="space-y-1">
          <div className={cn(
            "rounded-2xl overflow-hidden",
            isMine ? "rounded-br-sm" : "rounded-bl-sm"
          )}>
            <img
              src={signedUrl}
              alt={attachment.fileName}
              className="max-w-full max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(signedUrl, "_blank")}
              onError={() => setImageError(true)}
            />
          </div>
          {caption && (
            <p className="text-sm text-muted-foreground px-2">{caption}</p>
          )}
        </div>
      ) : (
        <Card className={cn(
          isMine ? "bg-primary/5" : "bg-muted"
        )}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {isPdf ? (
                <FileText className="h-10 w-10 text-red-500 shrink-0" />
              ) : isImage ? (
                <Image className="h-10 w-10 text-blue-500 shrink-0" />
              ) : (
                <FileText className="h-10 w-10 text-muted-foreground shrink-0" />
              )}
              
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{attachment.fileName}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(attachment.size)}
                </p>
              </div>

              {signedUrl && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => window.open(signedUrl, "_blank")}
                  className="shrink-0"
                >
                  {isPdf ? (
                    <ExternalLink className="h-4 w-4" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>

            {caption && (
              <p className="text-sm mt-2 text-muted-foreground">{caption}</p>
            )}
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
