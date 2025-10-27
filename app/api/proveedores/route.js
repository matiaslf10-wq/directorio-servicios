import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    console.log('📥 GET /api/proveedores - Iniciando petición');
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    
    console.log('🔍 Término de búsqueda:', search || 'Sin filtro');
    
    let query = supabase
      .from('proveedores')
      .select('*')
      .order('id', { ascending: false });

    if (search) {
      query = query.or(`nombre.ilike.%${search}%,servicio.ilike.%${search}%,ubicacion.ilike.%${search}%,palabras_clave.ilike.%${search}%`);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('❌ Error de Supabase:', error);
      throw error;
    }

    console.log('✅ Proveedores encontrados:', data?.length || 0);
    
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('❌ Error al obtener proveedores:', error);
    return NextResponse.json(
      { error: 'Error al obtener proveedores', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    console.log('📤 POST /api/proveedores - Iniciando registro');
    
    const body = await request.json();
    console.log('📋 Datos recibidos:', body);
    
    const { nombre, servicio, email, telefono, ubicacion, palabras_clave } = body;

    if (!nombre || !servicio || !email || !telefono || !ubicacion || !palabras_clave) {
      console.log('⚠️ Validación fallida - Campos faltantes');
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('proveedores')
      .insert([{
        nombre,
        servicio,
        email,
        telefono,
        ubicacion,
        palabras_clave
      }])
      .select();

    if (error) {
      console.error('❌ Error de Supabase:', error);
      throw error;
    }

    console.log('✅ Proveedor registrado exitosamente. ID:', data[0].id);
    
    return NextResponse.json({ 
      id: data[0].id,
      mensaje: 'Proveedor registrado exitosamente' 
    }, { status: 201 });
  } catch (error) {
    console.error('❌ Error al crear proveedor:', error);
    return NextResponse.json(
      { error: 'Error al registrar proveedor', details: error.message },
      { status: 500 }
    );
  }
}
