import { supabase } from "@/integrations/supabase/client";

export async function uploadMedia(
  file: File,
  bucket: "post-media" | "story-media",
  userId: string
): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
  return data.publicUrl;
}

export function validateImageFile(file: File): string | null {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Only JPEG, PNG, WebP, and GIF images are allowed.";
  }
  if (file.size > MAX_SIZE) {
    return "Image must be less than 10MB.";
  }
  return null;
}
