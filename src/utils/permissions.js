/**
 * Utilidades para verificar permisos según roles
 */

/**
 * Obtiene el rol actual del usuario
 */
export const getUserRole = (user) => {
  if (!user) return null
  
  // Priorizar roles del array, luego perfil, luego rol individual
  const userRoles = user.roles || []
  const userPerfil = user.perfil || ''
  const userRol = user.rol || ''
  
  // Retornar el primer rol disponible
  if (userRoles.length > 0) {
    return userRoles[0]
  }
  if (userPerfil) {
    return userPerfil
  }
  if (userRol) {
    return userRol
  }
  
  return null
}

/**
 * Verifica si el usuario tiene alguno de los roles especificados
 */
export const hasRole = (user, roles) => {
  if (!user || !roles || roles.length === 0) return false
  
  const userRole = getUserRole(user)
  if (!userRole) return false
  
  const userRoleLower = userRole.toLowerCase()
  
  return roles.some(role => {
    const roleLower = role.toLowerCase()
    return userRoleLower === roleLower || userRoleLower.includes(roleLower)
  })
}

/**
 * Verifica si el usuario puede acceder a una ruta específica
 */
export const canAccessRoute = (user, route) => {
  if (!user) return false
  
  const userRole = getUserRole(user)
  if (!userRole) return false
  
  const roleLower = userRole.toLowerCase()
  
  // Administrador tiene acceso a todo
  if (roleLower === 'administrador') {
    return true
  }
  
  // Mapeo de rutas a roles permitidos
  const routePermissions = {
    '/dashboard': ['Administrador', 'Encargado de Suministro', 'Suministro'],
    '/solicitud-articulos': ['Administrador', 'Departamento'],
    '/autorizar-solicitudes': ['Administrador', 'Dirección Administrativa'],
    '/solicitudes-aprobadas': ['Administrador', 'Encargado de Suministro', 'Suministro'],
    '/solicitudes-gestionadas': ['Administrador', 'Encargado de Suministro', 'Suministro'],
    '/solicitudes-despachadas': ['Administrador', 'Encargado de Suministro', 'Suministro'],
    '/articulos': ['Administrador', 'Encargado de Suministro', 'Suministro'],
    '/entrada-mercancia': ['Administrador', 'Encargado de Suministro', 'Suministro'],
    '/departamentos': ['Administrador'],
    '/usuarios': ['Administrador']
  }
  
  const allowedRoles = routePermissions[route] || []
  return hasRole(user, allowedRoles)
}

/**
 * Filtra los elementos del menú según los permisos del usuario
 */
export const filterMenuItems = (menuItems, user) => {
  if (!user) return []
  
  const userRole = getUserRole(user)
  if (!userRole) return []
  
  const roleLower = userRole.toLowerCase()
  
  // Administrador ve todo
  if (roleLower === 'administrador') {
    return menuItems
  }
  
  // Filtrar elementos según el rol
  return menuItems.filter(item => {
    // Si el item tiene submenu, filtrar también el submenu
    if (item.submenu) {
      const filteredSubmenu = item.submenu.filter(subitem => {
        return canAccessRoute(user, subitem.path)
      })
      
      // Si el submenu tiene elementos, incluir el item padre
      return filteredSubmenu.length > 0
    }
    
    // Verificar acceso al item individual
    return canAccessRoute(user, item.path)
  }).map(item => {
    // Si tiene submenu, filtrar los elementos del submenu
    if (item.submenu) {
      return {
        ...item,
        submenu: item.submenu.filter(subitem => canAccessRoute(user, subitem.path))
      }
    }
    return item
  })
}

