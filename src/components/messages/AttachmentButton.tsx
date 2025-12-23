import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, Loader2 } from "lucide-react";
import { useAttachments } from "@/hooks/useOffersConnections";
import { cn } from "@/lib/utils";

interface AttachmentButtonProps {
  threadId: string;
  onUpload: (attachment: {
    fileName: string;
    fileType: string;
    path: string;
    size: number;
  }) => void;
  disabled?: boolean;
}

export function AttachmentButton({ threadId, onUpload, disabled }: AttachmentButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadAttachment, isUploading, uploadProgress } = useAttachments();

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await uploadAttachment(file, threadId);
    if (result) {
      onUpload({
        fileName: result.fileName,
        fileType: result.fileType,
        path: result.path,
        size: result.size,
      });
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        onChange={handleFileChange}
        className="hidden"
      />
      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={handleClick}
        disabled={disabled || isUploading}
        className={cn(
          "h-10 w-10 rounded-full shrink-0",
          isUploading && "relative"
        )}
      >
        {isUploading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            {uploadProgress > 0 && (
              <span className="absolute -bottom-1 text-[10px] font-medium">
                {uploadProgress}%
              </span>
            )}
          </>
        ) : (
          <Paperclip className="h-5 w-5" />
        )}
      </Button>
    </>
  );
}
