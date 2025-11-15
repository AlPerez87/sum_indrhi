import { Navigate } from 'react-router-dom'
import { authService } from '../services/authService'
import { getUserRole } from '../utils/permissions'

/**
 * Componente que protege la ruta del dashboard y redirige según el rol
 */
const ProtectedDashboard = ({ children }) => {
  const user = authService.getCurrentUser()
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  const userRole = getUserRole(user)
  const roleLower = userRole?.toLowerCase() || ''
  
  // Dirección Administrativa no tiene acceso al dashboard, redirigir a Autorizar Solicitudes
  if (roleLower === 'dirección administrativa' || roleLower.includes('dirección administrativa')) {
    return <Navigate to="/autorizar-solicitudes" replace />
  }
  
  // Departamento no tiene acceso al dashboard, redirigir a Solicitud de Artículos
  if (roleLower === 'departamento') {
    return <Navigate to="/solicitud-articulos" replace />
  }
  
  return children
}

export default ProtectedDashboard

