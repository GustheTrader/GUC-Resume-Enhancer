import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Client for server-side operations with service role key
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Client for client-side operations with anon key
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage bucket name
export const RESUME_BUCKET = 'resumes';

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFileToSupabase(
  file: Buffer,
  fileName: string,
  contentType: string,
  userId: string
): Promise<{ path: string; publicUrl?: string }> {
  const filePath = `${userId}/${Date.now()}-${fileName}`;

  const { data, error } = await supabaseAdmin.storage
    .from(RESUME_BUCKET)
    .upload(filePath, file, {
      contentType,
      upsert: false,
    });

  if (error) {
    console.error('Supabase upload error:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  // Get public URL (if bucket is public)
  const { data: publicUrlData } = supabaseAdmin.storage
    .from(RESUME_BUCKET)
    .getPublicUrl(filePath);

  return {
    path: data.path,
    publicUrl: publicUrlData.publicUrl,
  };
}

/**
 * Download a file from Supabase Storage
 */
export async function downloadFileFromSupabase(
  filePath: string
): Promise<Blob> {
  const { data, error } = await supabaseAdmin.storage
    .from(RESUME_BUCKET)
    .download(filePath);

  if (error) {
    console.error('Supabase download error:', error);
    throw new Error(`Failed to download file: ${error.message}`);
  }

  return data;
}

/**
 * Get a signed URL for temporary access to a file
 */
export async function getSignedUrl(
  filePath: string,
  expiresIn: number = 3600
): Promise<string> {
  const { data, error } = await supabaseAdmin.storage
    .from(RESUME_BUCKET)
    .createSignedUrl(filePath, expiresIn);

  if (error) {
    console.error('Supabase signed URL error:', error);
    throw new Error(`Failed to create signed URL: ${error.message}`);
  }

  return data.signedUrl;
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFileFromSupabase(filePath: string): Promise<void> {
  const { error } = await supabaseAdmin.storage
    .from(RESUME_BUCKET)
    .remove([filePath]);

  if (error) {
    console.error('Supabase delete error:', error);
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}

/**
 * Get public URL for a file (if bucket is public)
 */
export function getPublicUrl(filePath: string): string {
  const { data } = supabaseAdmin.storage
    .from(RESUME_BUCKET)
    .getPublicUrl(filePath);

  return data.publicUrl;
}
