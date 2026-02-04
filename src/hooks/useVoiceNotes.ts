import { useState, useRef, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface VoiceNote {
  id: string;
  user_id: string;
  context_type: "message" | "deal" | "bio" | "feedback";
  context_id: string | null;
  storage_path: string;
  duration_seconds: number;
  transcript: string | null;
  sentiment_score: number | null;
  created_at: string;
  metadata: Record<string, unknown>;
}

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioLevel: number;
}

const MAX_DURATION_SECONDS = 300; // 5 minutes

export function useVoiceRecorder() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [state, setState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    audioLevel: 0,
  });
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  const getMimeType = useCallback(() => {
    // Prefer WebM/Opus, fallback to MP4/AAC for Safari
    if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
      return "audio/webm;codecs=opus";
    }
    if (MediaRecorder.isTypeSupported("audio/mp4")) {
      return "audio/mp4";
    }
    return "audio/webm";
  }, []);

  const startRecording = useCallback(async () => {
    if (!user) {
      toast({ title: "Please sign in to record", variant: "destructive" });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Set up audio analysis for level metering
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mimeType = getMimeType();
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(1000); // Collect data every second

      setState((prev) => ({
        ...prev,
        isRecording: true,
        isPaused: false,
        duration: 0,
      }));

      // Start duration timer
      const startTime = Date.now();
      timerRef.current = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        if (elapsed >= MAX_DURATION_SECONDS) {
          stopRecording();
          toast({ title: "Maximum recording duration reached (5 minutes)" });
        } else {
          setState((prev) => ({ ...prev, duration: elapsed }));
        }
      }, 1000);

      // Start audio level animation
      const updateLevel = () => {
        if (analyserRef.current) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
          setState((prev) => ({ ...prev, audioLevel: average / 255 }));
        }
        animationRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();

    } catch (error) {
      console.error("Failed to start recording:", error);
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to record voice notes.",
        variant: "destructive",
      });
    }
  }, [user, toast, getMimeType]);

  const stopRecording = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }

      const mediaRecorder = mediaRecorderRef.current;
      if (!mediaRecorder || mediaRecorder.state === "inactive") {
        setState((prev) => ({ ...prev, isRecording: false, isPaused: false }));
        resolve(null);
        return;
      }

      mediaRecorder.onstop = () => {
        const mimeType = getMimeType();
        const blob = new Blob(chunksRef.current, { type: mimeType });
        chunksRef.current = [];

        // Stop all tracks
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;

        setState((prev) => ({
          ...prev,
          isRecording: false,
          isPaused: false,
          audioLevel: 0,
        }));

        resolve(blob);
      };

      mediaRecorder.stop();
    });
  }, [getMimeType]);

  const pauseRecording = useCallback(() => {
    const mediaRecorder = mediaRecorderRef.current;
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.pause();
      if (timerRef.current) clearInterval(timerRef.current);
      setState((prev) => ({ ...prev, isPaused: true }));
    }
  }, []);

  const resumeRecording = useCallback(() => {
    const mediaRecorder = mediaRecorderRef.current;
    if (mediaRecorder && mediaRecorder.state === "paused") {
      mediaRecorder.resume();
      const resumeTime = Date.now();
      const currentDuration = state.duration;
      
      timerRef.current = window.setInterval(() => {
        const elapsed = currentDuration + Math.floor((Date.now() - resumeTime) / 1000);
        if (elapsed >= MAX_DURATION_SECONDS) {
          stopRecording();
          toast({ title: "Maximum recording duration reached (5 minutes)" });
        } else {
          setState((prev) => ({ ...prev, duration: elapsed }));
        }
      }, 1000);
      
      setState((prev) => ({ ...prev, isPaused: false }));
    }
  }, [state.duration, stopRecording, toast]);

  const cancelRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    const mediaRecorder = mediaRecorderRef.current;
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    chunksRef.current = [];

    setState({
      isRecording: false,
      isPaused: false,
      duration: 0,
      audioLevel: 0,
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelRecording();
    };
  }, [cancelRecording]);

  return {
    ...state,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    cancelRecording,
    maxDuration: MAX_DURATION_SECONDS,
  };
}

