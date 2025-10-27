import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
  try {
    console.log('🔄 PUT /api/proveedores - Actualizando proveedor');
    
    const { id } = params;
    const body = await request.json();
    const { nombre, servicio, email, telefono, ubicacion, palabras_clave } = body;

    console.log('ID a actualizar:', id);
    console.log('Nuevos datos:', body);

    const query = `
      UPDATE proveedores 
      SET nombre = ?, servicio = ?, email = ?, telefono = ?, ubicacion = ?, palabras_clave = ?
      WHERE id = ?
    `;
    
    const [result] = await pool.execute(query, [
      nombre,
      servicio,
      email,
      telefono,
      ubicacion,
      palabras_clave,
      id
    ]);

    console.log('✅ Proveedor actualizado. Filas afectadas:', result.affectedRows);

    return NextResponse.json({ 
      mensaje: 'Proveedor actualizado exitosamente',
      affectedRows: result.affectedRows 
    });
  } catch (error) {
    console.error('❌ Error al actualizar proveedor:', error);
    console.error('Stack trace:', error.stack);
    return NextResponse.json(
      { error: 'Error al actualizar proveedor', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    console.log('🗑️ DELETE /api/proveedores - Eliminando proveedor');
    
    const { id } = params;
    console.log('ID a eliminar:', id);
    
    const query = 'DELETE FROM proveedores WHERE id = ?';
    const [result] = await pool.execute(query, [id]);

    console.log('✅ Proveedor eliminado. Filas afectadas:', result.affectedRows);

    return NextResponse.json({ 
      mensaje: 'Proveedor eliminado exitosamente',
      affectedRows: result.affectedRows 
    });
  } catch (error) {
    console.error('❌ Error al eliminar proveedor:', error);
    console.error('Stack trace:', error.stack);
    return NextResponse.json(
      { error: 'Error al eliminar proveedor', details: error.message },
      { status: 500 }
    );
  }
}