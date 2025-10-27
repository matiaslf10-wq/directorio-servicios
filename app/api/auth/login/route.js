import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    console.log('🔐 POST /api/auth/login - Intentando iniciar sesión');
    
    const body = await request.json();
    const { usuario, password } = body;

    if (!usuario || !password) {
      return NextResponse.json(
        { error: 'Usuario y contraseña son obligatorios' },
        { status: 400 }
      );
    }

    // Buscar usuario en la base de datos
    const query = 'SELECT * FROM usuarios WHERE usuario = ? AND password = ?';
    const [rows] = await pool.execute(query, [usuario, password]);

    if (rows.length === 0) {
      console.log('❌ Credenciales inválidas para:', usuario);
      return NextResponse.json(
        { error: 'Usuario o contraseña incorrectos' },
        { status: 401 }
      );
    }

    const user = rows[0];
    console.log('✅ Login exitoso para:', user.usuario);

    // Retornar datos del usuario (sin la contraseña)
    return NextResponse.json({
      success: true,
      usuario: {
        id: user.id,
        usuario: user.usuario,
        nombre_completo: user.nombre_completo,
        email: user.email
      }
    });
  } catch (error) {
    console.error('❌ Error en login:', error);
    return NextResponse.json(
      { error: 'Error al iniciar sesión', details: error.message },
      { status: 500 }
    );
  }
}
