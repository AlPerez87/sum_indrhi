import { useState, useEffect } from 'react'
import { Package, Search, RefreshCw, AlertCircle, Plus, Edit, Trash2, X, Check } from 'lucide-react'
import { crmService } from '../services/crmService'
import { getUnidadLabel } from '../constants/unidades'
import Pagination from './Pagination'
import { usePagination } from '../hooks/usePagination'

const Articulos = () => {
  const [articulos, setArticulos] = useState([])
  const [unidades, setUnidades] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [showBajoMinimo, setShowBajoMinimo] = useState(false)
  const [formData, setFormData] = useState({
    articulo: '',
    descripcion: '',
    existencia: '',
    cantidad_minima: '',
    valor: '',
    unidad: 'UNIDAD'
  })

  useEffect(() => {
    fetchData()
  }, [])

  // Función para formatear números con separador de miles
  const formatCurrency = (value) => {
    if (!value || isNaN(value)) return '0.00'
    return parseFloat(value).toLocaleString('es-DO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  const fetchData = async () => {
    setLoading(true)
    await Promise.all([fetchArticulos(), fetchUnidades()])
    setLoading(false)
  }

  const fetchUnidades = async () => {
    const result = await crmService.getUnidades()
    if (result.success) {
      setUnidades(result.data)
    }
  }

  const fetchArticulos = async () => {
    setLoading(true)
    setError('')
    // Obtener todos los artículos (sin límite de paginación)
    const result = await crmService.getArticulos(1, 10000, '')
    
    if (result.success) {
      setArticulos(result.data)
    } else {
      setError(result.message || 'Error al cargar los artículos')
    }
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validar campos obligatorios
    if (!formData.articulo || !formData.descripcion || !formData.existencia || !formData.unidad) {
      setError('Los campos Artículo, Descripción, Existencia y Unidad son obligatorios')
      setTimeout(() => setError(''), 3000)
      return
    }

    const result = editingId
      ? await crmService.updateArticulo(editingId, formData)
      : await crmService.createArticulo(formData)

    if (result.success) {
      setSuccessMessage(result.message)
      setTimeout(() => setSuccessMessage(''), 3000)
      setShowForm(false)
      setEditingId(null)
      resetForm()
      fetchArticulos()
    } else {
      setError(result.message)
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleEdit = (articulo) => {
    setFormData({
      articulo: articulo.articulo,
      descripcion: articulo.descripcion || '',
      existencia: articulo.existencia || '',
      cantidad_minima: articulo.cantidad_minima || '',
      valor: articulo.valor || '',
      unidad: articulo.unidad || ''
    })
    setEditingId(articulo.id)
    setShowForm(true)
  }

  const handleDelete = async (id, nombre) => {
    if (window.confirm(`¿Estás seguro de eliminar el artículo "${nombre}"?`)) {
      const result = await crmService.deleteArticulo(id)
      
      if (result.success) {
        setSuccessMessage(result.message)
        setTimeout(() => setSuccessMessage(''), 3000)
        fetchArticulos()
      } else {
        setError(result.message)
        setTimeout(() => setError(''), 3000)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      articulo: '',
      descripcion: '',
      existencia: '',
      cantidad_minima: '',
      valor: '',
      unidad: ''
    })
    setEditingId(null)
  }

  const handleCancel = () => {
    setShowForm(false)
    resetForm()
  }

  const calculateTotal = (existencia, valor) => {
    return (parseFloat(existencia || 0) * parseFloat(valor || 0)).toFixed(2)
  }

  const filteredArticulos = articulos.filter(articulo => {
    // Filtro de búsqueda
    const matchesSearch = Object.values(articulo).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
    
    // Filtro de bajo mínimo
    if (showBajoMinimo) {
      const existencia = parseFloat(articulo.existencia || 0)
      const minimo = parseFloat(articulo.cantidad_minima || 0)
      return matchesSearch && existencia < minimo
    }
    
    return matchesSearch
  })

  // Paginación
  const {
    currentPage,
    itemsPerPage,
    totalPages,
    paginatedData,
    handlePageChange,
    handleItemsPerPageChange
  } = usePagination(filteredArticulos)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="spinner mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando artículos...</p>
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Artículos</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total: {filteredArticulos.length} {filteredArticulos.length === 1 ? 'artículo' : 'artículos'}
              {showBajoMinimo && (
                <span className="ml-2 text-amber-600 dark:text-amber-400 font-semibold">
                  (Bajo mínimo)
                </span>
              )}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={fetchArticulos}
            className="btn-secondary flex items-center gap-2"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
          <button
            onClick={() => setShowBajoMinimo(!showBajoMinimo)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg ${
              showBajoMinimo
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            {showBajoMinimo ? 'Mostrar Todos' : 'Bajo Mínimo'}
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nuevo Artículo
          </button>
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

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 bg-black/50 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
          <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingId ? 'Editar Artículo' : 'Nuevo Artículo'}
                </h3>
                <button
                  onClick={handleCancel}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="label-field">
                      Artículo <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.articulo}
                      onChange={(e) => setFormData({...formData, articulo: e.target.value})}
                      className="input-field"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="label-field">
                      Descripción <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.descripcion}
                      onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                      className="input-field"
                      rows="3"
                      required
                    />
                  </div>

                  <div>
                    <label className="label-field">
                      Existencia <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.existencia}
                      onChange={(e) => setFormData({...formData, existencia: e.target.value})}
                      className="input-field"
                      required
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="label-field">
                      Cantidad Mínima
                    </label>
                    <input
                      type="number"
                      value={formData.cantidad_minima}
                      onChange={(e) => setFormData({...formData, cantidad_minima: e.target.value})}
                      className="input-field"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="label-field">
                      Valor (RD$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.valor}
                      onChange={(e) => setFormData({...formData, valor: e.target.value})}
                      className="input-field"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="label-field">
                      Unidad <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.unidad}
                      onChange={(e) => setFormData({...formData, unidad: e.target.value})}
                      className="input-field"
                      required
                    >
                      {unidades.length > 0 ? (
                        unidades.map((unidad) => (
                          <option key={unidad.value || unidad.label} value={unidad.value}>
                            {unidad.label}
                          </option>
                        ))
                      ) : (
                        <option value="UNIDAD">Unidad</option>
                      )}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn-primary flex-1">
                    {editingId ? 'Actualizar' : 'Crear'} Artículo
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn-secondary flex-1"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar artículos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {/* Paginación Superior */}
        {filteredArticulos.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={filteredArticulos.length}
            onItemsPerPageChange={handleItemsPerPageChange}
            position="top"
          />
        )}

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Artículo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Existencia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Cantidad Mínima
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Valor Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Unidad
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredArticulos.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    {searchTerm ? 'No se encontraron artículos con ese criterio' : 'No hay artículos registrados'}
                  </td>
                </tr>
              ) : (
                paginatedData.map((articulo) => (
                  <tr 
                    key={articulo.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {articulo.articulo}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate">
                      {articulo.descripcion || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      <span className={`${
                        articulo.existencia <= articulo.cantidad_minima 
                          ? 'badge-danger'
                          : 'badge-success'
                      }`}>
                        {articulo.existencia || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {articulo.cantidad_minima || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      RD$ {formatCurrency(articulo.valor)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-primary-600 dark:text-primary-400">
                      RD$ {calculateTotal(articulo.existencia, articulo.valor)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {articulo.unidad ? getUnidadLabel(articulo.unidad) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(articulo)}
                          className="p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(articulo.id, articulo.articulo)}
                          className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Eliminar"
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

        {/* Paginación Inferior */}
        {filteredArticulos.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={filteredArticulos.length}
            onItemsPerPageChange={handleItemsPerPageChange}
            position="bottom"
          />
        )}
      </div>
    </div>
  )
}

export default Articulos

