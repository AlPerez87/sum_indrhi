import { useState, useEffect } from 'react'
import { Search, Eye, X, Package, CheckCircle, Send, AlertCircle } from 'lucide-react'
import { crmService } from '../services/crmService'
import Pagination from './Pagination'
import { usePagination } from '../hooks/usePagination'
import { useConfirmDialog } from '../hooks/useConfirmDialog'
import ConfirmDialog from './ConfirmDialog'

const SolicitudesGestionadas = () => {
  const [solicitudes, setSolicitudes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedSolicitud, setSelectedSolicitud] = useState(null)
  const [selectedRows, setSelectedRows] = useState([])
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const { dialogState, showConfirm, closeDialog } = useConfirmDialog()

  // Cargar solicitudes
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const result = await crmService.getSolicitudesGestionadas()

      if (result.success) {
        setSolicitudes(result.data.filter(s => s.id && s.id > 0))
      }
    } catch (error) {
      console.error('Error al cargar datos:', error)
    } finally {
      setLoading(false)
    }
  }

  // Ver detalles
  const handleVerDetalles = async (solicitud) => {
    const result = await crmService.getSolicitudGestionadaDetalle(solicitud.id)
    if (result.success) {
      setSelectedSolicitud(result.data)
      setShowDetailModal(true)
    }
  }

  // Despachar solicitud individual
  const handleDespacharSolicitud = async (solicitud) => {
    const confirmed = await showConfirm({
      title: '¿Despachar solicitud?',
      message: `¿Está seguro de despachar la solicitud ${solicitud.numero_solicitud}?`,
      type: 'warning',
      confirmText: 'Despachar'
    })
    
    if (!confirmed) return

    const result = await crmService.despacharSolicitudes(solicitud.id)
    if (result.success) {
      setSuccessMessage(result.message || 'Solicitud despachada correctamente')
      setTimeout(() => setSuccessMessage(''), 3000)
      loadData()
      setSelectedRows(selectedRows.filter(id => id !== solicitud.id))
    } else {
      setError(result.message || 'Error al despachar la solicitud')
      setTimeout(() => setError(''), 3000)
    }
  }

  // Manejar selección de filas
  const handleToggleRow = (id) => {
    setSelectedRows(prev => 
      prev.includes(id) 
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    )
  }

  const handleToggleAll = () => {
    if (selectedRows.length === filteredSolicitudes.length) {
      setSelectedRows([])
    } else {
      setSelectedRows(filteredSolicitudes.map(s => s.id))
    }
  }

  // Despachar solicitudes seleccionadas
  const handleDespacharSeleccionadas = async () => {
    if (selectedRows.length === 0) {
      setError('Debe seleccionar al menos una solicitud')
      setTimeout(() => setError(''), 3000)
      return
    }

    const confirmed = await showConfirm({
      title: '¿Despachar solicitudes?',
      message: `¿Está seguro de despachar ${selectedRows.length} solicitud(es)?`,
      type: 'warning',
      confirmText: `Despachar ${selectedRows.length}`
    })
    
    if (!confirmed) return

    const result = await crmService.despacharSolicitudes(selectedRows)
    if (result.success) {
      setSuccessMessage(result.message || `${selectedRows.length} solicitud(es) despachada(s) correctamente`)
      setTimeout(() => setSuccessMessage(''), 3000)
      setSelectedRows([])
      loadData()
    } else {
      setError(result.message || 'Error al despachar las solicitudes')
      setTimeout(() => setError(''), 3000)
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
          <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Solicitudes Gestionadas</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total: {filteredSolicitudes.length} {filteredSolicitudes.length === 1 ? 'solicitud' : 'solicitudes'}
              {selectedRows.length > 0 && ` | Seleccionadas: ${selectedRows.length}`}
            </p>
          </div>
        </div>
        
        {/* Botón para despachar seleccionadas */}
        {selectedRows.length > 0 && (
          <button
            onClick={handleDespacharSeleccionadas}
            className="btn-primary flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Despachar seleccionadas ({selectedRows.length})
          </button>
        )}
      </div>

      {/* Mensajes de éxito y error */}
      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          <p className="text-green-700 dark:text-green-300">{successMessage}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <p className="text-red-700 dark:text-red-300">{error}</p>
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
                <th className="px-4 py-3 w-12">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === filteredSolicitudes.length && filteredSolicitudes.length > 0}
                    onChange={handleToggleAll}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                  />
                </th>
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
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    {searchTerm ? 'No se encontraron solicitudes' : 'No hay solicitudes gestionadas'}
                  </td>
                </tr>
              ) : (
                paginatedData.map((solicitud) => (
                  <tr
                    key={solicitud.id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                      selectedRows.includes(solicitud.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <td className="px-4 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(solicitud.id)}
                        onChange={() => handleToggleRow(solicitud.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                      />
                    </td>
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
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
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
                          onClick={() => handleDespacharSolicitud(solicitud)}
                          className="p-2 text-green-600 hover:text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                          title="Despachar solicitud"
                        >
                          <Send className="w-4 h-4" />
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
              <h3 className="modal-title">Detalles de la Solicitud Gestionada</h3>
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
                    Artículos Gestionados ({selectedSolicitud.articulos?.length || 0})
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

      {/* Modal de Confirmación */}
      <ConfirmDialog
        {...dialogState}
        onClose={closeDialog}
        onConfirm={dialogState.onConfirm}
      />
    </div>
  )
}

export default SolicitudesGestionadas

