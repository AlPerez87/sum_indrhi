import { useState, useEffect } from 'react'
import { Search, Eye, X, Trash2, AlertCircle, Package, Check, FileCheck } from 'lucide-react'
import { crmService } from '../services/crmService'
import Pagination from './Pagination'
import { usePagination } from '../hooks/usePagination'
import { useConfirmDialog } from '../hooks/useConfirmDialog'
import ConfirmDialog from './ConfirmDialog'

const AutorizarSolicitudes = () => {
  const [solicitudes, setSolicitudes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedSolicitud, setSelectedSolicitud] = useState(null)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [selectedRows, setSelectedRows] = useState([])
  const { dialogState, showConfirm, closeDialog } = useConfirmDialog()

  // Cargar solicitudes
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const result = await crmService.getAutorizarSolicitudes()

      if (result.success) {
        setSolicitudes(result.data.filter(s => s.id && s.id > 0))
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
    const result = await crmService.getAutorizarSolicitudDetalle(solicitud.id)
    if (result.success) {
      setSelectedSolicitud(result.data)
      setShowDetailModal(true)
    }
  }

  // Rechazar solicitud
  const handleRechazarSolicitud = async (solicitud) => {
    const confirmed = await showConfirm({
      title: '¿Rechazar solicitud?',
      message: `¿Está seguro de rechazar la solicitud ${solicitud.numero_solicitud}?`,
      type: 'danger',
      confirmText: 'Rechazar'
    })
    
    if (!confirmed) return

    const result = await crmService.rechazarSolicitud(solicitud.id)
    if (result.success) {
      setSuccessMessage('Solicitud rechazada correctamente')
      setTimeout(() => setSuccessMessage(''), 3000)
      loadData()
      setSelectedRows(selectedRows.filter(id => id !== solicitud.id))
    } else {
      setError(result.message || 'Error al rechazar la solicitud')
      setTimeout(() => setError(''), 3000)
    }
  }

  // Aprobar solicitud individual
  const handleAprobarSolicitud = async (solicitud) => {
    const confirmed = await showConfirm({
      title: '¿Aprobar solicitud?',
      message: `¿Está seguro de aprobar la solicitud ${solicitud.numero_solicitud}?`,
      type: 'success',
      confirmText: 'Aprobar'
    })
    
    if (!confirmed) return

    const result = await crmService.aprobarSolicitudes(solicitud.id)
    if (result.success) {
      setSuccessMessage(result.message || 'Solicitud aprobada correctamente')
      setTimeout(() => setSuccessMessage(''), 3000)
      loadData()
      setSelectedRows(selectedRows.filter(id => id !== solicitud.id))
    } else {
      setError(result.message || 'Error al aprobar la solicitud')
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

  // Acciones colectivas
  const handleAprobarSeleccionadas = async () => {
    if (selectedRows.length === 0) {
      setError('Debe seleccionar al menos una solicitud')
      setTimeout(() => setError(''), 3000)
      return
    }

    const confirmed = await showConfirm({
      title: '¿Aprobar solicitudes?',
      message: `¿Está seguro de aprobar ${selectedRows.length} solicitud(es)?`,
      type: 'success',
      confirmText: `Aprobar ${selectedRows.length}`
    })
    
    if (!confirmed) return

    const result = await crmService.aprobarSolicitudes(selectedRows)
    if (result.success) {
      setSuccessMessage(result.message || `${selectedRows.length} solicitud(es) aprobada(s) correctamente`)
      setTimeout(() => setSuccessMessage(''), 3000)
      setSelectedRows([])
      loadData()
    } else {
      setError(result.message || 'Error al aprobar las solicitudes')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleRechazarSeleccionadas = async () => {
    if (selectedRows.length === 0) {
      setError('Debe seleccionar al menos una solicitud')
      setTimeout(() => setError(''), 3000)
      return
    }

    const confirmed = await showConfirm({
      title: '¿Rechazar solicitudes?',
      message: `¿Está seguro de rechazar ${selectedRows.length} solicitud(es)?`,
      type: 'danger',
      confirmText: `Rechazar ${selectedRows.length}`
    })
    
    if (!confirmed) return

    let rechazadas = 0
    for (const id of selectedRows) {
      const result = await crmService.rechazarSolicitud(id)
      if (result.success) rechazadas++
    }

    setSuccessMessage(`${rechazadas} solicitud(es) rechazada(s) correctamente`)
    setTimeout(() => setSuccessMessage(''), 3000)
    setSelectedRows([])
    loadData()
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
            <FileCheck className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Autorizar Solicitudes</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total: {filteredSolicitudes.length} {filteredSolicitudes.length === 1 ? 'solicitud' : 'solicitudes'}
            </p>
          </div>
        </div>

        {/* Acciones colectivas */}
        {selectedRows.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={handleAprobarSeleccionadas}
              className="btn-primary flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Aprobar ({selectedRows.length})
            </button>
            <button
              onClick={handleRechazarSeleccionadas}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Rechazar ({selectedRows.length})
            </button>
          </div>
        )}
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
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === filteredSolicitudes.length && filteredSolicitudes.length > 0}
                    onChange={handleToggleAll}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
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
                    {searchTerm ? 'No se encontraron solicitudes' : 'No hay solicitudes pendientes de autorización'}
                  </td>
                </tr>
              ) : (
                paginatedData.map((solicitud) => (
                  <tr
                    key={solicitud.id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                      selectedRows.includes(solicitud.id) ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                    }`}
                  >
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(solicitud.id)}
                        onChange={() => handleToggleRow(solicitud.id)}
                        className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
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
                          onClick={() => handleAprobarSolicitud(solicitud)}
                          className="p-2 text-green-600 hover:text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                          title="Aprobar solicitud"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRechazarSolicitud(solicitud)}
                          className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Rechazar solicitud"
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
              <button
                onClick={() => {
                  setShowDetailModal(false)
                  handleAprobarSolicitud(selectedSolicitud)
                }}
                className="btn-primary flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Aprobar Solicitud
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

export default AutorizarSolicitudes

