-- Add audio_bio_path column to profiles table for voice introductions
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS audio_bio_path text,
ADD COLUMN IF NOT EXISTS audio_bio_transcript text,
ADD COLUMN IF NOT EXISTS audio_bio_duration_seconds integer;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.audio_bio_path IS '30-second audio introduction stored in voice-notes bucket';
COMMENT ON COLUMN public.profiles.audio_bio_transcript IS 'AI-generated transcript of the audio bio';
COMMENT ON COLUMN public.profiles.audio_bio_duration_seconds IS 'Duration of audio bio in seconds';