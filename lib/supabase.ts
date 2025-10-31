import { createClient } from '@supabase/supabase-js';

// Variables de entorno: configuradas en Vercel
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validar que las variables existan
if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    '❌ Faltan variables de entorno de Supabase. ' +
    'Asegúrate de configurar NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY'
  );
}

// Creamos el cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper para ejecutar consultas directas (por ejemplo, usando RPC)
export async function query(sql: string, params: (string | number | boolean | null)[] = []) {
  try {
    const { data, error } = await supabase.rpc('execute_sql', {
      query: sql,
      params: params
    });

    if (error) throw error;
    return [data];
  } catch (error) {
    console.error('❌ Error en query:', error);
    throw error;
  }
}