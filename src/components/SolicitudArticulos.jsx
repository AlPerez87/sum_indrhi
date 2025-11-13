import { useState, useEffect } from 'react'
import { Search, Plus, Eye, X, Trash2, AlertCircle, Package, FileText, Edit, Send, Check } from 'lucide-react'
import { crmService } from '../services/crmService'
import Pagination from './Pagination'
import { usePagination } from '../hooks/usePagination'
import SearchableSelect from './SearchableSelect'

const SolicitudArticulos = () => {
  const [solicitudes, setSolicitudes] = useState([])
  const [articulos, setArticulos] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedSolicitud, setSelectedSolicitud] = useState(null)
  const [formData, setFormData] = useState({
    numero_solicitud: '',
    fecha: '',
    departamento: '',
    departamento_id: null
  })
  const [articulosSeleccionados, setArticulosSeleccionados] = useState([])
  const [articuloActual, setArticuloActual] = useState({
    articulo: '',
    cantidad: ''
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Obtener datos del usuario logueado
  const [currentUser, setCurrentUser] = useState(null)

  // Cargar solicitudes y artículos
  useEffect(() => {
    loadData()
    loadUserData()
  }, [])

  const loadUserData = () => {
    const token = localStorage.getItem('indrhi_token')
    if (token) {
      try {
        const decoded = JSON.parse(atob(token))
        setCurrentUser(decoded)
      } catch (error) {
        console.error('Error al decodificar token:', error)
      }
    }
  }

  const loadData = async () => {
    setLoading(true)
    try {
      const [solicitudesResult, articulosResult] = await Promise.all([
        crmService.getSolicitudes(),
        crmService.getArticulos()
      ])

      if (solicitudesResult.success) {
        setSolicitudes(solicitudesResult.data.filter(s => s.id && s.id > 0))
      }

      if (articulosResult.success) {
        const articulosConCodigo = articulosResult.data.filter(art => art.articulo)
        setArticulos(articulosConCodigo)
      }
    } catch (error) {
      console.error('Error al cargar datos:', error)
      setError('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  // Obtener información del departamento del usuario
  const getUserDepartamento = async () => {
    if (!currentUser) return null

    try {
      const result = await crmService.getUsuariosDepartamentos()
      
      if (result.success) {
        // Buscar usuario por user_id (comparación flexible)
        const usuario = result.data.find(u => 
          u.user_id === currentUser.user_id || 
          u.user_id === currentUser.id ||
          String(u.user_id) === String(currentUser.user_id) ||
          String(u.user_id) === String(currentUser.id)
        )
        
        return usuario
      }
    } catch (error) {
      console.error('Error al obtener departamento del usuario:', error)
    }
    return null
  }

  // Abrir modal para nueva solicitud
  const handleNuevaSolicitud = async () => {
    const userDepto = await getUserDepartamento()
    
    if (!userDepto || !userDepto.departamento_id) {
      setError('Debe tener un departamento asignado para crear solicitudes')
      setTimeout(() => setError(''), 5000)
      return
    }

    const siguienteNumero = await crmService.getSiguienteNumeroSolicitud()
    
    if (siguienteNumero.success) {
      setFormData({
        numero_solicitud: siguienteNumero.data.numero_solicitud,
        fecha: siguienteNumero.data.fecha,
        departamento: userDepto.departamento_nombre,
        departamento_id: userDepto.departamento_id
      })
      setArticulosSeleccionados([])
      setShowModal(true)
    }
  }

  // Agregar artículo a la lista
  const handleAgregarArticulo = () => {
    if (!articuloActual.articulo) {
      setError('Debe seleccionar un artículo')
      return
    }

    if (!articuloActual.cantidad || parseFloat(articuloActual.cantidad) <= 0) {
      setError('Debe ingresar una cantidad válida')
      return
    }

    const articuloInfo = articulos.find(a => a.articulo === articuloActual.articulo)
    
    setArticulosSeleccionados([
      ...articulosSeleccionados,
      {
        codigo: articuloActual.articulo,
        nombre: articuloInfo?.descripcion || articuloInfo?.articulo || articuloActual.articulo,
        cantidad: parseFloat(articuloActual.cantidad)
      }
    ])

    setArticuloActual({
      articulo: '',
      cantidad: ''
    })
    setError('')
  }

  // Eliminar artículo de la lista
  const handleEliminarArticulo = (index) => {
    setArticulosSeleccionados(articulosSeleccionados.filter((_, i) => i !== index))
  }

  // Guardar solicitud
  const handleGuardar = async () => {
    if (articulosSeleccionados.length === 0) {
      setError('Debe agregar al menos un artículo')
      return
    }

    setSaving(true)
    setError('')

    try {
      const solicitud = {
        usuario_id: currentUser.user_id || currentUser.id,
        articulos: articulosSeleccionados.map(art => ({
          articulo: art.nombre,
          codigo: art.codigo,
          cantidad: art.cantidad
        }))
      }

      console.log('📤 Enviando solicitud:', solicitud)

      const result = await crmService.createSolicitud(solicitud)

      console.log('📥 Respuesta del servidor:', result)

      if (result.success) {
        setShowModal(false)
        setSuccessMessage('Solicitud creada correctamente')
        setTimeout(() => setSuccessMessage(''), 3000)
        loadData()
        resetForm()
      } else {
        setError(result.message || 'Error al crear la solicitud')
      }
    } catch (error) {
      console.error('❌ Error completo:', error)
      console.error('❌ Respuesta del error:', error.response)
      setError(error.response?.data?.message || 'Error al guardar la solicitud')
    } finally {
      setSaving(false)
    }
  }

  // Ver detalles
  const handleVerDetalles = async (solicitud) => {
    const result = await crmService.getSolicitudDetalle(solicitud.id)
    if (result.success) {
      setSelectedSolicitud(result.data)
      setShowDetailModal(true)
    }
  }

  // Editar solicitud
  const handleEditarSolicitud = async (solicitud) => {
    const result = await crmService.getSolicitudDetalle(solicitud.id)
    if (result.success) {
      setSelectedSolicitud(result.data)
      setFormData({
        numero_solicitud: result.data.numero_solicitud,
        fecha: result.data.fecha,
        departamento: result.data.departamento,
        departamento_id: result.data.departamento_id
      })
      
      // Mapear artículos del backend al formato del frontend
      const articulosMapeados = (result.data.articulos || []).map(art => ({
        codigo: art.codigo,
        nombre: art.articulo || art.nombre, // Usar 'articulo' del backend o 'nombre' si existe
        cantidad: art.cantidad
      }))
      
      console.log('📝 Artículos cargados para edición:', articulosMapeados)
      setArticulosSeleccionados(articulosMapeados)
      setShowEditModal(true)
    }
  }

  // Actualizar solicitud
  const handleActualizarSolicitud = async () => {
    if (articulosSeleccionados.length === 0) {
      setError('Debe agregar al menos un artículo')
      return
    }

    setSaving(true)
    setError('')

    try {
      const result = await crmService.updateSolicitud(selectedSolicitud.id, {
        articulos: articulosSeleccionados.map(art => ({
          articulo: art.nombre,
          codigo: art.codigo,
          cantidad: art.cantidad
        }))
      })

      if (result.success) {
        setShowEditModal(false)
        setSuccessMessage('Solicitud actualizada correctamente')
        setTimeout(() => setSuccessMessage(''), 3000)
        loadData()
        resetForm()
      } else {
        setError(result.message || 'Error al actualizar la solicitud')
      }
    } catch (error) {
      console.error('Error:', error)
      setError('Error al actualizar la solicitud')
    } finally {
      setSaving(false)
    }
  }

  // Eliminar solicitud
  const handleEliminarSolicitud = async (solicitud) => {
    if (!confirm('¿Está seguro de eliminar esta solicitud?')) {
      return
    }

    const result = await crmService.deleteSolicitud(solicitud.id)
    if (result.success) {
      setSuccessMessage('Solicitud eliminada correctamente')
      setTimeout(() => setSuccessMessage(''), 3000)
      loadData()
    } else {
      setError(result.message || 'Error al eliminar la solicitud')
      setTimeout(() => setError(''), 3000)
    }
  }

  // Enviar solicitud a autorización
  const handleEnviarSolicitud = async (solicitud) => {
    if (!confirm(`¿Está seguro de enviar la solicitud ${solicitud.numero_solicitud} a autorización?`)) {
      return
    }

    const result = await crmService.enviarSolicitud(solicitud.id)
    if (result.success) {
      setSuccessMessage('Solicitud enviada a autorización correctamente')
      setTimeout(() => setSuccessMessage(''), 3000)
      loadData()
    } else {
      setError(result.message || 'Error al enviar la solicitud')
      setTimeout(() => setError(''), 3000)
    }
  }

  const resetForm = () => {
    setFormData({
      numero_solicitud: '',
      fecha: '',
      departamento: '',
      departamento_id: null
    })
    setArticulosSeleccionados([])
    setArticuloActual({
      articulo: '',
      cantidad: ''
    })
    setSelectedSolicitud(null)
  }

  // Filtrar solicitudes
  const filteredSolicitudes = solicitudes.filter(solicitud =>
    Object.values(solicitud).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  // Paginación
  const {
    currentPage,
    itemsPerPage,
    totalPages,
    paginatedData,
    handlePageChange,
    handleItemsPerPageChange
  } = usePagination(filteredSolicitudes)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="spinner mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando solicitudes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
            <FileText className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Solicitud de Artículos</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total: {filteredSolicitudes.length} {filteredSolicitudes.length === 1 ? 'solicitud' : 'solicitudes'}
            </p>
          </div>
        </div>

        <button
          onClick={handleNuevaSolicitud}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nueva Solicitud
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg animate-shake">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <p className="text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg animate-fade-in">
          <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
          <p className="text-green-800 dark:text-green-300">{successMessage}</p>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar solicitudes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {filteredSolicitudes.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={filteredSolicitudes.length}
            onItemsPerPageChange={handleItemsPerPageChange}
            position="top"
          />
        )}

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Nº Solicitud
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Departamento
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Total Artículos
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredSolicitudes.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    {searchTerm ? 'No se encontraron solicitudes' : 'No hay solicitudes registradas'}
                  </td>
                </tr>
              ) : (
                paginatedData.map((solicitud) => (
                  <tr
                    key={solicitud.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {solicitud.numero_solicitud}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {new Date(solicitud.fecha).toLocaleDateString('es-DO')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {solicitud.departamento}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700 dark:text-gray-300">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {solicitud.total_articulos}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleVerDetalles(solicitud)}
                          className="p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditarSolicitud(solicitud)}
                          disabled={solicitud.enviada === 1}
                          className={`p-2 rounded-lg transition-colors ${
                            solicitud.enviada === 1
                              ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50'
                              : 'text-amber-600 hover:text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                          }`}
                          title={solicitud.enviada === 1 ? 'No se puede editar una solicitud enviada' : 'Editar solicitud'}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEnviarSolicitud(solicitud)}
                          disabled={solicitud.enviada === 1}
                          className={`p-2 rounded-lg transition-colors ${
                            solicitud.enviada === 1
                              ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50'
                              : 'text-green-600 hover:text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                          }`}
                          title={solicitud.enviada === 1 ? 'Solicitud ya enviada' : 'Enviar solicitud'}
                        >
                          <Send className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEliminarSolicitud(solicitud)}
                          disabled={solicitud.enviada === 1}
                          className={`p-2 rounded-lg transition-colors ${
                            solicitud.enviada === 1
                              ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50'
                              : 'text-red-600 hover:text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                          }`}
                          title={solicitud.enviada === 1 ? 'No se puede eliminar una solicitud enviada' : 'Eliminar solicitud'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredSolicitudes.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={filteredSolicitudes.length}
            onItemsPerPageChange={handleItemsPerPageChange}
            position="bottom"
          />
        )}
      </div>

      {/* Modal Nueva Solicitud */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-container max-w-6xl">
            <div className="modal-header">
              <h3 className="modal-title">Nueva Solicitud de Artículos</h3>
              <button onClick={() => setShowModal(false)} className="modal-close">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="modal-body">
              {error && (
                <div className="mb-4 flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <p className="text-red-800 dark:text-red-300">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* COLUMNA IZQUIERDA: Información básica (30%) */}
                <div className="lg:col-span-5 space-y-4">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white pb-2 border-b border-gray-200 dark:border-gray-700">
                    Información de la Solicitud
                  </h3>

                  {/* Número de Solicitud */}
                  <div>
                    <label className="label-field">Nº Solicitud</label>
                    <input
                      type="text"
                      value={formData.numero_solicitud}
                      disabled
                      className="input-field bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                    />
                  </div>

                  {/* Fecha */}
                  <div>
                    <label className="label-field">Fecha</label>
                    <input
                      type="date"
                      value={formData.fecha}
                      disabled
                      className="input-field bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                    />
                  </div>

                  {/* Departamento */}
                  <div>
                    <label className="label-field">Departamento</label>
                    <input
                      type="text"
                      value={formData.departamento}
                      disabled
                      className="input-field bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* COLUMNA DERECHA: Agregar Artículos (70%) */}
                <div className="lg:col-span-7 space-y-4">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white pb-2 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Artículos Solicitados
                  </h3>

                  {/* Formulario de artículo */}
                  <div className="grid grid-cols-12 gap-3">
                    {/* Selector de artículo */}
                    <div className="col-span-12 md:col-span-8">
                      <SearchableSelect
                        options={articulos.map(art => ({
                          value: art.articulo,
                          label: art.descripcion || art.articulo
                        }))}
                        value={articuloActual.articulo}
                        onChange={(value) => {
                          setArticuloActual({ ...articuloActual, articulo: value })
                        }}
                        placeholder="Seleccionar artículo..."
                        searchPlaceholder="Buscar artículo..."
                        emptyMessage="No hay artículos disponibles"
                        className="text-sm"
                      />
                    </div>

                    {/* Cantidad */}
                    <div className="col-span-8 md:col-span-3">
                      <input
                        type="number"
                        value={articuloActual.cantidad}
                        onChange={(e) => setArticuloActual({ ...articuloActual, cantidad: e.target.value })}
                        placeholder="Cantidad"
                        min="1"
                        step="any"
                        className="input-field text-sm"
                      />
                    </div>

                    {/* Botón Agregar */}
                    <div className="col-span-4 md:col-span-1">
                      <button
                        onClick={handleAgregarArticulo}
                        className="btn-success w-full h-full flex items-center justify-center"
                        title="Agregar artículo"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Lista de artículos agregados */}
                  {articulosSeleccionados.length > 0 && (
                    <div className="mt-4 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <div className="max-h-64 overflow-y-auto custom-scrollbar">
                        <table className="w-full">
                          <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">
                                Artículo
                              </th>
                              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300">
                                Cantidad
                              </th>
                              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300">
                                Acciones
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {articulosSeleccionados.map((art, index) => (
                              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                                  {art.nombre}
                                </td>
                                <td className="px-4 py-2 text-sm text-center text-gray-700 dark:text-gray-300">
                                  {art.cantidad}
                                </td>
                                <td className="px-4 py-2 text-center">
                                  <button
                                    onClick={() => handleEliminarArticulo(index)}
                                    className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                    title="Eliminar"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setShowModal(false)}
                className="btn-secondary"
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardar}
                className="btn-primary"
                disabled={saving || articulosSeleccionados.length === 0}
              >
                {saving ? 'Guardando...' : 'Guardar Solicitud'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ver Detalles */}
      {showDetailModal && selectedSolicitud && (
        <div className="modal-overlay">
          <div className="modal-container max-w-5xl">
            <div className="modal-header">
              <h3 className="modal-title">Detalles de la Solicitud</h3>
              <button onClick={() => setShowDetailModal(false)} className="modal-close">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="modal-body">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* COLUMNA IZQUIERDA: Información básica */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Nº Solicitud</label>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                        {selectedSolicitud.numero_solicitud}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Fecha</label>
                      <p className="text-sm text-gray-900 dark:text-white mt-1">
                        {new Date(selectedSolicitud.fecha).toLocaleDateString('es-DO')}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Departamento</label>
                      <p className="text-sm text-gray-900 dark:text-white mt-1">
                        {selectedSolicitud.departamento}
                      </p>
                    </div>
                  </div>
                </div>

                {/* COLUMNA DERECHA: Artículos */}
                <div className="lg:col-span-8">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Artículos Solicitados ({selectedSolicitud.articulos?.length || 0})
                  </h4>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <div className="max-h-96 overflow-y-auto custom-scrollbar">
                      <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300">
                              Artículo
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300">
                              Cantidad
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {selectedSolicitud.articulos?.map((art, index) => (
                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                {art.articulo || art.nombre}
                              </td>
                              <td className="px-4 py-3 text-sm text-center text-gray-700 dark:text-gray-300">
                                {art.cantidad}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setShowDetailModal(false)}
                className="btn-secondary"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Solicitud */}
      {showEditModal && selectedSolicitud && (
        <div className="modal-overlay">
          <div className="modal-container max-w-6xl">
            <div className="modal-header">
              <h3 className="modal-title">Editar Solicitud</h3>
              <button onClick={() => setShowEditModal(false)} className="modal-close">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="modal-body">
              {error && (
                <div className="mb-4 flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <p className="text-red-800 dark:text-red-300">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* COLUMNA IZQUIERDA: Información básica (30%) */}
                <div className="lg:col-span-5 space-y-4">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white pb-2 border-b border-gray-200 dark:border-gray-700">
                    Información de la Solicitud
                  </h3>

                  {/* Número de Solicitud */}
                  <div>
                    <label className="label-field">Nº Solicitud</label>
                    <input
                      type="text"
                      value={formData.numero_solicitud}
                      disabled
                      className="input-field bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                    />
                  </div>

                  {/* Fecha */}
                  <div>
                    <label className="label-field">Fecha</label>
                    <input
                      type="date"
                      value={formData.fecha}
                      disabled
                      className="input-field bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                    />
                  </div>

                  {/* Departamento */}
                  <div>
                    <label className="label-field">Departamento</label>
                    <input
                      type="text"
                      value={formData.departamento}
                      disabled
                      className="input-field bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* COLUMNA DERECHA: Agregar Artículos (70%) */}
                <div className="lg:col-span-7 space-y-4">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white pb-2 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Artículos Solicitados
                  </h3>

                  {/* Formulario de artículo */}
                  <div className="grid grid-cols-12 gap-3">
                    {/* Selector de artículo */}
                    <div className="col-span-12 md:col-span-8">
                      <SearchableSelect
                        options={articulos.map(art => ({
                          value: art.articulo,
                          label: art.descripcion || art.articulo
                        }))}
                        value={articuloActual.articulo}
                        onChange={(value) => {
                          setArticuloActual({ ...articuloActual, articulo: value })
                        }}
                        placeholder="Seleccionar artículo..."
                        searchPlaceholder="Buscar artículo..."
                        emptyMessage="No hay artículos disponibles"
                        className="text-sm"
                      />
                    </div>

                    {/* Cantidad */}
                    <div className="col-span-8 md:col-span-3">
                      <input
                        type="number"
                        value={articuloActual.cantidad}
                        onChange={(e) => setArticuloActual({ ...articuloActual, cantidad: e.target.value })}
                        placeholder="Cantidad"
                        min="1"
                        step="any"
                        className="input-field text-sm"
                      />
                    </div>

                    {/* Botón Agregar */}
                    <div className="col-span-4 md:col-span-1">
                      <button
                        onClick={handleAgregarArticulo}
                        className="btn-success w-full h-full flex items-center justify-center"
                        title="Agregar artículo"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Lista de artículos agregados */}
                  {articulosSeleccionados.length > 0 && (
                    <div className="mt-4 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <div className="max-h-64 overflow-y-auto custom-scrollbar">
                        <table className="w-full">
                          <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">
                                Artículo
                              </th>
                              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300">
                                Cantidad
                              </th>
                              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300">
                                Acciones
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {articulosSeleccionados.map((art, index) => (
                              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                                  {art.nombre}
                                </td>
                                <td className="px-4 py-2 text-sm text-center text-gray-700 dark:text-gray-300">
                                  {art.cantidad}
                                </td>
                                <td className="px-4 py-2 text-center">
                                  <button
                                    onClick={() => handleEliminarArticulo(index)}
                                    className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                    title="Eliminar"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setShowEditModal(false)}
                className="btn-secondary"
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                onClick={handleActualizarSolicitud}
                className="btn-primary"
                disabled={saving || articulosSeleccionados.length === 0}
              >
                {saving ? 'Actualizando...' : 'Actualizar Solicitud'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SolicitudArticulos

