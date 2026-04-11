import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { uploadFile } from './storage';
import type { Database, Json } from '@/types/supabase';

type JobApplicationInsert = Database['public']['Tables']['job_applications']['Insert'];

/**
 * Submit a job application to Supabase (insert row + upload files).
 * Returns the application ID on success, or null if Supabase is not configured.
 */
export async function submitApplicationToSupabase(params: {
  fullName: string;
  email: string;
  phone: string;
  position: string;
  infoSource?: string;
  address?: string;
  cv?: File;
  portfolio?: File;
}): Promise<string | null> {
  if (!supabase || !isSupabaseConfigured()) return null;

  let cvPath: string | null = null;
  let portfolioPath: string | null = null;

  // Upload CV if provided
  if (params.cv) {
    const ext = params.cv.name.split('.').pop() || 'pdf';
    const safeName = `${Date.now()}-${params.fullName.replace(/[^a-zA-Z0-9]/g, '_')}.${ext}`;
    cvPath = await uploadFile('applications', `cv/${safeName}`, params.cv);
  }

  // Upload portfolio if provided
  if (params.portfolio) {
    const ext = params.portfolio.name.split('.').pop() || 'pdf';
    const safeName = `${Date.now()}-${params.fullName.replace(/[^a-zA-Z0-9]/g, '_')}-portfolio.${ext}`;
    portfolioPath = await uploadFile('applications', `portfolio/${safeName}`, params.portfolio);
  }

  const row: JobApplicationInsert = {
    full_name: params.fullName,
    email: params.email,
    phone: params.phone,
    position: params.position,
    info_source: params.infoSource || null,
    address: params.address || null,
    cv_url: cvPath,
    portfolio_url: portfolioPath,
    motivation: '',
  };

  const { data, error } = await supabase
    .from('job_applications')
    .insert(row)
    .select('id')
    .single();

  if (error) {
    console.error('[Applications] Insert failed:', error);
    throw error;
  }

  return data!.id;
}

/**
 * Submit a survey response to Supabase.
 * Returns the response ID on success, or null if Supabase is not configured.
 */
export async function submitSurveyToSupabase(params: {
  respondentName?: string;
  responses: Record<string, unknown>;
}): Promise<string | null> {
  if (!supabase || !isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from('survey_responses')
    .insert({
      survey_type: 'general',
      respondent_name: params.respondentName || null,
      responses: params.responses as Json,
    })
    .select('id')
    .single();

  if (error) {
    console.error('[Survey] Insert failed:', error);
    throw error;
  }

  return data!.id;
}
