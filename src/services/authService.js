import { isSupabase, isMySQL } from '../config/database'
import { supabase } from '../lib/supabaseClient'
import { db } from '../lib/databaseAdapter'
import * as mysqlAuth from '../lib/mysqlAuth'
import { buildJoinQuery } from '../lib/databaseAdapter'

export const authService = {
  login: async (usernameOrEmail, password) => {
    try {
      // Si es MySQL, usar autenticación MySQL
      if (isMySQL()) {
        return await mysqlAuth.loginMySQL(usernameOrEmail, password)
      }
      
      // Supabase Auth (código original)
      let email = usernameOrEmail

      // Si no parece un email, buscar en usuarios_departamentos
      if (!usernameOrEmail.includes('@')) {
        const userData = await db.from('sum_usuarios_departamentos').findOne({ username: usernameOrEmail })

        if (!userData) {
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
        // Si el error es de usuario no encontrado o credenciales inválidas,
        // verificar si hay un problema de sincronización de email
        if (error.message?.includes('Invalid login credentials') || 
            error.message?.includes('Email not confirmed') ||
            error.status === 400) {
          
          // Verificar si el email existe en la tabla pero no en Auth
          const userInTable = await db.from('sum_usuarios_departamentos').findOne({ email })

          if (userInTable) {
            return {
              success: false,
              message: 'Error de autenticación: El email puede estar desincronizado entre la base de datos y el sistema de autenticación. Por favor, contacte al administrador.'
            }
          }
        }

        return {
          success: false,
          message: error.message || 'Error en la autenticación'
        }
      }

      // Obtener información adicional del usuario desde la tabla usuarios_departamentos
      let userInfo
      
      if (isSupabase()) {
        const { data: userInfoData, error: userInfoError } = await supabase
          .from('sum_usuarios_departamentos')
          .select(`
            *,
            sum_departamentos:departamento_id (
              id,
              codigo,
              departamento
            ),
            sum_roles:rol_id (
              id,
              nombre,
              descripcion
            )
          `)
          .eq('email', email)
          .single()
        
        if (userInfoError) {
          console.error('Error obteniendo información del usuario:', userInfoError)
        }
        userInfo = userInfoData
      } else {
        userInfo = await buildJoinQuery(
          'sum_usuarios_departamentos',
          [
            {
              table: 'sum_departamentos',
              foreignKey: 'departamento_id',
              on: 'id',
              columns: 'id, codigo, departamento'
            },
            {
              table: 'sum_roles',
              foreignKey: 'rol_id',
              on: 'id',
              columns: 'id, nombre, descripcion'
            }
          ],
          { email }
        )
        userInfo = userInfo[0]
      }

      // Obtener el rol desde la relación con sum_roles
      const rolBD = userInfo?.sum_roles?.nombre || userInfo?.rol || 'Usuario'
      const rolFrontend = rolBD

      const userData = {
        id: data.user.id,
        email: data.user.email,
        username: userInfo?.username || email.split('@')[0],
        nombre_completo: userInfo?.nombre_completo || userInfo?.username || email.split('@')[0],
        rol: rolFrontend,
        roles: [rolFrontend],
        perfil: rolFrontend,
        departamento_id: userInfo?.departamento_id || null,
        departamento: userInfo?.sum_departamentos?.departamento || null,
        display_name: userInfo?.nombre_completo || userInfo?.username || email.split('@')[0]
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
      if (isMySQL()) {
        const user = await mysqlAuth.getCurrentUserMySQL()
        if (!user) {
          localStorage.removeItem('indrhi_user')
          localStorage.removeItem('indrhi_session')
          return false
        }
        return true
      }
      
      // Supabase (código original)
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        localStorage.removeItem('indrhi_user')
        localStorage.removeItem('indrhi_session')
        return false
      }

      // Actualizar información del usuario si la sesión es válida
      const userStr = localStorage.getItem('indrhi_user')
      if (userStr) {
        const currentUser = JSON.parse(userStr)
        if (!currentUser.roles || currentUser.roles.length === 0) {
          const userInfo = await db.from('sum_usuarios_departamentos').findOne({ email: user.email })
          
          if (userInfo) {
            const rolBD = userInfo.sum_roles?.nombre || 'Usuario'
            const updatedUser = {
              ...currentUser,
              rol: rolBD,
              roles: [rolBD],
              perfil: rolBD,
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
      if (isMySQL()) {
        return await mysqlAuth.logoutMySQL()
      }
      
      await supabase.auth.signOut()
      localStorage.removeItem('indrhi_user')
      localStorage.removeItem('indrhi_session')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
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

  getSession: async () => {
    try {
      if (isMySQL()) {
        const sessionStr = localStorage.getItem('indrhi_session')
        return sessionStr ? JSON.parse(sessionStr) : null
      }
      
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      return session
    } catch (error) {
      console.error('Error obteniendo sesión:', error)
      return null
    }
  }
}
