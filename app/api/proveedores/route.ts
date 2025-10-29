// app/api/proveedores/route.ts - Con Supabase
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
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
    const err = error as Error;
    console.error('❌ Error al obtener proveedores:', err);
    return NextResponse.json(
      { error: 'Error al obtener proveedores', details: err.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📤 POST /api/proveedores - Iniciando registro');
    
    const body = await request.json();
    console.log('📋 Datos recibidos:', body);
    
    const { nombre, servicio, email, telefono, ubicacion, palabras_clave, usuario, password } = body;

    if (!nombre || !servicio || !email || !telefono || !ubicacion || !palabras_clave || !usuario || !password) {
      console.log('⚠️ Validación fallida - Campos faltantes');
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios' },
        { status: 400 }
      );
    }

    // Verificar si ya existe un proveedor con el mismo email
    const { data: existingProvider } = await supabase
      .from('proveedores')
      .select('id, nombre, email')
      .eq('email', email)
      .maybeSingle();

    if (existingProvider) {
      console.log('⚠️ Email ya registrado:', email);
      return NextResponse.json(
        { error: `El email ${email} ya está registrado para ${existingProvider.nombre}` },
        { status: 409 }
      );
    }

    // Verificar si ya existe un proveedor con el mismo teléfono
    const { data: existingPhone } = await supabase
      .from('proveedores')
      .select('id, nombre, telefono')
      .eq('telefono', telefono)
      .maybeSingle();

    if (existingPhone) {
      console.log('⚠️ Teléfono ya registrado:', telefono);
      return NextResponse.json(
        { error: `El teléfono ${telefono} ya está registrado para ${existingPhone.nombre}` },
        { status: 409 }
      );
    }

    // Verificar si el nombre de usuario ya existe
    const { data: existingUser } = await supabase
      .from('usuarios')
      .select('id, usuario')
      .eq('usuario', usuario)
      .maybeSingle();

    if (existingUser) {
      console.log('⚠️ Usuario ya existe:', usuario);
      return NextResponse.json(
        { error: `El nombre de usuario "${usuario}" ya está en uso` },
        { status: 409 }
      );
    }

    // 1. Crear el proveedor
    const { data: proveedorData, error: proveedorError } = await supabase
      .from('proveedores')
      .insert([{
        nombre,
        servicio,
        email,
        telefono,
        ubicacion,
        palabras_clave
      }])
      .select()
      .single();

    if (proveedorError) {
      console.error('❌ Error al crear proveedor:', proveedorError);
      throw proveedorError;
    }

    console.log('✅ Proveedor creado. ID:', proveedorData.id);

    // 2. Crear el usuario vinculado al proveedor
    const { data: usuarioData, error: usuarioError } = await supabase
      .from('usuarios')
      .insert([{
        usuario,
        password, // En producción deberías hashear la contraseña
        nombre_completo: nombre,
        email,
        proveedor_id: proveedorData.id
      }])
      .select()
      .single();

    if (usuarioError) {
      // Si falla la creación del usuario, eliminar el proveedor
      await supabase.from('proveedores').delete().eq('id', proveedorData.id);
      console.error('❌ Error al crear usuario:', usuarioError);
      throw usuarioError;
    }

    console.log('✅ Usuario creado. ID:', usuarioData.id);
    
    return NextResponse.json({ 
      id: proveedorData.id,
      usuario_id: usuarioData.id,
      mensaje: 'Proveedor y usuario registrados exitosamente' 
    }, { status: 201 });
  } catch (error) {
    const err = error as Error;
    console.error('❌ Error al crear proveedor:', err);
    return NextResponse.json(
      { error: 'Error al registrar proveedor', details: err.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('🔄 PUT /api/proveedores - Actualizando proveedor');
    
    const body = await request.json();
    const { id, nombre, servicio, email, telefono, ubicacion, palabras_clave, usuario_id } = body;

    if (!id || !usuario_id) {
      return NextResponse.json(
        { error: 'ID de proveedor y usuario son obligatorios' },
        { status: 400 }
      );
    }

    // Verificar que el usuario sea dueño del proveedor
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('proveedor_id')
      .eq('id', usuario_id)
      .single();

    if (!usuario || usuario.proveedor_id !== id) {
      return NextResponse.json(
        { error: 'No tienes permiso para editar este proveedor' },
        { status: 403 }
      );
    }

    // Actualizar proveedor
    const { data, error } = await supabase
      .from('proveedores')
      .update({
        nombre,
        servicio,
        email,
        telefono,
        ubicacion,
        palabras_clave
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error al actualizar:', error);
      throw error;
    }

    console.log('✅ Proveedor actualizado');
    
    return NextResponse.json({ 
      mensaje: 'Proveedor actualizado exitosamente',
      data 
    });
  } catch (error) {
    const err = error as Error;
    console.error('❌ Error:', err);
    return NextResponse.json(
      { error: 'Error al actualizar proveedor', details: err.message },
      { status: 500 }
    );
  }
}