import { useState } from 'react'

export const useConfirmDialog = () => {
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    showCancel: true,
    onConfirm: () => {}
  })

  const showConfirm = ({
    title = '¿Está seguro?',
    message = '',
    type = 'warning',
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    showCancel = true
  }) => {
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        title,
        message,
        type,
        confirmText,
        cancelText,
        showCancel,
        onConfirm: () => {
          resolve(true)
          setDialogState(prev => ({ ...prev, isOpen: false }))
        }
      })
    })
  }

  const showAlert = ({
    title = 'Información',
    message = '',
    type = 'info',
    confirmText = 'Aceptar'
  }) => {
    return showConfirm({
      title,
      message,
      type,
      confirmText,
      showCancel: false
    })
  }

  const closeDialog = () => {
    setDialogState(prev => ({ ...prev, isOpen: false }))
  }

  return {
    dialogState,
    showConfirm,
    showAlert,
    closeDialog
  }
}

