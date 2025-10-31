import { supabase } from '@/lib/supabase';

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';


export async function GET(request: NextRequest) {
  try {
    console.log('========================================');
    console.log('📥 GET /api/proveedores - INICIO');
    console.log('🔑 Verificando variables de entorno...');
    console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configurada' : '❌ NO CONFIGURADA');
    console.log('SUPABASE_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ NO CONFIGURADA');
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    
    console.log('🔍 Parámetros de búsqueda:', search || 'Sin filtro');
    
    console.log('🔄 Construyendo query de Supabase...');
    let query = supabase
      .from('proveedores')
      .select('*')
      .order('id', { ascending: false });

    if (search) {
      console.log('🔎 Aplicando filtro de búsqueda:', search);
      query = query.or(`nombre.ilike.%${search}%,servicio.ilike.%${search}%,ubicacion.ilike.%${search}%,palabras_clave.ilike.%${search}%`);
    }

    console.log('📡 Ejecutando query en Supabase...');
    const { data, error } = await query;
    
    if (error) {
      console.error('❌ Error de Supabase:', JSON.stringify(error, null, 2));
      return NextResponse.json(
        { 
          error: 'Error en consulta a Supabase', 
          details: error.message,
          code: error.code,
          hint: error.hint 
        },
        { status: 500 }
      );
    }

    console.log('✅ Query exitosa. Registros encontrados:', data?.length || 0);
    console.log('========================================');
    
    return NextResponse.json(data || []);
  } catch (error) {
    const err = error as Error;
    console.error('========================================');
    console.error('❌ ERROR CRÍTICO EN GET /api/proveedores');
    console.error('Tipo:', err.name);
    console.error('Mensaje:', err.message);
    console.error('Stack:', err.stack);
    console.error('========================================');
    
    return NextResponse.json(
      { 
        error: 'Error al obtener proveedores', 
        details: err.message,
        type: err.name,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      },
      { status: 500 }
    );
  }
}