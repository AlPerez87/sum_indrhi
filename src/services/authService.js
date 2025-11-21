import { db } from '../lib/databaseAdapter'
import * as mysqlAuth from '../lib/mysqlAuth'
import { buildJoinQuery } from '../lib/databaseAdapter'

export const authService = {
  login: async (usernameOrEmail, password) => {
    try {
      // Usar autenticación MySQL
      return await mysqlAuth.loginMySQL(usernameOrEmail, password)
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
      const user = await mysqlAuth.getCurrentUserMySQL()
      if (!user) {
        localStorage.removeItem('indrhi_user')
        localStorage.removeItem('indrhi_session')
        return false
      }
      return true
    } catch (error) {
      console.error('Error validando token:', error)
      return false
    }
  },

  logout: async () => {
    try {
      return await mysqlAuth.logoutMySQL()
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
      const sessionStr = localStorage.getItem('indrhi_session')
      return sessionStr ? JSON.parse(sessionStr) : null
    } catch (error) {
      console.error('Error obteniendo sesión:', error)
      return null
    }
  }
}
