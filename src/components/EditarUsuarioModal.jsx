import { useState, useEffect } from 'react'
import { X, User, AlertCircle, Check } from 'lucide-react'
import { crmService } from '../services/crmService'
import SearchableSelect from './SearchableSelect'

const EditarUsuarioModal = ({ onClose, usuario, onSuccess }) => {
  const [formData, setFormData] = useState({
    nombre_completo: '',
    rol_id: '',
    departamento_id: ''
  })
  const [departamentos, setDepartamentos] = useState([])
  const [roles, setRoles] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (usuario) {
      setFormData({
        nombre_completo: usuario.nombre_completo || '',
        rol_id: usuario.rol_id ? String(usuario.rol_id) : '',
        departamento_id: usuario.departamento_id ? String(usuario.departamento_id) : ''
      })
    }
  }, [usuario])

  const loadData = async () => {
    try {
      const [deptosResult, rolesResult] = await Promise.all([
        crmService.getDepartamentos(1, 10000, ''),
        crmService.getRoles()
      ])

      if (deptosResult.success) {
        setDepartamentos(deptosResult.data)
      }

      if (rolesResult.success) {
        setRoles(rolesResult.data)
      }
    } catch (error) {
      console.error('Error al cargar datos:', error)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSelectChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Actualizar nombre completo
      if (formData.nombre_completo !== (usuario.nombre_completo || '')) {
        const nombreResult = await crmService.updateUsuarioNombreCompleto(
          usuario.id,
          formData.nombre_completo
        )
        if (!nombreResult.success) {
          setError(nombreResult.message || 'Error al actualizar nombre completo')
          setLoading(false)
          return
        }
      }

      // Actualizar rol
      const rolId = formData.rol_id === '' ? null : parseInt(formData.rol_id)
      if (rolId !== (usuario.rol_id || null)) {
        const rolResult = await crmService.updateUsuarioRol(usuario.id, rolId)
        if (!rolResult.success) {
          setError(rolResult.message || 'Error al actualizar rol')
          setLoading(false)
          return
        }
      }

      // Actualizar departamento
      const deptoId = formData.departamento_id === '' ? null : parseInt(formData.departamento_id)
      if (deptoId !== (usuario.departamento_id || null)) {
        const deptoResult = await crmService.updateUsuarioDepartamento(usuario.id, deptoId)
        if (!deptoResult.success) {
          setError(deptoResult.message || 'Error al actualizar departamento')
          setLoading(false)
          return
        }
      }

      setSuccess(true)
      setTimeout(() => {
        if (onSuccess) onSuccess()
        onClose()
      }, 1500)
    } catch (err) {
      setError('Error al actualizar usuario')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Editar Usuario
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Mensajes */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              <p className="text-sm text-green-700 dark:text-green-400">
                Usuario actualizado correctamente
              </p>
            </div>
          )}

          {/* Información del usuario (solo lectura) */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-2">
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Usuario
              </label>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                {usuario?.username}
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Correo Electrónico
              </label>
              <p className="text-sm text-gray-900 dark:text-white mt-1">
                {usuario?.email}
              </p>
            </div>
          </div>

          {/* Nombre Completo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre Completo
            </label>
            <input
              type="text"
              name="nombre_completo"
              value={formData.nombre_completo}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Ingrese el nombre completo"
              disabled={loading || success}
            />
          </div>

          {/* Rol */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Rol
            </label>
            <SearchableSelect
              options={[
                { value: '', label: 'Sin asignar' },
                ...roles.map((rol) => ({
                  value: String(rol.id),
                  label: rol.nombre
                }))
              ]}
              value={formData.rol_id}
              onChange={(value) => handleSelectChange('rol_id', value)}
              placeholder="Seleccionar rol"
              searchPlaceholder="Buscar rol..."
              disabled={loading || success}
            />
          </div>

          {/* Departamento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Departamento
            </label>
            <SearchableSelect
              options={[
                { value: '', label: 'Sin asignar' },
                ...departamentos.map((depto) => ({
                  value: String(depto.id || depto.codigo),
                  label: depto.departamento
                }))
              ]}
              value={formData.departamento_id}
              onChange={(value) => handleSelectChange('departamento_id', value)}
              placeholder="Seleccionar departamento"
              searchPlaceholder="Buscar departamento..."
              disabled={loading || success}
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || success}
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditarUsuarioModal

