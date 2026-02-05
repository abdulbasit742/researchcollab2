 import { useState, useEffect } from "react";
 import { motion } from "framer-motion";
 import { 
   Volume2, 
   Mic, 
   Play, 
   Pause, 
   Trash2, 
   Eye, 
   EyeOff,
   CheckCircle,
   Clock
 } from "lucide-react";
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Label } from "@/components/ui/label";
 import { Switch } from "@/components/ui/switch";
 import { Badge } from "@/components/ui/badge";
 import { AudioBioRecorder } from "@/components/profile/AudioBioRecorder";
 import { VoiceBioPlayer } from "@/components/voice/VoiceBioPlayer";
 import { useAuth } from "@/contexts/AuthContext";
 import { supabase } from "@/integrations/supabase/client";
 import { toast } from "sonner";
 
 interface AudioBio {
   id: string;
   storagePath: string;
   durationSeconds: number;
   transcript?: string;
   isPublic: boolean;
   createdAt: string;
 }
 
 export function AudioBioSettings() {
   const { user, profile } = useAuth();
   const [audioBio, setAudioBio] = useState<AudioBio | null>(null);
   const [isPublic, setIsPublic] = useState(true);
   const [isLoading, setIsLoading] = useState(true);
   const [showRecorder, setShowRecorder] = useState(false);
 
   useEffect(() => {
     if (user) {
       fetchAudioBio();
     }
   }, [user]);
 
   const fetchAudioBio = async () => {
     if (!user) return;
     
     setIsLoading(true);
     try {
       // Check profile for audio bio reference
       // This would query from a dedicated table in production
       const { data: voiceNotes } = await supabase
         .from("voice_notes")
         .select("*")
         .eq("user_id", user.id)
         .eq("context_type", "profile_bio")
         .order("created_at", { ascending: false })
         .limit(1);
 
       if (voiceNotes && voiceNotes.length > 0) {
         const note = voiceNotes[0];
         setAudioBio({
           id: note.id,
           storagePath: note.storage_path,
           durationSeconds: note.duration_seconds,
           transcript: note.transcript || undefined,
           isPublic: true, // Would be stored in profile metadata
           createdAt: note.created_at,
         });
         setIsPublic(true);
       }
     } catch (err) {
       console.error("Error fetching audio bio:", err);
     } finally {
       setIsLoading(false);
     }
   };
 
   const handleRecordingComplete = async () => {
     setShowRecorder(false);
     await fetchAudioBio();
     toast.success("Audio introduction saved!");
   };
 
   const handleDelete = async () => {
     if (!audioBio) return;
     
     try {
       await supabase
         .from("voice_notes")
         .delete()
         .eq("id", audioBio.id);
       
       // Also delete from storage
       await supabase.storage
         .from("voice-notes")
         .remove([audioBio.storagePath]);
       
       setAudioBio(null);
       toast.success("Audio introduction deleted");
     } catch (err) {
       console.error("Error deleting audio bio:", err);
       toast.error("Failed to delete audio introduction");
     }
   };
 
   const handleVisibilityToggle = async () => {
     setIsPublic(!isPublic);
     // In production, this would update profile metadata
     toast.success(`Audio introduction is now ${!isPublic ? "public" : "private"}`);
   };
 
   const formatDuration = (seconds: number) => {
     const mins = Math.floor(seconds / 60);
     const secs = seconds % 60;
     return `${mins}:${secs.toString().padStart(2, "0")}`;
   };
 
   if (isLoading) {
     return (
       <Card>
         <CardContent className="py-8">
           <div className="animate-pulse space-y-4">
             <div className="h-4 bg-muted rounded w-1/3" />
             <div className="h-20 bg-muted rounded" />
           </div>
         </CardContent>
       </Card>
     );
   }
 
   return (
     <Card>
       <CardHeader>
         <div className="flex items-center gap-3">
           <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
             <Volume2 className="h-5 w-5 text-primary" />
           </div>
           <div>
             <CardTitle className="text-lg">Audio Introduction</CardTitle>
             <CardDescription>
               Record a 30-second voice introduction for your profile
             </CardDescription>
           </div>
         </div>
       </CardHeader>
       <CardContent className="space-y-4">
         {audioBio ? (
           <>
             {/* Current Audio Bio */}
             <div className="p-4 rounded-lg bg-muted/50 space-y-4">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <CheckCircle className="h-4 w-4 text-emerald-500" />
                   <span className="text-sm font-medium">Audio bio recorded</span>
                   <Badge variant="secondary" className="text-xs">
                     <Clock className="h-3 w-3 mr-1" />
                     {formatDuration(audioBio.durationSeconds)}
                   </Badge>
                 </div>
                 <Button
                   variant="ghost"
                   size="sm"
                   className="text-destructive hover:text-destructive"
                   onClick={handleDelete}
                 >
                   <Trash2 className="h-4 w-4 mr-1" />
                   Delete
                 </Button>
               </div>
 
               {/* Player Preview */}
               <VoiceBioPlayer
                 storagePath={audioBio.storagePath}
                 durationSeconds={audioBio.durationSeconds}
                 userName={profile?.full_name || "You"}
                 showTranscript={!!audioBio.transcript}
                 transcript={audioBio.transcript}
                 className="w-full"
               />
 
               {/* Visibility Toggle */}
               <div className="flex items-center justify-between pt-2 border-t">
                 <div className="flex items-center gap-2">
                   {isPublic ? (
                     <Eye className="h-4 w-4 text-muted-foreground" />
                   ) : (
                     <EyeOff className="h-4 w-4 text-muted-foreground" />
                   )}
                   <Label htmlFor="bio-visibility" className="text-sm">
                     {isPublic ? "Visible on profile" : "Hidden from profile"}
                   </Label>
                 </div>
                 <Switch
                   id="bio-visibility"
                   checked={isPublic}
                   onCheckedChange={handleVisibilityToggle}
                 />
               </div>
             </div>
 
             {/* Re-record Button */}
             <Button
               variant="outline"
               onClick={() => setShowRecorder(true)}
               className="w-full"
             >
               <Mic className="h-4 w-4 mr-2" />
               Record New Introduction
             </Button>
           </>
         ) : (
           <>
             {/* No Audio Bio State */}
             <div className="text-center py-6">
               <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                 <Mic className="h-6 w-6 text-muted-foreground" />
               </div>
               <h4 className="font-medium mb-1">No audio introduction</h4>
               <p className="text-sm text-muted-foreground mb-4">
                 Record a brief audio intro to help others connect with you
               </p>
               <Button onClick={() => setShowRecorder(true)}>
                 <Mic className="h-4 w-4 mr-2" />
                 Record Introduction
               </Button>
             </div>
 
             {/* Tips */}
             <div className="p-3 rounded-lg bg-muted/30 border border-dashed">
               <p className="text-xs text-muted-foreground">
                 <strong>Tips:</strong> Introduce yourself professionally, mention your expertise, 
                 and what kind of collaborations you're looking for. Keep it under 30 seconds.
               </p>
             </div>
           </>
         )}
 
         {/* Recorder Modal/Section */}
         {showRecorder && (
           <AudioBioRecorder
             currentBioPath={audioBio?.storagePath}
             currentTranscript={audioBio?.transcript}
             onSaved={handleRecordingComplete}
           />
         )}
       </CardContent>
     </Card>
   );
 }