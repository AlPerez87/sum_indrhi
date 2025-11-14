import { useState, useEffect } from 'react'
import { Search, Eye, X, Settings, AlertCircle, Package, Check } from 'lucide-react'
import { crmService } from '../services/crmService'
import Pagination from './Pagination'
import { usePagination } from '../hooks/usePagination'

const SolicitudesAprobadas = () => {
  const [solicitudes, setSolicitudes] = useState([])
  const [articulos, setArticulos] = useState([]) // Lista de artículos con existencias
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showGestionarModal, setShowGestionarModal] = useState(false)
  const [selectedSolicitud, setSelectedSolicitud] = useState(null)
  const [articulosEditables, setArticulosEditables] = useState([])
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [saving, setSaving] = useState(false)

  // Cargar solicitudes y artículos
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [solicitudesResult, articulosResult] = await Promise.all([
        crmService.getSolicitudesAprobadas(),
        crmService.getArticulos(1, 10000, '') // Obtener todos los artículos
      ])

      if (solicitudesResult.success) {
        setSolicitudes(solicitudesResult.data.filter(s => s.id && s.id > 0))
      }

      if (articulosResult.success) {
        setArticulos(articulosResult.data)
      }
    } catch (error) {
      console.error('Error al cargar datos:', error)
      setError('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  // Ver detalles
  const handleVerDetalles = async (solicitud) => {
    const result = await crmService.getSolicitudAprobadaDetalle(solicitud.id)
    if (result.success) {
      setSelectedSolicitud(result.data)
      setShowDetailModal(true)
    }
  }

  // Abrir modal de gestionar
  const handleGestionarSolicitud = async (solicitud) => {
    const result = await crmService.getSolicitudAprobadaDetalle(solicitud.id)
    if (result.success) {
      setSelectedSolicitud(result.data)
      
      // Mapear artículos con sus existencias
      const articulosConExistencias = result.data.articulos.map(art => {
        const articuloInfo = articulos.find(a => 
          a.codigo === art.codigo || a.descripcion === art.articulo
        )
        return {
          ...art,
          existencia: articuloInfo?.existencia || 0
        }
      })
      
      setArticulosEditables(articulosConExistencias)
      setShowGestionarModal(true)
    }
  }

  // Actualizar cantidad de artículo
  const handleCantidadChange = (index, nuevaCantidad) => {
    const nuevosArticulos = [...articulosEditables]
    nuevosArticulos[index].cantidad = nuevaCantidad
    setArticulosEditables(nuevosArticulos)
  }

  // Guardar gestión
  const handleGuardarGestion = async () => {
    // Validar que no haya cantidades en 0 o negativas
    const cantidadInvalida = articulosEditables.find(art => 
      !art.cantidad || parseFloat(art.cantidad) <= 0
    )

    if (cantidadInvalida) {
      setError('No se permiten cantidades en 0 o negativas')
      return
    }

    setSaving(true)
    setError('')

    try {
      const result = await crmService.gestionarSolicitudAprobada(
        selectedSolicitud.id,
        articulosEditables
      )

      if (result.success) {
        setShowGestionarModal(false)
        setSuccessMessage('Solicitud gestionada correctamente')
        setTimeout(() => setSuccessMessage(''), 3000)
        loadData()
      } else {
        setError(result.message || 'Error al gestionar la solicitud')
      }
    } catch (error) {
      console.error('Error:', error)
      setError('Error al gestionar la solicitud')
    } finally {
      setSaving(false)
    }
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
            <Package className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Solicitudes Aprobadas</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total: {filteredSolicitudes.length} {filteredSolicitudes.length === 1 ? 'solicitud' : 'solicitudes'}
            </p>
          </div>
        </div>
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
                    {searchTerm ? 'No se encontraron solicitudes' : 'No hay solicitudes aprobadas'}
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
                          onClick={() => handleGestionarSolicitud(solicitud)}
                          className="p-2 text-green-600 hover:text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                          title="Gestionar solicitud"
                        >
                          <Settings className="w-4 h-4" />
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

      {/* Modal Gestionar Solicitud */}
      {showGestionarModal && selectedSolicitud && (
        <div className="modal-overlay">
          <div className="modal-container max-w-7xl">
            <div className="modal-header">
              <h3 className="modal-title">Gestionar Solicitud</h3>
              <button onClick={() => setShowGestionarModal(false)} className="modal-close">
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
                {/* COLUMNA IZQUIERDA: Información (solo lectura) */}
                <div className="lg:col-span-4 space-y-4">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white pb-2 border-b border-gray-200 dark:border-gray-700">
                    Información de la Solicitud
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="label-field">Nº Solicitud</label>
                      <input
                        type="text"
                        value={selectedSolicitud.numero_solicitud}
                        disabled
                        className="input-field bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="label-field">Fecha</label>
                      <input
                        type="text"
                        value={new Date(selectedSolicitud.fecha).toLocaleDateString('es-DO')}
                        disabled
                        className="input-field bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="label-field">Departamento</label>
                      <input
                        type="text"
                        value={selectedSolicitud.departamento}
                        disabled
                        className="input-field bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                {/* COLUMNA DERECHA: Artículos (editables) */}
                <div className="lg:col-span-8 space-y-4">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white pb-2 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Artículos y Cantidades
                  </h3>

                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                      <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300">
                              Artículo
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300">
                              Existencia
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300">
                              Cantidad
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {articulosEditables.map((art, index) => (
                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                {art.articulo || art.nombre}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  art.existencia > 0
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                }`}>
                                  {art.existencia}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  type="number"
                                  value={art.cantidad}
                                  onChange={(e) => handleCantidadChange(index, e.target.value)}
                                  min="1"
                                  step="any"
                                  className="input-field text-sm text-center"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    * Ajusta las cantidades según disponibilidad. No se permiten cantidades en 0.
                  </p>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setShowGestionarModal(false)}
                className="btn-secondary"
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardarGestion}
                className="btn-primary"
                disabled={saving}
              >
                {saving ? 'Gestionando...' : 'Gestionar Solicitud'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SolicitudesAprobadas

