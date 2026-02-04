import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export type BriefingType = "week_review" | "deal_status" | "network_pulse";

export interface AudioBriefing {
  id: string;
  type: BriefingType;
  title: string;
  text: string;
  audioUrl?: string;
  generatedAt: string;
  expiresAt: string;
}

interface BriefingCache {
  [key: string]: {
    briefing: AudioBriefing;
    cachedAt: number;
  };
}

const CACHE_DURATION = 1000 * 60 * 60; // 1 hour cache

export function useAudioBriefings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBriefing, setCurrentBriefing] = useState<AudioBriefing | null>(null);
  const cacheRef = useRef<BriefingCache>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);

  const generateBriefing = useCallback(
    async (type: BriefingType): Promise<AudioBriefing | null> => {
      if (!user) return null;

      // Check cache first
      const cacheKey = `${user.id}-${type}`;
      const cached = cacheRef.current[cacheKey];
      if (cached && Date.now() - cached.cachedAt < CACHE_DURATION) {
        setCurrentBriefing(cached.briefing);
        return cached.briefing;
      }

      setIsGenerating(true);
      try {
        const { data, error } = await supabase.functions.invoke("generate-audio-briefing", {
          body: { type },
        });

        if (error) throw error;

        const briefing: AudioBriefing = {
          id: data.id,
          type,
          title: data.title,
          text: data.text,
          audioUrl: data.audioUrl,
          generatedAt: data.generatedAt,
          expiresAt: data.expiresAt,
        };

        // Cache the briefing
        cacheRef.current[cacheKey] = {
          briefing,
          cachedAt: Date.now(),
        };

        setCurrentBriefing(briefing);
        return briefing;
      } catch (error) {
        console.error("Failed to generate briefing:", error);
        toast({
          title: "Briefing generation failed",
          description: "Could not generate your audio briefing.",
          variant: "destructive",
        });
        return null;
      } finally {
        setIsGenerating(false);
      }
    },
    [user, toast]
  );

  const playWithSpeechSynthesis = useCallback((text: string) => {
    if (!("speechSynthesis" in window)) {
      toast({
        title: "Audio not supported",
        description: "Your browser doesn't support text-to-speech.",
        variant: "destructive",
      });
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Try to use a natural-sounding voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) => v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Premium")
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    speechSynthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [toast]);

  const playWithElevenLabs = useCallback(async (briefing: AudioBriefing) => {
    if (!briefing.audioUrl) {
      // Fall back to speech synthesis
      playWithSpeechSynthesis(briefing.text);
      return;
    }

    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const audio = new Audio(briefing.audioUrl);
      audioRef.current = audio;

      audio.onplay = () => setIsPlaying(true);
      audio.onpause = () => setIsPlaying(false);
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        // Fall back to speech synthesis on error
        playWithSpeechSynthesis(briefing.text);
      };

      await audio.play();
    } catch (error) {
      // Fall back to speech synthesis
      playWithSpeechSynthesis(briefing.text);
    }
  }, [playWithSpeechSynthesis]);

  const play = useCallback(
    async (briefingOrType: AudioBriefing | BriefingType) => {
      let briefing: AudioBriefing | null;

      if (typeof briefingOrType === "string") {
        briefing = await generateBriefing(briefingOrType);
      } else {
        briefing = briefingOrType;
        setCurrentBriefing(briefing);
      }

      if (!briefing) return;

      await playWithElevenLabs(briefing);
    },
    [generateBriefing, playWithElevenLabs]
  );

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (speechSynthRef.current) {
      window.speechSynthesis.pause();
    }
    setIsPlaying(false);
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play();
    } else if (speechSynthRef.current) {
      window.speechSynthesis.resume();
    }
    setIsPlaying(true);
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setCurrentBriefing(null);
  }, []);

  const clearCache = useCallback(() => {
    cacheRef.current = {};
  }, []);

  return {
    generateBriefing,
    play,
    pause,
    resume,
    stop,
    isGenerating,
    isPlaying,
    currentBriefing,
    clearCache,
  };
}

// Hook for getting available briefing types with metadata
export function useBriefingTypes() {
  const briefingTypes: Array<{
    type: BriefingType;
    title: string;
    description: string;
    icon: string;
  }> = [
    {
      type: "week_review",
      title: "Week in Review",
      description: "Summary of your weekly progress, opportunities, and trust changes",
      icon: "calendar",
    },
    {
      type: "deal_status",
      title: "Deal Status",
      description: "Overview of your active deals and required actions",
      icon: "briefcase",
    },
    {
      type: "network_pulse",
      title: "Network Pulse",
      description: "Connection activity and introduction suggestions",
      icon: "users",
    },
  ];

  return briefingTypes;
}
