import { Navigate } from 'react-router-dom'
import { authService } from '../services/authService'
import { getUserRole } from '../utils/permissions'

/**
 * Componente que redirige al usuario a la ruta apropiada según su rol
 */
const RedirectByRole = () => {
  const user = authService.getCurrentUser()
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  const userRole = getUserRole(user)
  const roleLower = userRole?.toLowerCase() || ''
  
  // Dirección Administrativa va directamente a Autorizar Solicitudes
  if (roleLower === 'dirección administrativa' || roleLower.includes('dirección administrativa')) {
    return <Navigate to="/autorizar-solicitudes" replace />
  }
  
  // Departamento va directamente a Solicitud de Artículos
  if (roleLower === 'departamento') {
    return <Navigate to="/solicitud-articulos" replace />
  }
  
  // Otros roles (Administrador, Encargado de Suministro, Suministro) van al dashboard
  return <Navigate to="/dashboard" replace />
}

export default RedirectByRole

