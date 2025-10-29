'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, UserPlus, Briefcase, Mail, Phone, MapPin, Loader } from 'lucide-react';

// Tipos
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
}

export default function ServiceDirectory() {
  const [providers, setProviders] = useState<Proveedor[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showForm, setShowForm] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    nombre: '',
    servicio: '',
    email: '',
    telefono: '',
    ubicacion: '',
    palabras_clave: ''
  });

  const fetchProviders = useCallback(async () => {
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
      console.log('✅ Proveedores cargados:', data.length);
      setProviders(data);
    } catch (error) {
      console.error('❌ Error al cargar proveedores:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  // Cargar proveedores al montar el componente
  useEffect(() => {
    console.log('🚀 Componente montado - Cargando proveedores');
    fetchProviders();
  }, [fetchProviders]);

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

    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Por favor ingresa un email válido');
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
      console.log('📥 Respuesta:', data);

      if (response.ok) {
        alert('¡Proveedor registrado exitosamente!');
        setFormData({
          nombre: '',
          servicio: '',
          email: '',
          telefono: '',
          ubicacion: '',
          palabras_clave: ''
        });
        setShowForm(false);
        
        // Recargar proveedores
        setTimeout(() => {
          fetchProviders();
        }, 500);
      } else if (response.status === 409) {
        // Error de duplicado
        alert(`⚠️ ${data.error}`);
      } else {
        alert(`Error al registrar: ${data.error || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('❌ Error al enviar formulario:', error);
      alert('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold text-indigo-600 flex items-center gap-3">
            <Briefcase size={40} />
            Directorio de Servicios
          </h1>
          <p className="text-gray-600 mt-2">Encuentra profesionales o registra tus servicios</p>
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
                  suppressHydrationWarning
                >
                  {loading ? <Loader className="animate-spin" size={20} /> : null}
                  {loading ? 'Registrando...' : 'Registrar'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
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
                  {/* Imagen del proveedor */}
                  {provider.foto_url ? (
                    <img 
                      src={provider.foto_url} 
                      alt={provider.nombre}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center">
                      <Briefcase size={64} className="text-indigo-400" />
                    </div>
                  )}
                  
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