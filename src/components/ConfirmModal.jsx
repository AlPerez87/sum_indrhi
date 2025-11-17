import { useState, useEffect } from 'react'
import { X, AlertTriangle, Loader2 } from 'lucide-react'

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirmar', cancelText = 'Cancelar', type = 'danger' }) => {
  const [isProcessing, setIsProcessing] = useState(false)

  // Resetear estado cuando el modal se cierra
  useEffect(() => {
    if (!isOpen) {
      setIsProcessing(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const bgColor = type === 'danger' 
    ? 'bg-red-600 hover:bg-red-700' 
    : 'bg-primary-600 hover:bg-primary-700'

  const handleConfirm = async () => {
    if (isProcessing) return
    
    setIsProcessing(true)
    try {
      // Si onConfirm retorna una promesa, esperarla
      const result = onConfirm()
      if (result && typeof result.then === 'function') {
        await result
      }
      // Solo cerrar después de que la operación termine
      onClose()
    } catch (error) {
      console.error('Error en confirmación:', error)
      // No cerrar el modal si hay un error, para que el usuario pueda ver el error
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              type === 'danger' 
                ? 'bg-red-100 dark:bg-red-900' 
                : 'bg-primary-100 dark:bg-primary-900'
            }`}>
              <AlertTriangle className={`w-5 h-5 ${
                type === 'danger' 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-primary-600 dark:text-primary-400'
              }`} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {title || 'Confirmar acción'}
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-700 dark:text-gray-300">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isProcessing}
            className={`flex-1 px-4 py-2.5 text-white rounded-lg transition-colors flex items-center justify-center gap-2 ${bgColor} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal

