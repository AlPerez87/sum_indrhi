import { X, AlertTriangle, Info, CheckCircle } from 'lucide-react'

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = '¿Está seguro?',
  message,
  type = 'warning', // 'warning', 'danger', 'info', 'success'
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  showCancel = true
}) => {
  if (!isOpen) return null

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: AlertTriangle,
          iconBg: 'bg-red-100 dark:bg-red-900/30',
          iconColor: 'text-red-600 dark:text-red-400',
          buttonClass: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
        }
      case 'warning':
        return {
          icon: AlertTriangle,
          iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
          iconColor: 'text-yellow-600 dark:text-yellow-400',
          buttonClass: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
        }
      case 'success':
        return {
          icon: CheckCircle,
          iconBg: 'bg-green-100 dark:bg-green-900/30',
          iconColor: 'text-green-600 dark:text-green-400',
          buttonClass: 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
        }
      default:
        return {
          icon: Info,
          iconBg: 'bg-blue-100 dark:bg-blue-900/30',
          iconColor: 'text-blue-600 dark:text-blue-400',
          buttonClass: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
        }
    }
  }

  const typeConfig = getTypeStyles()
  const IconComponent = typeConfig.icon

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-4 p-6">
          <div className={`flex-shrink-0 w-12 h-12 rounded-full ${typeConfig.iconBg} flex items-center justify-center`}>
            <IconComponent className={`w-6 h-6 ${typeConfig.iconColor}`} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              {title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {message}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 dark:bg-gray-900/50 rounded-b-xl">
          {showCancel && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${typeConfig.buttonClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog

