import { supabase } from "@/integrations/supabase/client";

/**
 * Storage Service — secure file upload/download for all bucket types.
 *
 * Buckets: avatars, documents, contracts, workroom-files, institution-assets
 * All paths use structured naming: /{category}/{entityId}/{filename}
 */

type BucketName = "avatars" | "documents" | "contracts" | "workroom-files" | "institution-assets";

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").substring(0, 200);
}

function buildPath(segments: string[], filename: string): string {
  return [...segments, `${Date.now()}_${sanitizeFilename(filename)}`].join("/");
}

export async function uploadAvatar(file: File, userId: string): Promise<string> {
  if (file.size > 5 * 1024 * 1024) throw new Error("Avatar must be under 5MB");
  if (!file.type.startsWith("image/")) throw new Error("File must be an image");

  const path = buildPath([userId], file.name);
  const { error } = await supabase.storage.from("avatars").upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  if (error) throw error;

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadDocument(file: File, dealId: string): Promise<string> {
  if (file.size > 20 * 1024 * 1024) throw new Error("Document must be under 20MB");

  const path = buildPath(["deals", dealId, "documents"], file.name);
  const { error } = await supabase.storage.from("documents").upload(path, file, {
    contentType: file.type,
  });
  if (error) throw error;
  return path;
}

export async function uploadContract(file: File, dealId: string): Promise<string> {
  if (file.size > 20 * 1024 * 1024) throw new Error("Contract must be under 20MB");

  const path = buildPath(["deals", dealId], file.name);
  const { error } = await supabase.storage.from("contracts").upload(path, file, {
    contentType: file.type,
  });
  if (error) throw error;
  return path;
}

export async function uploadWorkroomFile(file: File, workroomId: string): Promise<string> {
  if (file.size > 20 * 1024 * 1024) throw new Error("File must be under 20MB");

  const path = buildPath(["workrooms", workroomId], file.name);
  const { error } = await supabase.storage.from("workroom-files").upload(path, file, {
    contentType: file.type,
  });
  if (error) throw error;
  return path;
}

export async function uploadInstitutionAsset(file: File, orgId: string): Promise<string> {
  if (file.size > 20 * 1024 * 1024) throw new Error("File must be under 20MB");

  const path = buildPath(["orgs", orgId], file.name);
  const { error } = await supabase.storage.from("institution-assets").upload(path, file, {
    contentType: file.type,
  });
  if (error) throw error;

  const { data } = supabase.storage.from("institution-assets").getPublicUrl(path);
  return data.publicUrl;
}

export async function getSignedUrl(bucket: BucketName, path: string, expiresIn = 3600): Promise<string> {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error) throw error;
  return data.signedUrl;
}

export async function deleteFile(bucket: BucketName, path: string): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}

export async function listFiles(bucket: BucketName, folder: string) {
  const { data, error } = await supabase.storage.from(bucket).list(folder, {
    limit: 100,
    sortBy: { column: "created_at", order: "desc" },
  });
  if (error) throw error;
  return data ?? [];
}
