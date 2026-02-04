import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Mic, Trash2, Save, Loader2, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VoiceRecorder } from "@/components/voice/VoiceRecorder";
import { VoiceWaveform } from "@/components/voice/VoiceWaveform";
import { useVoiceRecorder, useVoiceNotes, useVoicePlayer } from "@/hooks/useVoiceNotes";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const MAX_BIO_DURATION = 30; // 30 seconds max for audio bio

interface AudioBioRecorderProps {
  currentBioPath?: string | null;
  currentTranscript?: string | null;
  onSaved?: () => void;
}

export function AudioBioRecorder({
  currentBioPath,
  currentTranscript,
  onSaved,
}: AudioBioRecorderProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { uploadVoiceNote, getPlaybackUrl, isUploading } = useVoiceNotes();
  const recorder = useVoiceRecorder();
  const player = useVoicePlayer();

  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedDuration, setRecordedDuration] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentBioUrl, setCurrentBioUrl] = useState<string | null>(null);

  // Load current bio for playback
  const loadCurrentBio = useCallback(async () => {
    if (currentBioPath && !currentBioUrl) {
      const url = await getPlaybackUrl(currentBioPath);
      if (url) {
        setCurrentBioUrl(url);
        player.loadAudio(url);
      }
    } else if (currentBioUrl) {
      player.loadAudio(currentBioUrl);
    }
  }, [currentBioPath, currentBioUrl, getPlaybackUrl, player]);

  const handleStartRecording = useCallback(async () => {
    setRecordedBlob(null);
    setPreviewUrl(null);
    await recorder.startRecording();
  }, [recorder]);

  const handleStopRecording = useCallback(async () => {
    const blob = await recorder.stopRecording();
    if (blob) {
      setRecordedBlob(blob);
      setRecordedDuration(recorder.duration);
      setPreviewUrl(URL.createObjectURL(blob));
    }
  }, [recorder]);

  // Auto-stop at max duration
  if (recorder.isRecording && recorder.duration >= MAX_BIO_DURATION) {
    handleStopRecording();
  }

  const handleSave = useCallback(async () => {
    if (!recordedBlob || !user) return;

    setIsSaving(true);
    try {
      const voiceNote = await uploadVoiceNote(
        recordedBlob,
        "bio",
        undefined,
        recordedDuration
      );

      if (voiceNote) {
        // Update profile with new audio bio path
        const { error } = await supabase
          .from("profiles")
          .update({
            audio_bio_path: voiceNote.storage_path,
            audio_bio_duration_seconds: recordedDuration,
          })
          .eq("id", user.id);

        if (error) throw error;

        toast({
          title: "Audio bio saved",
          description: "Your voice introduction has been updated.",
        });

        setRecordedBlob(null);
        setPreviewUrl(null);
        onSaved?.();
      }
    } catch (error) {
      toast({
        title: "Failed to save audio bio",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [recordedBlob, recordedDuration, user, uploadVoiceNote, toast, onSaved]);

  const handleDelete = useCallback(async () => {
    if (!user || !currentBioPath) return;

    setIsDeleting(true);
    try {
      // Remove from storage
      const { error: storageError } = await supabase.storage
        .from("voice-notes")
        .remove([currentBioPath]);

      if (storageError) throw storageError;

      // Update profile
      const { error } = await supabase
        .from("profiles")
        .update({
          audio_bio_path: null,
          audio_bio_transcript: null,
          audio_bio_duration_seconds: null,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Audio bio removed",
        description: "Your voice introduction has been deleted.",
      });

      setCurrentBioUrl(null);
      onSaved?.();
    } catch (error) {
      toast({
        title: "Failed to delete audio bio",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  }, [user, currentBioPath, toast, onSaved]);

  const handleDiscard = useCallback(() => {
    recorder.cancelRecording();
    setRecordedBlob(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }, [recorder, previewUrl]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5 text-primary" />
          Voice Introduction
        </CardTitle>
        <CardDescription>
          Record a {MAX_BIO_DURATION}-second audio bio to introduce yourself to potential collaborators
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Bio */}
        {currentBioPath && !recordedBlob && !recorder.isRecording && (
          <div className="p-4 bg-muted rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Current Audio Bio</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-destructive hover:text-destructive"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={async () => {
                  await loadCurrentBio();
                  if (player.isPlaying) {
                    player.pause();
                  } else {
                    player.play();
                  }
                }}
                className="h-10 w-10 rounded-full"
              >
                {player.isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4 ml-0.5" />
                )}
              </Button>

              <VoiceWaveform
                currentTime={player.currentTime}
                duration={player.duration || 30}
                isPlaying={player.isPlaying}
                onSeek={player.seek}
                className="flex-1 h-8"
              />
            </div>

            {currentTranscript && (
              <p className="text-xs text-muted-foreground italic">
                "{currentTranscript}"
              </p>
            )}
          </div>
        )}

        {/* Recording State */}
        {recorder.isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-destructive/5 border border-destructive/20 rounded-lg"
          >
            <div className="flex flex-col items-center gap-4">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-4 h-4 rounded-full bg-destructive"
              />
              
              <VoiceWaveform
                audioLevel={recorder.audioLevel}
                isRecording={true}
                className="w-full h-12"
              />
              
              <div className="text-lg font-mono">
                {formatTime(recorder.duration)} / {formatTime(MAX_BIO_DURATION)}
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleDiscard}>
                  Cancel
                </Button>
                <Button onClick={handleStopRecording}>
                  Stop Recording
                </Button>
              </div>
            </div>

            {recorder.duration >= MAX_BIO_DURATION - 5 && (
              <p className="text-xs text-destructive text-center mt-2">
                {MAX_BIO_DURATION - recorder.duration} seconds remaining
              </p>
            )}
          </motion.div>
        )}

        {/* Preview State */}
        {recordedBlob && previewUrl && !recorder.isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Preview Recording</span>
              <span className="text-xs text-muted-foreground">
                {formatTime(recordedDuration)}
              </span>
            </div>

            <audio src={previewUrl} controls className="w-full" />

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleDiscard}
                className="flex-1"
              >
                Discard
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || isUploading}
                className="flex-1"
              >
                {isSaving || isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Bio
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Record Button */}
        {!recorder.isRecording && !recordedBlob && (
          <Button
            onClick={handleStartRecording}
            variant={currentBioPath ? "outline" : "default"}
            className="w-full"
          >
            <Mic className="h-4 w-4 mr-2" />
            {currentBioPath ? "Record New Bio" : "Record Your Bio"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
