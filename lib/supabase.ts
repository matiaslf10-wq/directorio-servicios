import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper para queries directas (compatible con el código actual)
export async function query(sql: string, params: any[] = []) {
  try {
    const { data, error } = await supabase.rpc('execute_sql', {
      query: sql,
      params: params
    });
    
    if (error) throw error;
    return [data];
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}