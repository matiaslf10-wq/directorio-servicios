import { supabase } from '@/lib/supabase';
import { NextResponse, NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
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
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('usuario', usuario)
      .eq('password', password)
      .single();

    if (error || !data) {
      console.log('❌ Credenciales inválidas para:', usuario);
      return NextResponse.json(
        { error: 'Usuario o contraseña incorrectos' },
        { status: 401 }
      );
    }

    console.log('✅ Login exitoso para:', data.usuario);

    // Retornar datos del usuario (sin la contraseña)
    return NextResponse.json({
      success: true,
      usuario: {
        id: data.id,
        usuario: data.usuario,
        nombre_completo: data.nombre_completo,
        email: data.email
      }
    });
  } catch (error: any) {
    console.error('❌ Error en login:', error);
    return NextResponse.json(
      { error: 'Error al iniciar sesión', details: error.message },
      { status: 500 }
    );
  }
}