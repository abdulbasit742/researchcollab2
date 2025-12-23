import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  MoreVertical,
  Archive,
  Bell,
  BellOff,
  Ban,
  Flag,
  Search,
} from "lucide-react";

interface ChatOptionsMenuProps {
  onSearch: () => void;
  onArchive: () => void;
  onMute: (duration: "1h" | "24h" | "7d" | "forever") => void;
  onUnmute?: () => void;
  onBlock: () => void;
  onReport: () => void;
  isMuted?: boolean;
  isBlocked?: boolean;
  disabled?: boolean;
}

export function ChatOptionsMenu({
  onSearch,
  onArchive,
  onMute,
  onUnmute,
  onBlock,
  onReport,
  isMuted,
  isBlocked,
  disabled,
}: ChatOptionsMenuProps) {
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={disabled} className="h-10 w-10">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={onSearch}>
            <Search className="h-4 w-4 mr-2" />
            Search messages
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={onArchive}>
            <Archive className="h-4 w-4 mr-2" />
            Archive chat
          </DropdownMenuItem>
          
          {isMuted ? (
            <DropdownMenuItem onClick={onUnmute}>
              <Bell className="h-4 w-4 mr-2" />
              Unmute
            </DropdownMenuItem>
          ) : (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <BellOff className="h-4 w-4 mr-2" />
                Mute
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => onMute("1h")}>
                  1 hour
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onMute("24h")}>
                  24 hours
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onMute("7d")}>
                  7 days
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onMute("forever")}>
                  Until unmuted
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          )}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => setShowBlockConfirm(true)}
            className="text-destructive focus:text-destructive"
          >
            <Ban className="h-4 w-4 mr-2" />
            {isBlocked ? "Unblock user" : "Block user"}
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={onReport}>
            <Flag className="h-4 w-4 mr-2" />
            Report
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showBlockConfirm} onOpenChange={setShowBlockConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isBlocked ? "Unblock this user?" : "Block this user?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isBlocked
                ? "They will be able to message you again."
                : "They won't be able to message you and you won't see their messages."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onBlock}
              className={isBlocked ? "" : "bg-destructive hover:bg-destructive/90"}
            >
              {isBlocked ? "Unblock" : "Block"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
