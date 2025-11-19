/**
 * Sistema de Autenticación para MySQL
 * Reemplaza Supabase Auth cuando se usa MySQL
 */

import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from './databaseAdapter'
import { buildJoinQuery } from './databaseAdapter'

const JWT_SECRET = import.meta.env.VITE_JWT_SECRET || 'tu-secret-key-cambiar-en-produccion'
const JWT_EXPIRES_IN = '7d'

/**
 * Hashea una contraseña
 */
export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10)
}

/**
 * Verifica una contraseña
 */
export const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash)
}

/**
 * Genera un token JWT
 */
export const generateToken = (userId, email) => {
  return jwt.sign(
    { userId, email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )
}

/**
 * Verifica un token JWT
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

/**
 * Login de usuario
 */
export const loginMySQL = async (usernameOrEmail, password) => {
  try {
    // Buscar usuario por email o username
    let userData = null
    
    if (usernameOrEmail.includes('@')) {
      // Buscar por email
      userData = await db.from('sum_usuarios_departamentos').findOne({ email: usernameOrEmail })
    } else {
      // Buscar por username
      userData = await db.from('sum_usuarios_departamentos').findOne({ username: usernameOrEmail })
    }
    
    if (!userData) {
      return {
        success: false,
        message: 'Usuario no encontrado'
      }
    }
    
    // Obtener el usuario de la tabla usuarios
    const usuario = await db.from('usuarios').findOne({ id: userData.user_id })
    
    if (!usuario) {
      return {
        success: false,
        message: 'Usuario no encontrado en el sistema de autenticación'
      }
    }
    
    // Verificar contraseña
    const passwordValid = await verifyPassword(password, usuario.password_hash)
    
    if (!passwordValid) {
      return {
        success: false,
        message: 'Contraseña incorrecta'
      }
    }
    
    // Generar token
    const token = generateToken(usuario.id, usuario.email)
    
    // Obtener información completa del usuario con joins
    const userInfo = await buildJoinQuery(
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
      { id: userData.id }
    )
    
    const userInfoData = userInfo[0] || userData
    const rolBD = userInfoData?.sum_roles?.nombre || 'Usuario'
    
    const sessionData = {
      user: {
        id: usuario.id,
        email: usuario.email
      },
      access_token: token,
      expires_at: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 días
    }
    
    const userDataResponse = {
      id: usuario.id,
      email: usuario.email,
      username: userInfoData?.username || usuario.email.split('@')[0],
      nombre_completo: userInfoData?.nombre_completo || userInfoData?.username || usuario.email.split('@')[0],
      rol: rolBD,
      roles: [rolBD],
      perfil: rolBD,
      departamento_id: userInfoData?.departamento_id || null,
      departamento: userInfoData?.sum_departamentos?.departamento || null,
      display_name: userInfoData?.nombre_completo || userInfoData?.username || usuario.email.split('@')[0]
    }
    
    localStorage.setItem('indrhi_user', JSON.stringify(userDataResponse))
    localStorage.setItem('indrhi_session', JSON.stringify(sessionData))
    
    return {
      success: true,
      user: userDataResponse
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
    const tokenData = verifyToken(session.access_token)
    
    if (!tokenData) return null
    
    const usuario = await db.from('usuarios').findOne({ id: tokenData.userId })
    return usuario
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

