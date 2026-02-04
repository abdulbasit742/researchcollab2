import { useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface VoiceWaveformProps {
  audioLevel?: number; // 0-1 for recording mode
  audioData?: number[]; // Pre-computed waveform data for playback
  currentTime?: number;
  duration?: number;
  isRecording?: boolean;
  isPlaying?: boolean;
  onSeek?: (time: number) => void;
  className?: string;
  barColor?: string;
  progressColor?: string;
}

export function VoiceWaveform({
  audioLevel = 0,
  audioData,
  currentTime = 0,
  duration = 0,
  isRecording = false,
  isPlaying = false,
  onSeek,
  className,
  barColor = "hsl(var(--muted-foreground))",
  progressColor = "hsl(var(--primary))",
}: VoiceWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const barsRef = useRef<number[]>([]);
  const animationRef = useRef<number | null>(null);

  // Generate random bars for recording visualization
  const generateRecordingBars = useCallback((level: number) => {
    const barCount = 40;
    const bars: number[] = [];
    
    for (let i = 0; i < barCount; i++) {
      // Create a wave pattern with randomness influenced by audio level
      const baseHeight = 0.2 + Math.sin(i * 0.3 + Date.now() * 0.003) * 0.15;
      const levelInfluence = level * (0.3 + Math.random() * 0.5);
      bars.push(Math.min(1, baseHeight + levelInfluence));
    }
    
    return bars;
  }, []);

  // Draw waveform on canvas
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvas;
    const dpr = window.devicePixelRatio || 1;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    const bars = isRecording ? generateRecordingBars(audioLevel) : (audioData || barsRef.current);
    if (bars.length === 0) return;

    const barWidth = (width / dpr) / bars.length;
    const gap = 2;
    const actualBarWidth = Math.max(2, barWidth - gap);
    const centerY = (height / dpr) / 2;
    const maxBarHeight = (height / dpr) * 0.8;

    const progress = duration > 0 ? currentTime / duration : 0;

    bars.forEach((value, index) => {
      const x = index * barWidth + gap / 2;
      const barHeight = value * maxBarHeight;
      const y = centerY - barHeight / 2;

      // Determine color based on progress
      const barProgress = index / bars.length;
      ctx.fillStyle = barProgress <= progress ? progressColor : barColor;

      // Draw rounded bar
      ctx.beginPath();
      ctx.roundRect(x * dpr, y * dpr, actualBarWidth * dpr, barHeight * dpr, 2);
      ctx.fill();
    });
  }, [isRecording, audioLevel, audioData, currentTime, duration, barColor, progressColor, generateRecordingBars]);

  // Animation loop for recording
  useEffect(() => {
    if (isRecording) {
      const animate = () => {
        drawWaveform();
        animationRef.current = requestAnimationFrame(animate);
      };
      animate();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      drawWaveform();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRecording, drawWaveform]);

  // Handle canvas click for seeking
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!onSeek || duration <= 0) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const progress = x / rect.width;
      const newTime = progress * duration;
      
      onSeek(Math.max(0, Math.min(duration, newTime)));
    },
    [onSeek, duration]
  );

  // Setup canvas with proper DPR
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
      
      drawWaveform();
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [drawWaveform]);

  // Generate static waveform data for playback mode
  useEffect(() => {
    if (!isRecording && !audioData) {
      const barCount = 40;
      const bars: number[] = [];
      for (let i = 0; i < barCount; i++) {
        bars.push(0.2 + Math.random() * 0.6);
      }
      barsRef.current = bars;
      drawWaveform();
    }
  }, [isRecording, audioData, drawWaveform]);

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      className={cn(
        "w-full h-12 rounded-lg",
        onSeek && "cursor-pointer",
        className
      )}
      style={{ touchAction: "none" }}
    />
  );
}
