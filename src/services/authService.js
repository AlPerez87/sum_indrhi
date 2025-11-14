import { supabase } from '../lib/supabaseClient'

export const authService = {
  login: async (usernameOrEmail, password) => {
    try {
      // Intentar login con email (Supabase requiere email)
      // Si el usuario proporciona username, primero buscar el email
      let email = usernameOrEmail

      // Si no parece un email, buscar en usuarios_departamentos
      if (!usernameOrEmail.includes('@')) {
        const { data: userData, error: userError } = await supabase
          .from('sum_usuarios_departamentos')
          .select('email')
          .eq('username', usernameOrEmail)
          .single()

        if (userError || !userData) {
          return {
            success: false,
            message: 'Usuario no encontrado'
          }
        }
        email = userData.email
      }

      // Autenticar con Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        return {
          success: false,
          message: error.message || 'Error en la autenticación'
        }
      }

      // Obtener información adicional del usuario desde la tabla usuarios_departamentos
      const { data: userInfo, error: userInfoError } = await supabase
        .from('sum_usuarios_departamentos')
        .select(`
          *,
          sum_departamentos:departamento_id (
            id,
            codigo,
            departamento
          )
        `)
        .eq('email', email)
        .single()

      // Mapear roles de la BD al formato del frontend
      const rolMapping = {
        'Administrator': 'Administrador',
        'Director': 'Director',
        'Encargado de suministro': 'Encargado de suministro',
        'Usuario': 'Usuario',
        'Departamento_administrativo': 'Usuario'
      }

      const rolBD = userInfo?.rol || 'Usuario'
      const rolFrontend = rolMapping[rolBD] || rolBD

      const userData = {
        id: data.user.id,
        email: data.user.email,
        username: userInfo?.username || email.split('@')[0],
        rol: rolFrontend, // Mantener para compatibilidad
        roles: [rolFrontend], // Array para RequireRole
        perfil: rolFrontend, // Para RequireRole
        departamento_id: userInfo?.departamento_id || null,
        departamento: userInfo?.sum_departamentos?.departamento || null,
        display_name: userInfo?.username || email.split('@')[0]
      }

      localStorage.setItem('indrhi_user', JSON.stringify(userData))
      localStorage.setItem('indrhi_session', JSON.stringify(data.session))
      
      return {
        success: true,
        user: userData
      }
    } catch (error) {
      console.error('Error de login:', error)
      return {
        success: false,
        message: error.message || 'Error al conectar con el servidor'
      }
    }
  },

  validateToken: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        // Limpiar datos locales si el token es inválido
        localStorage.removeItem('indrhi_user')
        localStorage.removeItem('indrhi_session')
        return false
      }

      // Actualizar información del usuario si la sesión es válida
      const userStr = localStorage.getItem('indrhi_user')
      if (userStr) {
        const currentUser = JSON.parse(userStr)
        // Si el usuario existe pero no tiene roles, recargar desde la BD
        if (!currentUser.roles || currentUser.roles.length === 0) {
          const { data: userInfo } = await supabase
            .from('sum_usuarios_departamentos')
            .select(`
              *,
              sum_departamentos:departamento_id (
                id,
                codigo,
                departamento
              )
            `)
            .eq('email', user.email)
            .single()

          if (userInfo) {
            const rolMapping = {
              'Administrator': 'Administrador',
              'Director': 'Director',
              'Encargado de suministro': 'Encargado de suministro',
              'Usuario': 'Usuario',
              'Departamento_administrativo': 'Usuario'
            }
            const rolBD = userInfo.rol || 'Usuario'
            const rolFrontend = rolMapping[rolBD] || rolBD

            const updatedUser = {
              ...currentUser,
              rol: rolFrontend,
              roles: [rolFrontend],
              perfil: rolFrontend,
              departamento_id: userInfo.departamento_id,
              departamento: userInfo.sum_departamentos?.departamento || null
            }
            localStorage.setItem('indrhi_user', JSON.stringify(updatedUser))
          }
        }
      }

      return true
    } catch (error) {
      console.error('Error validando token:', error)
      return false
    }
  },

  logout: async () => {
    try {
      await supabase.auth.signOut()
      localStorage.removeItem('indrhi_user')
      localStorage.removeItem('indrhi_session')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      // Limpiar localStorage incluso si hay error
      localStorage.removeItem('indrhi_user')
      localStorage.removeItem('indrhi_session')
    }
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('indrhi_user')
    return userStr ? JSON.parse(userStr) : null
  },

  isAuthenticated: () => {
    const userStr = localStorage.getItem('indrhi_user')
    const sessionStr = localStorage.getItem('indrhi_session')
    return !!(userStr && sessionStr)
  },

  // Método para obtener el token de sesión actual
  getSession: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      return session
    } catch (error) {
      console.error('Error obteniendo sesión:', error)
      return null
    }
  }
}
