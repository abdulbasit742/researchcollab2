 import { useState, useCallback } from "react";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { VoiceRecorderTrigger } from "@/components/voice/VoiceRecorder";
 import { VoicePlayer } from "@/components/voice/VoicePlayer";
 import { Send, Loader2 } from "lucide-react";
 import { cn } from "@/lib/utils";
 import type { VoiceNote } from "@/hooks/useVoiceNotes";
 
 interface DealRoomComposerProps {
   dealId: string;
   onSendMessage?: (content: string) => Promise<void>;
   onSendVoiceNote?: (voiceNote: VoiceNote) => Promise<void>;
   disabled?: boolean;
   className?: string;
 }
 
 export function DealRoomComposer({
   dealId,
   onSendMessage,
   onSendVoiceNote,
   disabled,
   className,
 }: DealRoomComposerProps) {
   const [message, setMessage] = useState("");
   const [sending, setSending] = useState(false);
   const [pendingVoiceNote, setPendingVoiceNote] = useState<VoiceNote | null>(null);
 
   const handleSend = async () => {
     if (disabled || sending) return;
 
     if (pendingVoiceNote && onSendVoiceNote) {
       setSending(true);
       try {
         await onSendVoiceNote(pendingVoiceNote);
         setPendingVoiceNote(null);
       } finally {
         setSending(false);
       }
       return;
     }
 
     if (message.trim() && onSendMessage) {
       setSending(true);
       try {
         await onSendMessage(message.trim());
         setMessage("");
       } finally {
         setSending(false);
       }
     }
   };
 
   const handleVoiceRecording = useCallback((voiceNote: VoiceNote) => {
     setPendingVoiceNote(voiceNote);
   }, []);
 
   const clearVoiceNote = () => {
     setPendingVoiceNote(null);
   };
 
   return (
     <div className={cn("border-t bg-background p-4", className)}>
       {/* Pending Voice Note Preview */}
       {pendingVoiceNote && (
         <div className="mb-3 p-3 rounded-lg bg-muted flex items-center gap-3">
           <VoicePlayer
             voiceNote={pendingVoiceNote}
             showTranscript={false}
             showControls={false}
             compact
             className="flex-1"
           />
           <Button variant="ghost" size="sm" onClick={clearVoiceNote}>
             Cancel
           </Button>
         </div>
       )}
 
       {/* Input Row */}
       <div className="flex items-center gap-2">
         <Input
           placeholder="Type a message..."
           value={message}
           onChange={(e) => setMessage(e.target.value)}
           onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
           disabled={disabled || sending || !!pendingVoiceNote}
           className="flex-1"
         />
 
         <VoiceRecorderTrigger
           contextType="deal"
           contextId={dealId}
           onRecordingComplete={handleVoiceRecording}
           className="shrink-0"
         />
 
         <Button
           onClick={handleSend}
           disabled={disabled || sending || (!message.trim() && !pendingVoiceNote)}
           size="icon"
           className="shrink-0"
         >
           {sending ? (
             <Loader2 className="h-4 w-4 animate-spin" />
           ) : (
             <Send className="h-4 w-4" />
           )}
         </Button>
       </div>
     </div>
   );
 }