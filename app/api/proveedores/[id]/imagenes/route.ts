import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// GET - Obtener imágenes de un proveedor
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('proveedor_imagenes')
      .select('*')
      .eq('proveedor_id', params.id)
      .order('orden', { ascending: true });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      { error: 'Error al obtener imágenes', details: err.message },
      { status: 500 }
    );
  }
}

// POST - Agregar nueva imagen
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { imagen_url, public_id, usuario_id } = body;

    // Verificar que el usuario sea dueño del proveedor
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('proveedor_id')
      .eq('id', usuario_id)
      .single();

    if (!usuario || usuario.proveedor_id !== parseInt(params.id)) {
      return NextResponse.json(
        { error: 'No tienes permiso para agregar imágenes a este proveedor' },
        { status: 403 }
      );
    }

    // Obtener el orden siguiente
    const { data: lastImage } = await supabase
      .from('proveedor_imagenes')
      .select('orden')
      .eq('proveedor_id', params.id)
      .order('orden', { ascending: false })
      .limit(1)
      .maybeSingle();

    const nuevoOrden = lastImage ? lastImage.orden + 1 : 0;

    // Insertar imagen
    const { data, error } = await supabase
      .from('proveedor_imagenes')
      .insert([{
        proveedor_id: parseInt(params.id),
        imagen_url,
        public_id,
        orden: nuevoOrden
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      { error: 'Error al agregar imagen', details: err.message },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar imagen
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imagenId = searchParams.get('imagen_id');
    const usuarioId = searchParams.get('usuario_id');

    if (!imagenId || !usuarioId) {
      return NextResponse.json(
        { error: 'Faltan parámetros' },
        { status: 400 }
      );
    }

    // Verificar permisos
    const { data: imagen } = await supabase
      .from('proveedor_imagenes')
      .select('proveedor_id')
      .eq('id', imagenId)
      .single();

    const { data: usuario } = await supabase
      .from('usuarios')
      .select('proveedor_id')
      .eq('id', usuarioId)
      .single();

    if (!imagen || !usuario || imagen.proveedor_id !== usuario.proveedor_id) {
      return NextResponse.json(
        { error: 'No tienes permiso para eliminar esta imagen' },
        { status: 403 }
      );
    }

    // Eliminar imagen
    const { error } = await supabase
      .from('proveedor_imagenes')
      .delete()
      .eq('id', imagenId);

    if (error) throw error;

    return NextResponse.json({ mensaje: 'Imagen eliminada' });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      { error: 'Error al eliminar imagen', details: err.message },
      { status: 500 }
    );
  }
}