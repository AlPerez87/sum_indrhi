import { useState, useEffect } from 'react'
import { Building2, Search, RefreshCw, AlertCircle, Plus, Edit, Trash2, X, Check } from 'lucide-react'
import { crmService } from '../services/crmService'
import Pagination from './Pagination'
import { usePagination } from '../hooks/usePagination'

const Departamentos = () => {
  const [departamentos, setDepartamentos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [formData, setFormData] = useState({
    codigo: '',
    departamento: ''
  })

  useEffect(() => {
    fetchDepartamentos()
  }, [])

  const fetchDepartamentos = async () => {
    setLoading(true)
    setError('')
    // Obtener todos los departamentos (sin límite de paginación)
    const result = await crmService.getDepartamentos(1, 10000, '')
    
    if (result.success) {
      setDepartamentos(result.data)
    } else {
      setError(result.message || 'Error al cargar los departamentos')
    }
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.codigo || !formData.departamento) {
      setError('Todos los campos son obligatorios')
      setTimeout(() => setError(''), 3000)
      return
    }

    const result = editingId
      ? await crmService.updateDepartamento(editingId, formData)
      : await crmService.createDepartamento(formData)

    if (result.success) {
      setSuccessMessage(result.message)
      setTimeout(() => setSuccessMessage(''), 3000)
      setShowForm(false)
      setEditingId(null)
      resetForm()
      fetchDepartamentos()
    } else {
      setError(result.message)
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleEdit = (depto) => {
    setFormData({
      codigo: depto.codigo,
      departamento: depto.departamento
    })
    setEditingId(depto.id)
    setShowForm(true)
  }

  const handleDelete = async (id, nombre) => {
    if (window.confirm(`¿Estás seguro de eliminar el departamento "${nombre}"?`)) {
      const result = await crmService.deleteDepartamento(id)
      
      if (result.success) {
        setSuccessMessage(result.message)
        setTimeout(() => setSuccessMessage(''), 3000)
        fetchDepartamentos()
      } else {
        setError(result.message)
        setTimeout(() => setError(''), 3000)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      codigo: '',
      departamento: ''
    })
    setEditingId(null)
  }

  const handleCancel = () => {
    setShowForm(false)
    resetForm()
  }

  const filteredDepartamentos = departamentos.filter(depto =>
    Object.values(depto).some(value =>
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
  } = usePagination(filteredDepartamentos)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="spinner mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando departamentos...</p>
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
            <Building2 className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Departamentos</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total: {filteredDepartamentos.length} {filteredDepartamentos.length === 1 ? 'departamento' : 'departamentos'}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={fetchDepartamentos}
            className="btn-secondary flex items-center gap-2"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nuevo Departamento
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
          <div className="card max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingId ? 'Editar Departamento' : 'Nuevo Departamento'}
                </h3>
                <button
                  onClick={handleCancel}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label-field">
                    Código <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.codigo}
                    onChange={(e) => setFormData({...formData, codigo: e.target.value})}
                    className="input-field"
                    placeholder="Ej: A-0001"
                    required
                  />
                </div>

                <div>
                  <label className="label-field">
                    Departamento <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.departamento}
                    onChange={(e) => setFormData({...formData, departamento: e.target.value})}
                    className="input-field"
                    placeholder="Nombre del departamento"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn-primary flex-1">
                    {editingId ? 'Actualizar' : 'Crear'} Departamento
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
          placeholder="Buscar departamentos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Table View */}
      <div className="card overflow-hidden">
        {/* Paginación Superior */}
        {filteredDepartamentos.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={filteredDepartamentos.length}
            onItemsPerPageChange={handleItemsPerPageChange}
            position="top"
          />
        )}

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Departamento
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredDepartamentos.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    {searchTerm ? 'No se encontraron departamentos con ese criterio' : 'No hay departamentos registrados'}
                  </td>
                </tr>
              ) : (
                paginatedData.map((depto) => (
                  <tr 
                    key={depto.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600 dark:text-primary-400">
                      {depto.codigo}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {depto.departamento}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(depto)}
                          className="p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(depto.id, depto.departamento)}
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
        {filteredDepartamentos.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={filteredDepartamentos.length}
            onItemsPerPageChange={handleItemsPerPageChange}
            position="bottom"
          />
        )}
      </div>
    </div>
  )
}

export default Departamentos

