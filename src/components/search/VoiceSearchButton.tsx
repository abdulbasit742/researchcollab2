 import { useState, useCallback, useEffect, useRef } from "react";
 import { motion, AnimatePresence } from "framer-motion";
 import { Mic, MicOff, Loader2, X } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { cn } from "@/lib/utils";
 import { toast } from "sonner";
 
 interface VoiceSearchButtonProps {
   onTranscript: (text: string) => void;
   onListeningChange?: (isListening: boolean) => void;
   className?: string;
   autoSubmit?: boolean;
 }
 
 // Web Speech API types
 interface SpeechRecognitionEvent extends Event {
   results: SpeechRecognitionResultList;
   resultIndex: number;
 }
 
 interface SpeechRecognitionErrorEvent extends Event {
   error: string;
   message?: string;
 }
 
 export function VoiceSearchButton({
   onTranscript,
   onListeningChange,
   className,
   autoSubmit = true,
 }: VoiceSearchButtonProps) {
   const [isListening, setIsListening] = useState(false);
   const [isSupported, setIsSupported] = useState(true);
   const [interimTranscript, setInterimTranscript] = useState("");
   const recognitionRef = useRef<any>(null);
 
   useEffect(() => {
     // Check browser support
     const SpeechRecognition =
       (window as any).SpeechRecognition ||
       (window as any).webkitSpeechRecognition;
 
     if (!SpeechRecognition) {
       setIsSupported(false);
       return;
     }
 
     const recognition = new SpeechRecognition();
     recognition.continuous = false;
     recognition.interimResults = true;
     recognition.lang = "en-US";
 
     recognition.onstart = () => {
       setIsListening(true);
       onListeningChange?.(true);
     };
 
     recognition.onresult = (event: SpeechRecognitionEvent) => {
       let interim = "";
       let final = "";
 
       for (let i = event.resultIndex; i < event.results.length; i++) {
         const transcript = event.results[i][0].transcript;
         if (event.results[i].isFinal) {
           final += transcript;
         } else {
           interim += transcript;
         }
       }
 
       setInterimTranscript(interim);
 
       if (final) {
         onTranscript(final.trim());
         setInterimTranscript("");
       }
     };
 
     recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
       console.error("Speech recognition error:", event.error);
       setIsListening(false);
       onListeningChange?.(false);
       setInterimTranscript("");
 
       if (event.error === "not-allowed") {
         toast.error("Microphone access denied. Please enable it in your browser settings.");
       } else if (event.error !== "aborted") {
         toast.error("Voice recognition failed. Please try again.");
       }
     };
 
     recognition.onend = () => {
       setIsListening(false);
       onListeningChange?.(false);
     };
 
     recognitionRef.current = recognition;
 
     return () => {
       recognition.abort();
     };
   }, [onTranscript, onListeningChange]);
 
   const toggleListening = useCallback(() => {
     if (!recognitionRef.current) return;
 
     if (isListening) {
       recognitionRef.current.stop();
     } else {
       setInterimTranscript("");
       try {
         recognitionRef.current.start();
       } catch (err) {
         // Recognition might already be running
         console.error("Failed to start recognition:", err);
       }
     }
   }, [isListening]);
 
   if (!isSupported) {
     return (
       <Button
         variant="ghost"
         size="icon"
         disabled
         title="Voice search not supported in this browser"
         className={cn("h-9 w-9", className)}
       >
         <MicOff className="h-4 w-4 text-muted-foreground" />
       </Button>
     );
   }
 
   return (
     <div className="relative">
       <Button
         variant={isListening ? "default" : "ghost"}
         size="icon"
         onClick={toggleListening}
         title={isListening ? "Stop listening" : "Voice search"}
         className={cn(
           "h-9 w-9 transition-all",
           isListening && "bg-primary text-primary-foreground animate-pulse",
           className
         )}
       >
         {isListening ? (
           <motion.div
             animate={{ scale: [1, 1.1, 1] }}
             transition={{ repeat: Infinity, duration: 1 }}
           >
             <Mic className="h-4 w-4" />
           </motion.div>
         ) : (
           <Mic className="h-4 w-4" />
         )}
       </Button>
 
       {/* Listening Indicator Popup */}
       <AnimatePresence>
         {isListening && (
           <motion.div
             initial={{ opacity: 0, y: 10, scale: 0.9 }}
             animate={{ opacity: 1, y: 0, scale: 1 }}
             exit={{ opacity: 0, y: 10, scale: 0.9 }}
             className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50"
           >
             <div className="bg-popover border rounded-lg shadow-lg p-3 min-w-[200px]">
               <div className="flex items-center gap-2 mb-2">
                 <motion.div
                   animate={{ scale: [1, 1.2, 1] }}
                   transition={{ repeat: Infinity, duration: 0.8 }}
                   className="w-3 h-3 rounded-full bg-red-500"
                 />
                 <span className="text-sm font-medium">Listening...</span>
                 <Button
                   variant="ghost"
                   size="icon"
                   className="h-6 w-6 ml-auto"
                   onClick={toggleListening}
                 >
                   <X className="h-3 w-3" />
                 </Button>
               </div>
               
               {interimTranscript && (
                 <p className="text-sm text-muted-foreground italic">
                   "{interimTranscript}"
                 </p>
               )}
               
               {/* Sound wave animation */}
               <div className="flex items-center justify-center gap-0.5 h-6 mt-2">
                 {[...Array(7)].map((_, i) => (
                   <motion.div
                     key={i}
                     className="w-1 rounded-full bg-primary"
                     animate={{
                       height: [4, 16, 4],
                     }}
                     transition={{
                       repeat: Infinity,
                       duration: 0.6,
                       delay: i * 0.1,
                       ease: "easeInOut",
                     }}
                   />
                 ))}
               </div>
             </div>
           </motion.div>
         )}
       </AnimatePresence>
     </div>
   );
 }
 
 // Compact version for inline use
 export function VoiceSearchTrigger({
   onTranscript,
   className,
 }: {
   onTranscript: (text: string) => void;
   className?: string;
 }) {
   const [isListening, setIsListening] = useState(false);
 
   return (
     <VoiceSearchButton
       onTranscript={onTranscript}
       onListeningChange={setIsListening}
       className={cn(
         isListening && "ring-2 ring-primary ring-offset-2",
         className
       )}
     />
   );
 }