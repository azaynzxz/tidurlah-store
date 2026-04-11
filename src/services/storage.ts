import { supabase, isSupabaseConfigured } from '@/lib/supabase';

/**
 * Upload a file to Supabase Storage.
 * Returns the file path (not full URL) on success, or null on failure.
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<string | null> {
  if (!supabase || !isSupabaseConfigured()) return null;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error(`[Storage] Upload failed (${bucket}/${path}):`, error);
    throw error;
  }

  return path;
}

/**
 * Get a public URL for a file in a public bucket.
 */
export function getPublicUrl(bucket: string, path: string): string | null {
  if (!supabase || !isSupabaseConfigured()) return null;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Get a signed/temporary URL for a file in a private bucket.
 * @param expiresIn seconds (default 3600 = 1 hour)
 */
export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn = 3600
): Promise<string | null> {
  if (!supabase || !isSupabaseConfigured()) return null;

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) {
    console.error(`[Storage] Signed URL failed (${bucket}/${path}):`, error);
    return null;
  }

  return data.signedUrl;
}
