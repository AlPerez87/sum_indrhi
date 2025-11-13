import { useState, useEffect } from 'react'
import { Search, Plus, Eye, X, Trash2, AlertCircle, Package } from 'lucide-react'
import { crmService } from '../services/crmService'
import { getUnidadLabel } from '../constants/unidades'
import Pagination from './Pagination'
import { usePagination } from '../hooks/usePagination'
import SearchableSelect from './SearchableSelect'

const EntradaMercancia = () => {
  const [entradas, setEntradas] = useState([])
  const [articulos, setArticulos] = useState([])
  const [unidades, setUnidades] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedEntrada, setSelectedEntrada] = useState(null)
  const [formData, setFormData] = useState({
    numero_entrada: '',
    numero_orden: '',
    fecha: '',
    suplidor: ''
  })
  const [articulosSeleccionados, setArticulosSeleccionados] = useState([])
  const [articuloActual, setArticuloActual] = useState({
    articulo: '',
    cantidad: '',
    unidad: 'UNIDAD'
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  // Cargar entradas y artículos
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Cargar entradas, artículos y unidades
      const [entradasResult, articulosResult, unidadesResult] = await Promise.all([
        crmService.getEntradasMercancia(),
        crmService.getArticulos(),
        crmService.getUnidades()
      ])

      if (entradasResult.success) {
        // Validar que todas las entradas tengan ID válido
        const entradasValidas = entradasResult.data.filter(entrada => {
          if (!entrada.id || entrada.id === 0) {
            console.error('⚠️ Entrada sin ID válido:', entrada)
            return false
          }
          return true
        })
        
        if (entradasValidas.length !== entradasResult.data.length) {
          console.warn('⚠️ Se encontraron', entradasResult.data.length - entradasValidas.length, 'entradas con ID inválido')
        }
        
        console.log('✅ Entradas cargadas:', entradasValidas.length)
        setEntradas(entradasValidas)
      }

      if (articulosResult.success) {
        // Filtrar artículos sin código válido
        const articulosValidos = articulosResult.data.filter(art => {
          if (!art.articulo) {
            console.warn('⚠️ Artículo sin código:', art)
            return false
          }
          return true
        })
        
        console.log('Artículos cargados:', articulosValidos.length, 'de', articulosResult.data.length)
        if (articulosValidos.length !== articulosResult.data.length) {
          console.warn('⚠️ Se filtraron', articulosResult.data.length - articulosValidos.length, 'artículos sin código')
        }
        
        setArticulos(articulosValidos)
      }

      if (unidadesResult.success) {
        console.log('Unidades recibidas del backend:', unidadesResult.data)
        console.log('Cantidad de unidades:', unidadesResult.data.length)
        setUnidades(unidadesResult.data)
      } else {
        console.error('Error al cargar unidades:', unidadesResult)
      }
    } catch (error) {
      console.error('Error al cargar datos:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filtrar entradas por búsqueda
  const filteredEntradas = entradas.filter(entrada =>
    entrada.numero_entrada.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entrada.numero_orden.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entrada.suplidor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entrada.fecha.includes(searchTerm)
  )

  // Paginación
  const {
    currentPage,
    itemsPerPage,
    totalPages,
    paginatedData,
    handlePageChange,
    handleItemsPerPageChange
  } = usePagination(filteredEntradas)

  // Abrir modal para nueva entrada
  const handleNuevaEntrada = async () => {
    try {
      const result = await crmService.getSiguienteNumeroEntrada()
      if (result.success) {
        setFormData({
          numero_entrada: result.data.numero_entrada,
          numero_orden: result.data.numero_orden,
          fecha: result.data.fecha,
          suplidor: ''
        })
        setArticulosSeleccionados([])
        setArticuloActual({
          articulo: '',
          cantidad: '',
          unidad: 'UNIDAD'
        })
        setError('')
        setShowModal(true)
      }
    } catch (error) {
      console.error('Error al obtener siguiente número:', error)
    }
  }

  // Agregar artículo a la lista
  const handleAgregarArticulo = () => {
    if (!articuloActual.articulo) {
      setError('Debe seleccionar un artículo')
      return
    }
    if (!articuloActual.cantidad || articuloActual.cantidad <= 0) {
      setError('Debe ingresar una cantidad válida')
      return
    }

    const articuloInfo = articulos.find(a => a.articulo === articuloActual.articulo)
    
    setArticulosSeleccionados([
      ...articulosSeleccionados,
      {
        codigo: articuloActual.articulo,
        nombre: articuloInfo?.descripcion || articuloInfo?.articulo || articuloActual.articulo,
        cantidad: parseFloat(articuloActual.cantidad),
        unidad: articuloActual.unidad
      }
    ])

    setArticuloActual({
      articulo: '',
      cantidad: '',
      unidad: 'UNIDAD'
    })
    setError('')
  }

  // Eliminar artículo de la lista
  const handleEliminarArticulo = (index) => {
    setArticulosSeleccionados(articulosSeleccionados.filter((_, i) => i !== index))
  }

  // Editar número de orden (solo los últimos 4 dígitos)
  const handleNumeroOrdenChange = (value) => {
    const anioActual = new Date().getFullYear()
    const prefix = `INDRHI-DAF-CD-${anioActual}-`
    
    // Extraer solo los dígitos finales
    let numero = value.replace(prefix, '')
    numero = numero.replace(/\D/g, '').slice(0, 4)
    
    setFormData({
      ...formData,
      numero_orden: prefix + numero.padStart(4, '0')
    })
  }

  // Guardar entrada
  const handleGuardar = async () => {
    if (!formData.suplidor.trim()) {
      setError('Debe ingresar el nombre del suplidor')
      return
    }

    if (articulosSeleccionados.length === 0) {
      setError('Debe agregar al menos un artículo')
      return
    }

    setSaving(true)
    setError('')

    try {
      const entrada = {
        numero_orden: formData.numero_orden,
        suplidor: formData.suplidor,
        articulos: articulosSeleccionados.map(art => ({
          articulo: art.nombre,
          cantidad: art.cantidad,
          unidad: art.unidad
        }))
      }

      const result = await crmService.createEntradaMercancia(entrada)

      if (result.success) {
        setShowModal(false)
        loadData()
        alert('Entrada de mercancía creada correctamente')
      } else {
        setError(result.message || 'Error al crear la entrada')
      }
    } catch (error) {
      setError('Error al guardar la entrada')
      console.error('Error:', error)
    } finally {
      setSaving(false)
    }
  }

  // Ver detalles de una entrada
  const handleVerDetalles = async (entrada) => {
    try {
      const result = await crmService.getEntradaMercanciaDetalle(entrada.id)
      if (result.success) {
        setSelectedEntrada(result.data)
        setShowDetailModal(true)
      }
    } catch (error) {
      console.error('Error al obtener detalles:', error)
    }
  }

  // Formatear fecha
  const formatFecha = (fecha) => {
    const date = new Date(fecha + 'T00:00:00')
    return date.toLocaleDateString('es-DO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Entrada de Mercancía
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestiona las entradas de mercancía al almacén
          </p>
        </div>
        <button
          onClick={handleNuevaEntrada}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nueva Entrada
        </button>
      </div>

      {/* Buscador */}
      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por número de entrada, orden, suplidor o fecha..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="card overflow-hidden">
        {/* Paginación Superior */}
        {filteredEntradas.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={filteredEntradas.length}
            onItemsPerPageChange={handleItemsPerPageChange}
            position="top"
          />
        )}

        <div className="overflow-x-auto custom-scrollbar">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="table-header">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Nº Entrada
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Nº Orden
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Suplidor
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Total Artículos
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    {searchTerm ? 'No se encontraron entradas' : 'No hay entradas registradas'}
                  </td>
                </tr>
              ) : (
                paginatedData.map((entrada) => (
                  <tr key={entrada.id} className="table-row">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {entrada.numero_entrada}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {entrada.numero_orden}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {formatFecha(entrada.fecha)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {entrada.suplidor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="badge badge-info">
                        {entrada.total_articulos} {entrada.total_articulos === 1 ? 'artículo' : 'artículos'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleVerDetalles(entrada)}
                        className="p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors inline-flex items-center gap-1"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="text-xs">Detalles</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nueva Entrada */}
      {showModal && (
        <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Nueva Entrada de Mercancía
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              {/* Error */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3 mb-6">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
                </div>
              )}

              {/* Layout de 2 Columnas: Información General (izquierda) y Artículos (derecha) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* COLUMNA IZQUIERDA: Información General */}
                <div className="lg:col-span-4 space-y-4">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white pb-2 border-b border-gray-200 dark:border-gray-700">
                    Información General
                  </h3>
                  {/* Número de Entrada */}
                  <div>
                    <label className="label-field">Nº Entrada</label>
                    <input
                      type="text"
                      value={formData.numero_entrada}
                      disabled
                      className="input-field bg-gray-100 dark:bg-gray-700 cursor-not-allowed font-mono"
                    />
                  </div>

                  {/* Número de Orden */}
                  <div>
                    <label className="label-field">
                      Nº Orden 
                      <span className="text-gray-500 dark:text-gray-400 font-normal ml-2 text-xs">
                        (Últimos 4 dígitos editables)
                      </span>
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700 dark:text-gray-300 font-mono text-sm">
                        {formData.numero_orden.substring(0, formData.numero_orden.length - 4)}
                      </span>
                      <input
                        type="text"
                        value={formData.numero_orden.slice(-4)}
                        onChange={(e) => handleNumeroOrdenChange(`INDRHI-DAF-CD-${new Date().getFullYear()}-${e.target.value}`)}
                        maxLength={4}
                        className="input-field w-24 font-mono"
                        placeholder="0001"
                      />
                    </div>
                  </div>

                  {/* Fecha */}
                  <div>
                    <label className="label-field">Fecha</label>
                    <input
                      type="text"
                      value={formatFecha(formData.fecha)}
                      disabled
                      className="input-field bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                    />
                  </div>

                  {/* Suplidor */}
                  <div>
                    <label className="label-field">Suplidor *</label>
                    <input
                      type="text"
                      value={formData.suplidor}
                      onChange={(e) => setFormData({ ...formData, suplidor: e.target.value })}
                      className="input-field"
                      placeholder="Nombre del suplidor"
                    />
                  </div>
                </div>

                {/* COLUMNA DERECHA: Artículos a Ingresar */}
                <div className="lg:col-span-8 space-y-4">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white pb-2 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Artículos a Ingresar
                  </h3>

                  {/* Formulario de artículo */}
                <div className="grid grid-cols-12 gap-3">
                  {/* Selector de artículo */}
                  <div className="col-span-12 md:col-span-7">
                    <SearchableSelect
                      options={articulos.map(art => ({
                        value: art.articulo,
                        label: art.descripcion || art.articulo // Descripción o código como fallback
                      }))}
                      value={articuloActual.articulo}
                      onChange={(value) => {
                        console.log('EntradaMercancia - Artículo seleccionado:', value)
                        console.log('EntradaMercancia - Estado anterior:', articuloActual)
                        const nuevoEstado = { ...articuloActual, articulo: value }
                        console.log('EntradaMercancia - Nuevo estado:', nuevoEstado)
                        setArticuloActual(nuevoEstado)
                      }}
                      placeholder="Seleccionar artículo..."
                      searchPlaceholder="Buscar artículo..."
                      emptyMessage="No hay artículos disponibles"
                      className="text-sm"
                    />
                  </div>

                  {/* Cantidad */}
                  <div className="col-span-5 md:col-span-2">
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

                  {/* Unidad */}
                  <div className="col-span-6 md:col-span-2">
                    <select
                      value={articuloActual.unidad}
                      onChange={(e) => {
                        console.log('Unidad seleccionada:', e.target.value)
                        setArticuloActual({ ...articuloActual, unidad: e.target.value })
                      }}
                      className="input-field text-sm"
                    >
                      {unidades.length > 0 ? (
                        unidades.map((unidad) => (
                          <option key={unidad.value || unidad.label} value={unidad.value}>
                            {unidad.label}
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="UNIDAD">Unidad</option>
                          {/* Debug: Mostrar estado de unidades */}
                          {console.log('⚠️ No hay unidades cargadas. Estado actual:', unidades)}
                        </>
                      )}
                    </select>
                  </div>

                  {/* Botón Agregar */}
                  <div className="col-span-1">
                    <button
                      onClick={handleAgregarArticulo}
                      className="btn-primary w-full h-full"
                      title="Agregar artículo"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Lista de artículos agregados */}
                {articulosSeleccionados.length > 0 && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                    <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">
                      Artículos Agregados ({articulosSeleccionados.length}):
                    </h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                      {articulosSeleccionados.map((art, index) => (
                        <div
                          key={`art-selected-${art.codigo}-${index}`}
                          className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {art.nombre}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Código: {art.codigo} • Cantidad: {art.cantidad} {getUnidadLabel(art.unidad)}
                            </p>
                          </div>
                          <button
                            onClick={() => handleEliminarArticulo(index)}
                            className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end gap-3">
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
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="spinner-small"></span>
                    Guardando...
                  </>
                ) : (
                  'Guardar Entrada'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ver Detalles */}
      {showDetailModal && selectedEntrada && (
        <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Detalles de Entrada
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* COLUMNA IZQUIERDA: Información General */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Nº Entrada</label>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                        {selectedEntrada.numero_entrada}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Nº Orden</label>
                      <p className="text-sm text-gray-900 dark:text-white mt-1">
                        {selectedEntrada.numero_orden}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Fecha</label>
                      <p className="text-sm text-gray-900 dark:text-white mt-1">
                        {formatFecha(selectedEntrada.fecha)}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Suplidor</label>
                      <p className="text-sm text-gray-900 dark:text-white mt-1">
                        {selectedEntrada.suplidor}
                      </p>
                    </div>
                  </div>
                </div>

                {/* COLUMNA DERECHA: Artículos Ingresados */}
                <div className="lg:col-span-8">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Artículos Ingresados ({selectedEntrada.total_articulos})
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
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300">
                              Unidad
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {selectedEntrada.articulos && selectedEntrada.articulos.map((art, index) => (
                            <tr key={`art-detalle-${art.articulo}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                {art.articulo}
                              </td>
                              <td className="px-4 py-3 text-sm text-center text-gray-700 dark:text-gray-300">
                                {art.cantidad}
                              </td>
                              <td className="px-4 py-3 text-sm text-center text-gray-700 dark:text-gray-300">
                                {getUnidadLabel(art.unidad)}
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

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end">
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
    </div>
  )
}

export default EntradaMercancia

