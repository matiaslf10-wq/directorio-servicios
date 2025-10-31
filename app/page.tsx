'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, UserPlus, Briefcase, Mail, Phone, MapPin, Loader, LogOut, Edit, X, ChevronLeft, ChevronRight, Upload as UploadIcon, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { CldUploadWidget } from 'next-cloudinary';

// Tipos
interface Usuario {
  id: number;
  usuario: string;
  nombre_completo: string;
  email: string;
  proveedor_id: number | null;
  proveedor?: Proveedor | null;
}

interface Proveedor {
  id: number;
  nombre: string;
  servicio: string;
  email: string;
  telefono: string;
  ubicacion: string;
  palabras_clave: string;
  foto_url?: string;
  fecha_registro?: string;
  imagenes?: ProveedorImagen[];
}

interface ProveedorImagen {
  id: number;
  proveedor_id: number;
  imagen_url: string;
  public_id: string;
  orden: number;
}

// Componente de Galería de Imágenes
function ImageGallery({ 
  images, 
  proveedorId,
  isOwner,
  usuarioId,
  onImageAdded,
  onImageDeleted
}: { 
  images: ProveedorImagen[];
  proveedorId: number;
  isOwner: boolean;
  usuarioId?: number;
  onImageAdded: () => void;
  onImageDeleted: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [uploading, setUploading] = useState(false);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleUploadSuccess = async (result: unknown) => {
    const uploadResult = result as { info: { secure_url: string; public_id: string } };
    
    try {
      setUploading(true);
      const response = await fetch(`/api/proveedores/${proveedorId}/imagenes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imagen_url: uploadResult.info.secure_url,
          public_id: uploadResult.info.public_id,
          usuario_id: usuarioId
        })
      });

      if (response.ok) {
        onImageAdded();
      } else {
        alert('Error al guardar la imagen');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al subir imagen');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imagenId: number) => {
    if (!confirm('¿Eliminar esta imagen?')) return;

    try {
      const response = await fetch(
        `/api/proveedores/${proveedorId}/imagenes?imagen_id=${imagenId}&usuario_id=${usuarioId}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        onImageDeleted();
        if (currentIndex >= images.length - 1) {
          setCurrentIndex(Math.max(0, images.length - 2));
        }
      } else {
        alert('Error al eliminar imagen');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar imagen');
    }
  };

  if (images.length === 0 && !isOwner) {
    return (
      <div className="w-full h-48 bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center">
        <Briefcase size={64} className="text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-48 bg-gray-900">
      {images.length > 0 ? (
        <>
          <div className="relative w-full h-full">
            <Image
              src={images[currentIndex].imagen_url}
              alt={`Imagen ${currentIndex + 1}`}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>

          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>

          {isOwner && (
            <button
              onClick={() => handleDelete(images[currentIndex].id)}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
            >
              <Trash2 size={16} />
            </button>
          )}
        </>
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center">
          <Briefcase size={64} className="text-indigo-400" />
        </div>
      )}

      {isOwner && (
        <div className="absolute bottom-2 right-2">
          <CldUploadWidget
            uploadPreset="directorio_proveedores"
            onSuccess={handleUploadSuccess}
          >
            {({ open }) => (
              <button
                onClick={() => open && open()}
                disabled={uploading}
                className="bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700 transition flex items-center gap-1 text-sm disabled:opacity-50"
              >
                <UploadIcon size={14} />
                {uploading ? 'Subiendo...' : 'Agregar foto'}
              </button>
            )}
          </CldUploadWidget>
        </div>
      )}
    </div>
  );
}

// Componente de Login
function LoginPage({ onLogin }: { onLogin: (user: Usuario) => void }) {
  const [formData, setFormData] = useState({
    usuario: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!formData.usuario || !formData.password) {
      setError('Por favor completa todos los campos');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        onLogin(data.usuario);
      } else {
        setError(data.error || 'Error al iniciar sesión');
      }
    } catch {
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
          <p className="text-gray-600 mt-2">Inicia sesión para editar tu perfil</p>
        </div>

        <form onSubmit={handleSubmit}>
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
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Usuarios de prueba: <span className="font-mono">juan/juan123</span> o <span className="font-mono">maria/maria123</span>
          </p>
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
  const [showLogin, setShowLogin] = useState<boolean>(false);
  const [editingProvider, setEditingProvider] = useState<Proveedor | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    nombre: '',
    servicio: '',
    email: '',
    telefono: '',
    ubicacion: '',
    palabras_clave: '',
    usuario: '',
    password: ''
  });

  const fetchProviders = useCallback(async () => {
    try {
      setLoading(true);
      const url = searchTerm 
        ? `/api/proveedores?search=${encodeURIComponent(searchTerm)}`
        : '/api/proveedores';
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Cargar imágenes para cada proveedor
      const providersWithImages = await Promise.all(
        data.map(async (provider: Proveedor) => {
          try {
            const imgResponse = await fetch(`/api/proveedores/${provider.id}/imagenes`);
            const imagenes = imgResponse.ok ? await imgResponse.json() : [];
            return { ...provider, imagenes };
          } catch {
            return { ...provider, imagenes: [] };
          }
        })
      );
      
      setProviders(providersWithImages);
    } catch (error) {
      console.error('❌ Error al cargar proveedores:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  // Verificar sesión al cargar
  useEffect(() => {
    const savedUser = localStorage.getItem('usuario');
    if (savedUser) {
      const user = JSON.parse(savedUser) as Usuario;
      setCurrentUser(user);
      setIsAuthenticated(true);
    }
  }, []);

  // Cargar proveedores
  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const handleLogin = (user: Usuario) => {
    console.log('👤 Usuario logueado:', user);
    console.log('🆔 Proveedor ID:', user.proveedor_id);
    setCurrentUser(user);
    setIsAuthenticated(true);
    setShowLogin(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

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
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    if (!editingProvider && (!formData.usuario || !formData.password)) {
      alert('Por favor ingresa usuario y contraseña para crear tu cuenta');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Por favor ingresa un email válido');
      return;
    }

    try {
      setLoading(true);

      if (editingProvider) {
        // Actualizar proveedor existente
        const response = await fetch('/api/proveedores', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: editingProvider.id,
            usuario_id: currentUser?.id,
            ...formData
          }),
        });

        const data = await response.json();

        if (response.ok) {
          alert('¡Perfil actualizado exitosamente!');
          setEditingProvider(null);
          setShowForm(false);
          setFormData({
            nombre: '',
            servicio: '',
            email: '',
            telefono: '',
            ubicacion: '',
            palabras_clave: '',
            usuario: '',
            password: ''
          });
          setTimeout(() => fetchProviders(), 500);
        } else if (response.status === 403) {
          alert('No tienes permiso para editar este proveedor');
        } else {
          alert(`Error: ${data.error}`);
        }
      } else {
        // Crear nuevo proveedor con usuario
        const response = await fetch('/api/proveedores', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (response.ok) {
          alert('¡Proveedor y usuario registrados exitosamente! Ahora puedes iniciar sesión.');
          setShowForm(false);
          setFormData({
            nombre: '',
            servicio: '',
            email: '',
            telefono: '',
            ubicacion: '',
            palabras_clave: '',
            usuario: '',
            password: ''
          });
          setTimeout(() => fetchProviders(), 500);
        } else if (response.status === 409) {
          alert(`⚠️ ${data.error}`);
        } else {
          alert(`Error: ${data.error || 'Error desconocido'}`);
        }
      }
    } catch (error) {
      console.error('❌ Error:', error);
      alert('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (provider: Proveedor) => {
    console.log('✏️ Intentando editar proveedor:', provider.id);
    console.log('👤 Usuario actual:', currentUser);
    console.log('🆔 Proveedor ID del usuario:', currentUser?.proveedor_id);
    
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para editar tu perfil');
      setShowLogin(true);
      return;
    }

    if (currentUser?.proveedor_id !== provider.id) {
      alert(`Solo puedes editar tu propio perfil. Tu proveedor_id: ${currentUser?.proveedor_id}, Proveedor seleccionado: ${provider.id}`);
      return;
    }

    setEditingProvider(provider);
    setFormData({
      nombre: provider.nombre,
      servicio: provider.servicio,
      email: provider.email,
      telefono: provider.telefono,
      ubicacion: provider.ubicacion,
      palabras_clave: provider.palabras_clave,
      usuario: '',
      password: ''
    });
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditingProvider(null);
    setShowForm(false);
    setFormData({
      nombre: '',
      servicio: '',
      email: '',
      telefono: '',
      ubicacion: '',
      palabras_clave: '',
      usuario: '',
      password: ''
    });
  };

  if (showLogin) {
    return <LoginPage onLogin={handleLogin} />;
  }

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
            {isAuthenticated && currentUser && (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Bienvenido,</p>
                  <p className="font-semibold text-gray-800">{currentUser.nombre_completo}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition flex items-center gap-2 font-semibold"
                >
                  <LogOut size={18} />
                  Salir
                </button>
              </div>
            )}
            {!isAuthenticated && (
              <button
                onClick={() => setShowLogin(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-semibold"
                suppressHydrationWarning
              >
                Iniciar Sesión
              </button>
            )}
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
            {!showForm && (
              <button
                onClick={() => {
                  setEditingProvider(null);
                  setShowForm(true);
                }}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 font-semibold"
                suppressHydrationWarning
              >
                <UserPlus size={20} />
                Registrarme
              </button>
            )}
          </div>
        </div>

        {/* Formulario de Registro/Edición */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingProvider ? 'Editar Mi Perfil' : 'Registrar Nuevo Proveedor'}
              </h2>
              <button
                onClick={handleCancelEdit}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            
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

              {/* Campos de usuario solo para registro nuevo */}
              {!editingProvider && (
                <>
                  <div className="md:col-span-2 border-t pt-6 mt-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Crear tu cuenta</h3>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Usuario *</label>
                    <input
                      type="text"
                      name="usuario"
                      value={formData.usuario}
                      onChange={handleInputChange}
                      placeholder="Elige un nombre de usuario"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                      suppressHydrationWarning
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Contraseña *</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Crea una contraseña"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                      suppressHydrationWarning
                    />
                  </div>
                </>
              )}

              <div className="md:col-span-2 flex gap-4">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  suppressHydrationWarning
                >
                  {loading ? <Loader className="animate-spin" size={20} /> : null}
                  {loading ? 'Guardando...' : editingProvider ? 'Actualizar' : 'Registrar'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={loading}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition font-semibold disabled:opacity-50"
                  suppressHydrationWarning
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
                <div key={provider.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
                  <ImageGallery
                    images={provider.imagenes || []}
                    proveedorId={provider.id}
                    isOwner={isAuthenticated && currentUser?.proveedor_id === provider.id}
                    usuarioId={currentUser?.id}
                    onImageAdded={fetchProviders}
                    onImageDeleted={fetchProviders}
                  />
                  
                  <div className="p-6">
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

                    {/* Botón de editar solo para el dueño */}
                    {isAuthenticated && currentUser?.proveedor_id === provider.id && (
                      <button
                        onClick={() => handleEdit(provider)}
                        className="mt-4 w-full bg-indigo-100 text-indigo-600 py-2 rounded-lg hover:bg-indigo-200 transition flex items-center justify-center gap-2 font-semibold"
                      >
                        <Edit size={18} />
                        Editar mi perfil
                      </button>
                    )}
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