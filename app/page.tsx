'use client';

import { useState, useEffect } from 'react';
import { Search, UserPlus, Briefcase, Mail, Phone, MapPin, Loader, LogOut, Upload, X } from 'lucide-react';
import { CldUploadWidget } from 'next-cloudinary';

// Tipos
interface Usuario {
  id: number;
  usuario: string;
  nombre_completo: string;
  email: string;
}

interface Proveedor {
  id: number;
  nombre: string;
  servicio: string;
  email: string;
  telefono: string;
  ubicacion: string;
  palabras_clave: string;
  fecha_registro?: string;
}

// Importar el componente de Login
function LoginPage({ onLogin }: { onLogin: (user: Usuario) => void }) {
  const [formData, setFormData] = useState({
    usuario: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.usuario || !formData.password) {
      setError('Por favor completa todos los campos');
      return;
    }

    try {
      setLoading(true);
      console.log('🔐 Intentando login...');

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Login exitoso');
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        onLogin(data.usuario);
      } else {
        setError(data.error || 'Error al iniciar sesión');
      }
    } catch (error) {
      console.error('❌ Error:', error);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
            <Briefcase size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Directorio de Servicios</h1>
          <p className="text-gray-600 mt-2">Inicia sesión para continuar</p>
        </div>

        <div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Usuario</label>
              <input
                type="text"
                name="usuario"
                value={formData.usuario}
                onChange={handleInputChange}
                placeholder="Ingresa tu usuario"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                disabled={loading}
                suppressHydrationWarning
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Contraseña</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Ingresa tu contraseña"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                disabled={loading}
                suppressHydrationWarning
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </div>
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 font-semibold mb-2">Usuarios de prueba:</p>
          <div className="text-xs text-gray-500 space-y-1">
            <p>👤 Usuario: <span className="font-mono bg-white px-2 py-1 rounded">admin</span> / Contraseña: <span className="font-mono bg-white px-2 py-1 rounded">admin123</span></p>
            <p>👤 Usuario: <span className="font-mono bg-white px-2 py-1 rounded">usuario1</span> / Contraseña: <span className="font-mono bg-white px-2 py-1 rounded">pass123</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ServiceDirectory() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [providers, setProviders] = useState<Proveedor[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showForm, setShowForm] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [formData, setFormData] = useState({
    nombre: '',
    servicio: '',
    email: '',
    telefono: '',
    ubicacion: '',
    palabras_clave: ''
  });

  // Verificar si hay sesión activa al cargar
  useEffect(() => {
    const savedUser = localStorage.getItem('usuario');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setIsAuthenticated(true);
      console.log('✅ Sesión restaurada:', user.usuario);
    }
    setLoading(false);
  }, []);

  // Cargar proveedores cuando esté autenticado
  useEffect(() => {
    if (isAuthenticated) {
      console.log('🚀 Usuario autenticado - Cargando proveedores');
      fetchProviders();
    }
  }, [isAuthenticated]);

  // Efecto para búsqueda
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const timeoutId = setTimeout(() => {
      if (searchTerm) {
        console.log('🔍 Buscando:', searchTerm);
        fetchProviders();
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleLogin = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    setCurrentUser(null);
    setIsAuthenticated(false);
    setProviders([]);
    console.log('👋 Sesión cerrada');
  };

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const url = searchTerm 
        ? `/api/proveedores?search=${encodeURIComponent(searchTerm)}`
        : '/api/proveedores';
      
      console.log('🔄 Cargando proveedores desde:', url);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Proveedores cargados:', data.length, 'registros');
      setProviders(data);
    } catch (error) {
      console.error('❌ Error al cargar proveedores:', error);
      alert('Error al cargar los proveedores: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Si está cargando la verificación de sesión
  if (loading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Loader className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  // Si no está autenticado, mostrar login
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Usuario autenticado - mostrar directorio

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.servicio || !formData.email || 
        !formData.telefono || !formData.ubicacion || !formData.palabras_clave) {
      alert('Por favor completa todos los campos');
      return;
    }

    try {
      setLoading(true);
      console.log('📤 Enviando datos:', formData);
      
      const response = await fetch('/api/proveedores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log('📥 Respuesta del servidor:', data);

      if (response.ok) {
        alert('¡Proveedor registrado exitosamente! ID: ' + data.id);
        setFormData({
          nombre: '',
          servicio: '',
          email: '',
          telefono: '',
          ubicacion: '',
          palabras_clave: ''
        });
        setShowForm(false);
        
        // Esperar un momento y recargar
        console.log('🔄 Recargando lista de proveedores...');
        setTimeout(() => {
          fetchProviders();
        }, 500);
      } else {
        console.error('❌ Error del servidor:', data);
        alert(`Error al registrar: ${data.error || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('❌ Error al enviar formulario:', error);
      alert(`Error de conexión: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-indigo-600 flex items-center gap-3">
                <Briefcase size={40} />
                Directorio de Servicios
              </h1>
              <p className="text-gray-600 mt-2">Encuentra profesionales o registra tus servicios</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Bienvenido,</p>
                <p className="font-semibold text-gray-800">{currentUser?.nombre_completo}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition flex items-center gap-2 font-semibold"
              >
                <LogOut size={18} />
                Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Buscador */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por servicio, nombre, ubicación o palabras clave..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none text-lg"
                suppressHydrationWarning
              />
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 font-semibold"
              suppressHydrationWarning
            >
              <UserPlus size={20} />
              Registrarme
            </button>
          </div>
        </div>

        {/* Formulario de Registro */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Registrar Nuevo Proveedor</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Nombre Completo *</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                  suppressHydrationWarning
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Servicio *</label>
                <input
                  type="text"
                  name="servicio"
                  value={formData.servicio}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                  suppressHydrationWarning
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                  suppressHydrationWarning
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Teléfono *</label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                  suppressHydrationWarning
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Ubicación *</label>
                <input
                  type="text"
                  name="ubicacion"
                  value={formData.ubicacion}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                  suppressHydrationWarning
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Palabras Clave *</label>
                <input
                  type="text"
                  name="palabras_clave"
                  value={formData.palabras_clave}
                  onChange={handleInputChange}
                  placeholder="ej: plomero reparaciones urgencias"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                  suppressHydrationWarning
                />
              </div>
              <div className="md:col-span-2 flex gap-4">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? <Loader className="animate-spin" size={20} /> : null}
                  {loading ? 'Registrando...' : 'Registrar'}
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  disabled={loading}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition font-semibold disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Resultados */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            {searchTerm ? `Resultados para "${searchTerm}"` : 'Todos los Proveedores'}
            <span className="text-indigo-600 ml-2">({providers.length})</span>
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader className="animate-spin text-indigo-600" size={48} />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.map((provider: Proveedor) => (
                <div key={provider.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800">{provider.nombre}</h3>
                    <div className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-sm font-semibold">
                      {provider.servicio}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail size={18} className="text-indigo-500" />
                      <span className="text-sm">{provider.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone size={18} className="text-indigo-500" />
                      <span className="text-sm">{provider.telefono}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin size={18} className="text-indigo-500" />
                      <span className="text-sm">{provider.ubicacion}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      <span className="font-semibold">Keywords:</span> {provider.palabras_clave}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {providers.length === 0 && !loading && (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <Search size={64} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-2">No se encontraron resultados</h3>
                <p className="text-gray-600">Intenta con otras palabras clave o registra un nuevo proveedor</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}