export function useVoiceNotes(contextType?: string, contextId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const fetchVoiceNotes = useCallback(async () => {
    if (!user) {
      setVoiceNotes([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      let query = supabase
        .from("voice_notes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (contextType) {
        query = query.eq("context_type", contextType);
      }
      if (contextId) {
        query = query.eq("context_id", contextId);
      }

      const { data, error } = await query;
      if (error) throw error;

      setVoiceNotes((data as VoiceNote[]) || []);
    } catch (error) {
      console.error("Failed to fetch voice notes:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, contextType, contextId]);

  useEffect(() => {
    fetchVoiceNotes();
  }, [fetchVoiceNotes]);

  const uploadVoiceNote = useCallback(
    async (
      blob: Blob,
      contextType: VoiceNote["context_type"],
      contextId?: string,
      duration?: number
    ): Promise<VoiceNote | null> => {
      if (!user) {
        toast({ title: "Please sign in to upload", variant: "destructive" });
        return null;
      }

      setIsUploading(true);
      try {
        // Generate unique filename
        const extension = blob.type.includes("webm") ? "webm" : "mp4";
        const filename = `${user.id}/${Date.now()}.${extension}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from("voice-notes")
          .upload(filename, blob, {
            contentType: blob.type,
            cacheControl: "3600",
          });

        if (uploadError) throw uploadError;

        // Create database record
        const { data: voiceNote, error: dbError } = await supabase
          .from("voice_notes")
          .insert({
            user_id: user.id,
            context_type: contextType,
            context_id: contextId || null,
            storage_path: filename,
            duration_seconds: duration || 0,
          })
          .select()
          .single();

        if (dbError) throw dbError;

        // Trigger transcription in background (non-blocking)
        supabase.functions
          .invoke("transcribe-voice-note", {
            body: { voiceNoteId: voiceNote.id },
          })
          .catch((err) => console.warn("Transcription failed:", err));

        setVoiceNotes((prev) => [voiceNote as VoiceNote, ...prev]);
        toast({ title: "Voice note saved" });
        
        return voiceNote as VoiceNote;
      } catch (error) {
        console.error("Failed to upload voice note:", error);
        toast({
          title: "Failed to save voice note",
          description: "Please try again.",
          variant: "destructive",
        });
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [user, toast]
  );

  const deleteVoiceNote = useCallback(
    async (voiceNoteId: string) => {
      if (!user) return false;

      try {
        const voiceNote = voiceNotes.find((vn) => vn.id === voiceNoteId);
        if (!voiceNote) return false;

        // Delete from storage
        await supabase.storage
          .from("voice-notes")
          .remove([voiceNote.storage_path]);

        // Delete from database
        const { error } = await supabase
          .from("voice_notes")
          .delete()
          .eq("id", voiceNoteId);

        if (error) throw error;

        setVoiceNotes((prev) => prev.filter((vn) => vn.id !== voiceNoteId));
        toast({ title: "Voice note deleted" });
        return true;
      } catch (error) {
        console.error("Failed to delete voice note:", error);
        toast({
          title: "Failed to delete voice note",
          variant: "destructive",
        });
        return false;
      }
    },
    [user, voiceNotes, toast]
  );

  const getPlaybackUrl = useCallback(
    async (storagePath: string): Promise<string | null> => {
      try {
        const { data } = await supabase.storage
          .from("voice-notes")
          .createSignedUrl(storagePath, 3600); // 1 hour expiry

        return data?.signedUrl || null;
      } catch (error) {
        console.error("Failed to get playback URL:", error);
        return null;
      }
    },
    []
  );

  return {
    voiceNotes,
    isLoading,
    isUploading,
    uploadVoiceNote,
    deleteVoiceNote,
    getPlaybackUrl,
    refetch: fetchVoiceNotes,
  };
}

export function useVoicePlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number | null>(null);

  const loadAudio = useCallback((url: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(url);
    audioRef.current = audio;

    audio.onloadedmetadata = () => {
      setDuration(audio.duration);
    };

    audio.onended = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };

    return audio;
  }, []);

  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.playbackRate = playbackRate;
    audio.play();
    setIsPlaying(true);

    const updateTime = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
        animationRef.current = requestAnimationFrame(updateTime);
      }
    };
    updateTime();
  }, [playbackRate]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const changePlaybackRate = useCallback((rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return {
    isPlaying,
    currentTime,
    duration,
    playbackRate,
    loadAudio,
    play,
    pause,
    seek,
    changePlaybackRate,
  };
}
