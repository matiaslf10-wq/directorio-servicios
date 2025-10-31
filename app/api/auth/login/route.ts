import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface ProveedorData {
  id: number;
  nombre: string;
  servicio: string;
  email: string;
  telefono: string;
  ubicacion: string;
  palabras_clave: string;
  foto_url?: string;
  fecha_registro?: string;
}

interface UsuarioData {
  id: number;
  usuario: string;
  password: string;
  nombre_completo: string;
  email: string;
  proveedor_id: number | null;
  fecha_creacion?: string;
  proveedores?: ProveedorData | ProveedorData[] | null;
}

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
      .select(`
        *,
        proveedores (*)
      `)
      .eq('usuario', usuario)
      .eq('password', password)
      .maybeSingle();

    if (error || !data) {
      console.log('❌ Credenciales inválidas para:', usuario);
      return NextResponse.json(
        { error: 'Usuario o contraseña incorrectos' },
        { status: 401 }
      );
    }

    const userData = data as UsuarioData;
    console.log('✅ Login exitoso para:', userData.usuario);
    console.log('🆔 Proveedor ID en BD:', userData.proveedor_id);
    console.log('📋 Datos completos:', JSON.stringify(userData, null, 2));

    // Verificar que el proveedor_id exista
    if (!userData.proveedor_id) {
      console.warn('⚠️ Usuario sin proveedor vinculado');
    }

    // Retornar datos del usuario y proveedor
    return NextResponse.json({
      success: true,
      usuario: {
        id: userData.id,
        usuario: userData.usuario,
        nombre_completo: userData.nombre_completo,
        email: userData.email,
        proveedor_id: userData.proveedor_id,
        proveedor: Array.isArray(userData.proveedores) ? userData.proveedores[0] : userData.proveedores
      }
    });
  } catch (error) {
    const err = error as Error;
    console.error('❌ Error en login:', err);
    return NextResponse.json(
      { error: 'Error al iniciar sesión', details: err.message },
      { status: 500 }
    );
  }
}