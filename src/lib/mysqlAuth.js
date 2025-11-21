/**
 * Sistema de Autenticación para MySQL
 * Reemplaza Supabase Auth cuando se usa MySQL
 */

/**
 * Sistema de Autenticación para MySQL
 * Reemplaza Supabase Auth cuando se usa MySQL
 * 
 * Las operaciones de autenticación ahora se hacen en el servidor
 * a través de la API /api/auth
 */

// Constantes
const API_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:3000' 
  : (import.meta.env.VITE_API_URL || '')

/**
 * Hashea una contraseña (llama al servidor)
 */
export const hashPassword = async (password) => {
  const response = await fetch(`${API_BASE_URL}/api/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'hash', password })
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error)
  return data.hash
}

/**
 * Verifica una contraseña (se hace en el servidor durante login)
 */
export const verifyPassword = async (password, hash) => {
  // Esta función ya no se usa directamente desde el cliente
  // La verificación se hace en el servidor durante el login
  throw new Error('verifyPassword debe llamarse desde el servidor')
}

/**
 * Genera un token JWT (se hace en el servidor durante login)
 */
export const generateToken = async (userId, email) => {
  // Esta función ya no se usa directamente desde el cliente
  // El token se genera en el servidor durante el login
  throw new Error('generateToken debe llamarse desde el servidor')
}

/**
 * Verifica un token JWT
 */
export const verifyToken = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'verify', token })
    })
    const data = await response.json()
    if (!response.ok) return null
    return data.data
  } catch (error) {
    return null
  }
}

/**
 * Login de usuario (ahora usa el servidor)
 */
export const loginMySQL = async (usernameOrEmail, password) => {
  try {
    const url = `${API_BASE_URL}/api/auth`
    console.log('🔐 Login request to:', url)
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'login',
        usernameOrEmail,
        password
      })
    })
    
    console.log('📥 Login response status:', response.status, response.statusText)
    console.log('📥 Login response headers:', response.headers.get('content-type'))
    
    // Verificar que la respuesta sea JSON
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text()
      console.error('❌ Respuesta no es JSON:', text.substring(0, 200))
      
      // Mensaje de error más claro
      if (response.status === 404) {
        throw new Error('El endpoint /api/auth no existe. ¿Está el servidor Express corriendo en el puerto 3000?')
      } else if (response.status >= 500) {
        throw new Error(`Error del servidor (${response.status}). Revisa los logs del servidor Express.`)
      } else {
        throw new Error(`El servidor respondió con ${contentType || 'text/html'}. ¿Está el servidor Express corriendo en http://localhost:3000?`)
      }
    }
    
    let data
    try {
      data = await response.json()
    } catch (parseError) {
      const text = await response.text()
      console.error('❌ Error parseando JSON:', text.substring(0, 200))
      throw new Error(`El servidor no respondió con JSON válido. Respuesta: ${text.substring(0, 100)}`)
    }
    
    if (!response.ok || !data.success) {
      return {
        success: false,
        message: data.message || 'Error al iniciar sesión'
      }
    }
    
    // Guardar en localStorage
    const sessionData = {
      user: {
        id: data.user.id,
        email: data.user.email
      },
      access_token: data.token,
      expires_at: data.expires_at
    }
    
    localStorage.setItem('indrhi_user', JSON.stringify(data.user))
    localStorage.setItem('indrhi_session', JSON.stringify(sessionData))
    
    return {
      success: true,
      user: data.user
    }
  } catch (error) {
    console.error('Error en loginMySQL:', error)
    return {
      success: false,
      message: error.message || 'Error al iniciar sesión'
    }
  }
}

/**
 * Obtiene el usuario actual desde el token
 */
export const getCurrentUserMySQL = async () => {
  try {
    const sessionStr = localStorage.getItem('indrhi_session')
    if (!sessionStr) return null
    
    const session = JSON.parse(sessionStr)
    const tokenData = await verifyToken(session.access_token)
    
    if (!tokenData) return null
    
    // Obtener usuario desde localStorage (ya está guardado)
    const userStr = localStorage.getItem('indrhi_user')
    if (userStr) {
      return JSON.parse(userStr)
    }
    
    return null
  } catch (error) {
    console.error('Error obteniendo usuario actual:', error)
    return null
  }
}

/**
 * Cierra sesión
 */
export const logoutMySQL = async () => {
  localStorage.removeItem('indrhi_user')
  localStorage.removeItem('indrhi_session')
  return { success: true }
}

/**
 * Actualiza la contraseña de un usuario
 */
export const updatePasswordMySQL = async (userId, newPassword) => {
  try {
    const passwordHash = await hashPassword(newPassword)
    await db.from('usuarios').update(userId, { password_hash: passwordHash })
    return { success: true }
  } catch (error) {
    console.error('Error actualizando contraseña:', error)
    return { success: false, message: error.message }
  }
}

