import { useState } from 'react'
import { X, Lock, Eye, EyeOff, AlertCircle, Check } from 'lucide-react'
import { crmService } from '../services/crmService'

const CambiarPasswordAdminModal = ({ onClose, usuario, onSuccess }) => {
  const [formData, setFormData] = useState({
    new_password: '',
    confirm_password: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const toggleShowPassword = (field) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field]
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validaciones
    if (!formData.new_password || !formData.confirm_password) {
      setError('Todos los campos son requeridos')
      return
    }

    if (formData.new_password.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres')
      return
    }

    if (formData.new_password !== formData.confirm_password) {
      setError('Las contraseñas no coinciden')
      return
    }

    setLoading(true)

    try {
      const result = await crmService.updateUsuarioPassword(
        usuario.id,
        formData.new_password
      )

      if (result.success) {
        setSuccess(true)
        setFormData({
          new_password: '',
          confirm_password: ''
        })
        setTimeout(() => {
          if (onSuccess) onSuccess()
          onClose()
        }, 1500)
      } else {
        setError(result.message || 'Error al cambiar la contraseña')
      }
    } catch (err) {
      setError('Error al cambiar la contraseña')
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
              <Lock className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Cambiar Contraseña
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
          {/* Información del usuario */}
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
                Contraseña actualizada correctamente
              </p>
            </div>
          )}

          {/* Nueva Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nueva Contraseña
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                name="new_password"
                value={formData.new_password}
                onChange={handleChange}
                className="w-full px-4 py-2.5 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Ingrese la nueva contraseña"
                disabled={loading || success}
              />
              <button
                type="button"
                onClick={() => toggleShowPassword('new')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPasswords.new ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Mínimo 6 caracteres
            </p>
          </div>

          {/* Confirmar Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirmar Nueva Contraseña
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                className="w-full px-4 py-2.5 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Confirme la nueva contraseña"
                disabled={loading || success}
              />
              <button
                type="button"
                onClick={() => toggleShowPassword('confirm')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPasswords.confirm ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
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
              {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CambiarPasswordAdminModal

