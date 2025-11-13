import { Navigate } from 'react-router-dom'
import { authService } from '../services/authService'

/**
 * Componente de protección de rutas basado en roles
 * 
 * @param {Array<string>} roles - Lista de roles permitidos para acceder a la ruta
 * @param {React.ReactNode} children - Componente hijo que se renderizará si el usuario tiene permiso
 * @param {string} redirectTo - Ruta a la que redirigir si no tiene permiso (por defecto '/dashboard')
 * 
 * Uso:
 * <RequireRole roles={['Administrador']}>
 *   <ComponenteProtegido />
 * </RequireRole>
 */
const RequireRole = ({ roles, children, redirectTo = '/dashboard' }) => {
  const user = authService.getCurrentUser()

  // Si no hay usuario autenticado, redirigir al login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Si no se especifican roles, permitir acceso (solo requiere estar autenticado)
  if (!roles || roles.length === 0) {
    return children
  }

  // Verificar si el usuario tiene alguno de los roles permitidos
  const userRoles = user.roles || []
  const userPerfil = user.perfil || ''
  
  // Comprobar si el rol del usuario está en la lista de roles permitidos
  const hasPermission = roles.some(role => {
    // Comparación case-insensitive
    const roleLower = role.toLowerCase()
    return (
      userRoles.some(r => r.toLowerCase() === roleLower) ||
      userPerfil.toLowerCase() === roleLower ||
      userPerfil.toLowerCase().includes(roleLower)
    )
  })

  // Si no tiene permiso, redirigir
  if (!hasPermission) {
    return <Navigate to={redirectTo} replace />
  }

  // Si tiene permiso, renderizar el componente
  return children
}

/**
 * Hook personalizado para verificar permisos de manera programática
 * 
 * Uso:
 * const { hasRole, isAuthenticated } = useRole()
 * if (hasRole(['Administrador'])) {
 *   // hacer algo
 * }
 */
export const useRole = () => {
  const user = authService.getCurrentUser()

  const hasRole = (roles) => {
    if (!user) return false
    if (!roles || roles.length === 0) return true

    const userRoles = user.roles || []
    const userPerfil = user.perfil || ''
    
    return roles.some(role => {
      const roleLower = role.toLowerCase()
      return (
        userRoles.some(r => r.toLowerCase() === roleLower) ||
        userPerfil.toLowerCase() === roleLower ||
        userPerfil.toLowerCase().includes(roleLower)
      )
    })
  }

  return {
    user,
    hasRole,
    isAuthenticated: !!user,
    roles: user?.roles || [],
    perfil: user?.perfil || ''
  }
}

export default RequireRole

