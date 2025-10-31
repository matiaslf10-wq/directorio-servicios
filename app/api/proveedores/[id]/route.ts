import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// GET - Obtener un proveedor específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('📥 GET /api/proveedores/[id] - ID:', id);
    
    const { data, error } = await supabase
      .from('proveedores')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Error de Supabase:', error);
      throw error;
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Proveedor no encontrado' },
        { status: 404 }
      );
    }

    console.log('✅ Proveedor encontrado:', data.nombre);
    
    return NextResponse.json(data);
  } catch (error) {
    const err = error as Error;
    console.error('❌ Error al obtener proveedor:', err);
    return NextResponse.json(
      { error: 'Error al obtener proveedor', details: err.message },
      { status: 500 }
    );
  }
}

// PUT - Actualizar un proveedor específico
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('🔄 PUT /api/proveedores/[id] - ID:', id);
    
    const body = await request.json();
    const { nombre, servicio, email, telefono, ubicacion, palabras_clave, usuario_id } = body;

    if (!usuario_id) {
      return NextResponse.json(
        { error: 'ID de usuario es obligatorio' },
        { status: 400 }
      );
    }

    // Verificar que el usuario sea dueño del proveedor
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('proveedor_id')
      .eq('id', usuario_id)
      .single();

    if (!usuario || usuario.proveedor_id !== parseInt(id)) {
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

// DELETE - Eliminar un proveedor específico
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('🗑️ DELETE /api/proveedores/[id] - ID:', id);
    
    const { searchParams } = new URL(request.url);
    const usuarioId = searchParams.get('usuario_id');

    if (!usuarioId) {
      return NextResponse.json(
        { error: 'ID de usuario es obligatorio' },
        { status: 400 }
      );
    }

    // Verificar que el usuario sea dueño del proveedor
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('proveedor_id')
      .eq('id', usuarioId)
      .single();

    if (!usuario || usuario.proveedor_id !== parseInt(id)) {
      return NextResponse.json(
        { error: 'No tienes permiso para eliminar este proveedor' },
        { status: 403 }
      );
    }

    // Eliminar proveedor (esto también eliminará el usuario por CASCADE)
    const { error } = await supabase
      .from('proveedores')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error al eliminar:', error);
      throw error;
    }

    console.log('✅ Proveedor eliminado');
    
    return NextResponse.json({ 
      mensaje: 'Proveedor eliminado exitosamente'
    });
  } catch (error) {
    const err = error as Error;
    console.error('❌ Error:', err);
    return NextResponse.json(
      { error: 'Error al eliminar proveedor', details: err.message },
      { status: 500 }
    );
  }
}