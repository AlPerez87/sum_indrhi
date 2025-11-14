import { useState, useEffect } from 'react'
import { Users, Search, RefreshCw, AlertCircle, Edit, Key, X, Check } from 'lucide-react'
import { crmService } from '../services/crmService'
import Pagination from './Pagination'
import { usePagination } from '../hooks/usePagination'
import SearchableSelect from './SearchableSelect'

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([])
  const [departamentos, setDepartamentos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [editingUser, setEditingUser] = useState(null)
  const [changingPassword, setChangingPassword] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [selectedDepartamento, setSelectedDepartamento] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    setError('')
    
    const [usuariosResult, deptosResult] = await Promise.all([
      crmService.getUsuariosDepartamentos(),
      crmService.getDepartamentos(1, 10000, '') // Obtener todos los departamentos
    ])
    
    if (usuariosResult.success) {
      setUsuarios(usuariosResult.data)
    } else {
      setError(usuariosResult.message || 'Error al cargar los usuarios')
    }
    
    if (deptosResult.success) {
      setDepartamentos(deptosResult.data)
    }
    
    setLoading(false)
  }

  const handleEditDepartamento = (usuario) => {
    setEditingUser(usuario.id)
    setSelectedDepartamento(usuario.departamento_id || '')
  }

  const handleSaveDepartamento = async (id) => {
    const result = await crmService.updateUsuarioDepartamento(
      id,
      selectedDepartamento === '' ? null : parseInt(selectedDepartamento)
    )
    
    if (result.success) {
      setSuccessMessage('Departamento actualizado correctamente')
      setTimeout(() => setSuccessMessage(''), 3000)
      fetchData()
      setEditingUser(null)
    } else {
      setError(result.message)
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleChangePassword = (usuario) => {
    setChangingPassword(usuario.id)
    setNewPassword('')
  }

  const handleSavePassword = async (id) => {
    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      setTimeout(() => setError(''), 3000)
      return
    }

    const result = await crmService.updateUsuarioPassword(id, newPassword)
    
    if (result.success) {
      setSuccessMessage('Contraseña actualizada correctamente')
      setTimeout(() => setSuccessMessage(''), 3000)
      setChangingPassword(null)
      setNewPassword('')
    } else {
      setError(result.message)
      setTimeout(() => setError(''), 3000)
    }
  }

  const filteredUsuarios = usuarios.filter(usuario =>
    Object.values(usuario).some(value =>
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
  } = usePagination(filteredUsuarios)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="spinner mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando usuarios...</p>
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
            <Users className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Usuarios</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total: {filteredUsuarios.length} {filteredUsuarios.length === 1 ? 'usuario' : 'usuarios'}
            </p>
          </div>
        </div>
        
        <button
          onClick={fetchData}
          className="btn-secondary flex items-center gap-2"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
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
          placeholder="Buscar usuarios..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Info Note */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>Nota:</strong> Para cambiar roles o eliminar usuarios, hazlo desde el panel de WordPress.
        </p>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {/* Paginación Superior */}
        {filteredUsuarios.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={filteredUsuarios.length}
            onItemsPerPageChange={handleItemsPerPageChange}
            position="top"
          />
        )}

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Correo Electrónico
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Rol
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
              {filteredUsuarios.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    {searchTerm ? 'No se encontraron usuarios con ese criterio' : 'No hay usuarios registrados'}
                  </td>
                </tr>
              ) : (
                paginatedData.map((usuario) => (
                  <tr 
                    key={usuario.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {usuario.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {usuario.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="badge-info">
                        {usuario.rol}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {editingUser === usuario.id ? (
                        <div className="flex items-center gap-2">
                          <div className="min-w-[200px]">
                            <SearchableSelect
                              options={[
                                { value: '', label: 'Sin asignar' },
                                ...departamentos.map((depto) => ({
                                  value: String(depto.id || depto.codigo),
                                  label: depto.departamento
                                }))
                              ]}
                              value={String(selectedDepartamento)}
                              onChange={(value) => {
                                console.log('Departamento seleccionado:', value)
                                setSelectedDepartamento(value)
                              }}
                              placeholder="Seleccionar departamento"
                              searchPlaceholder="Buscar departamento..."
                              className="py-1 text-sm"
                            />
                          </div>
                          <button
                            onClick={() => handleSaveDepartamento(usuario.id)}
                            className="p-1 text-green-600 hover:text-green-700 dark:text-green-400"
                            title="Guardar"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setEditingUser(null)}
                            className="p-1 text-red-600 hover:text-red-700 dark:text-red-400"
                            title="Cancelar"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        usuario.sum_departamentos?.departamento || (
                          <span className="text-gray-400 dark:text-gray-500 italic">Sin asignar</span>
                        )
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {changingPassword === usuario.id ? (
                        <div className="flex items-center justify-center gap-2">
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Nueva contraseña"
                            className="input-field py-1 text-sm w-40"
                            minLength="6"
                          />
                          <button
                            onClick={() => handleSavePassword(usuario.id)}
                            className="p-1 text-green-600 hover:text-green-700 dark:text-green-400"
                            title="Guardar"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => {
                              setChangingPassword(null)
                              setNewPassword('')
                            }}
                            className="p-1 text-red-600 hover:text-red-700 dark:text-red-400"
                            title="Cancelar"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditDepartamento(usuario)}
                            className="p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Editar departamento"
                            disabled={editingUser !== null}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleChangePassword(usuario)}
                            className="p-2 text-amber-600 hover:text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                            title="Cambiar contraseña"
                            disabled={changingPassword !== null}
                          >
                            <Key className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación Inferior */}
        {filteredUsuarios.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={filteredUsuarios.length}
            onItemsPerPageChange={handleItemsPerPageChange}
            position="bottom"
          />
        )}
      </div>
    </div>
  )
}

export default Usuarios

