import axios from 'axios'

const API_URL = 'http://localhost/suministros.indrhi.gob.do/wp-json/indrhi/v1'

export const authService = {
  login: async (username, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, {
        username,
        password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.data.success && response.data.token) {
        localStorage.setItem('indrhi_token', response.data.token)
        localStorage.setItem('indrhi_user', JSON.stringify(response.data.user))
        return {
          success: true,
          user: response.data.user
        }
      }

      return {
        success: false,
        message: 'Error en la autenticación'
      }
    } catch (error) {
      console.error('Error de login:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Error al conectar con el servidor'
      }
    }
  },

  validateToken: async (token) => {
    try {
      const response = await axios.post(`${API_URL}/validate`, {
        token
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      return response.data.valid === true
    } catch (error) {
      console.error('Error validando token:', error)
      return false
    }
  },

  logout: () => {
    localStorage.removeItem('indrhi_token')
    localStorage.removeItem('indrhi_user')
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('indrhi_user')
    return userStr ? JSON.parse(userStr) : null
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('indrhi_token')
  }
}

