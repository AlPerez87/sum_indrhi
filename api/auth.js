/**
 * API Route para autenticación MySQL
 * Maneja login, generación de tokens, y verificación de contraseñas
 */

import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { select, query, getPool } from './db.js'

const JWT_SECRET = process.env.JWT_SECRET || process.env.VITE_JWT_SECRET || 'tu-secret-key-cambiar-en-produccion'
const JWT_EXPIRES_IN = '7d'

/**
 * Genera un token JWT
 */
function generateToken(userId, email) {
  return jwt.sign(
    { userId, email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )
}

/**
 * Verifica un token JWT
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

/**
 * Verifica una contraseña
 */
async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash)
}

/**
 * Hashea una contraseña
 */
async function hashPassword(password) {
  return await bcrypt.hash(password, 10)
}

/**
 * Endpoint de login
 */
export default async function handler(req, res) {
  console.log('🔐 authHandler llamado, method:', req.method)
  
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Asegurar que el Content-Type sea JSON
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'application/json')
    }
    
    const { action, usernameOrEmail, password, token, userId, newPassword } = req.body
    
    console.log('🔐 authHandler - action:', action)
    console.log('🔐 authHandler - req.body completo:', JSON.stringify(req.body, null, 2))
    console.log('🔐 authHandler - usernameOrEmail:', usernameOrEmail)

    if (!action) {
      console.log('❌ No se recibió acción')
      return res.status(400).json({ error: 'Acción requerida', success: false })
    }

    console.log('✅ Acción recibida:', action)
    console.log('✅ Tipo de acción:', typeof action)

    switch (action) {
      case 'login':
        // Buscar usuario por email o username
        let userData = null
        
        if (usernameOrEmail.includes('@')) {
          // Buscar por email en sum_usuarios_departamentos
          const usuariosDepto = await query(
            'SELECT * FROM sum_usuarios_departamentos WHERE email = ? LIMIT 1',
            [usernameOrEmail]
          )
          userData = usuariosDepto[0] || null
        } else {
          // Buscar por username
          const usuariosDepto = await query(
            'SELECT * FROM sum_usuarios_departamentos WHERE username = ? LIMIT 1',
            [usernameOrEmail]
          )
          userData = usuariosDepto[0] || null
        }
        
        if (!userData) {
          return res.status(401).json({
            success: false,
            message: 'Usuario no encontrado'
          })
        }
        
        // Obtener el usuario de la tabla usuarios
        const usuarios = await query(
          'SELECT * FROM usuarios WHERE id = ? LIMIT 1',
          [userData.user_id]
        )
        const usuario = usuarios[0] || null
        
        if (!usuario) {
          return res.status(401).json({
            success: false,
            message: 'Usuario no encontrado en el sistema de autenticación'
          })
        }
        
        // Verificar contraseña
        const passwordValid = await verifyPassword(password, usuario.password_hash)
        
        if (!passwordValid) {
          return res.status(401).json({
            success: false,
            message: 'Contraseña incorrecta'
          })
        }
        
        // Generar token
        const token = generateToken(usuario.id, usuario.email)
        
        // Obtener información completa del usuario con joins
        const userInfoQuery = `
          SELECT 
            sud.*,
            sd.departamento,
            sr.nombre as rol_nombre,
            sr.descripcion as rol_descripcion
          FROM sum_usuarios_departamentos sud
          LEFT JOIN sum_departamentos sd ON sud.departamento_id = sd.id
          LEFT JOIN sum_roles sr ON sud.rol_id = sr.id
          WHERE sud.id = ?
          LIMIT 1
        `
        const userInfoResults = await query(userInfoQuery, [userData.id])
        const userInfoData = userInfoResults[0] || userData
        const rolBD = userInfoData?.rol_nombre || 'Usuario'
        
        const userDataResponse = {
          id: usuario.id,
          email: usuario.email,
          username: userInfoData?.username || usuario.email.split('@')[0],
          nombre_completo: userInfoData?.nombre_completo || userInfoData?.username || usuario.email.split('@')[0],
          rol: rolBD,
          roles: [rolBD],
          perfil: rolBD,
          departamento_id: userInfoData?.departamento_id || null,
          departamento: userInfoData?.departamento || null,
          display_name: userInfoData?.nombre_completo || userInfoData?.username || usuario.email.split('@')[0]
        }
        
        return res.status(200).json({
          success: true,
          user: userDataResponse,
          token,
          expires_at: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 días
        })

      case 'verify':
        // Verificar token
        if (!token) {
          return res.status(400).json({ error: 'Token requerido' })
        }
        const tokenData = verifyToken(token)
        if (!tokenData) {
          return res.status(401).json({ error: 'Token inválido' })
        }
        return res.status(200).json({ valid: true, data: tokenData })

      case 'hash':
        // Hashear contraseña (solo para uso interno)
        if (!password) {
          return res.status(400).json({ error: 'Contraseña requerida' })
        }
        const hash = await hashPassword(password)
        return res.status(200).json({ hash })

      case 'updatePassword':
        // Actualizar contraseña de usuario
        if (!userId || !newPassword) {
          return res.status(400).json({ error: 'userId y newPassword requeridos', success: false })
        }
        
        // Variable para almacenar el ID del usuario en la tabla usuarios
        let targetUserId = userId
        
        // Buscar el usuario en la tabla usuarios (no en sum_usuarios_departamentos)
        const usuarioQuery = await query(
          'SELECT id FROM usuarios WHERE id = ? LIMIT 1',
          [targetUserId]
        )
        
        if (!usuarioQuery || usuarioQuery.length === 0) {
          // Si no existe en usuarios, buscar en sum_usuarios_departamentos para obtener el user_id
          const usuarioDeptoQuery = await query(
            'SELECT user_id FROM sum_usuarios_departamentos WHERE id = ? LIMIT 1',
            [targetUserId]
          )
          
          if (!usuarioDeptoQuery || usuarioDeptoQuery.length === 0 || !usuarioDeptoQuery[0].user_id) {
            return res.status(404).json({ error: 'Usuario no encontrado', success: false })
          }
          
          targetUserId = usuarioDeptoQuery[0].user_id
        }
        
        // Hashear la nueva contraseña
        const passwordHash = await hashPassword(newPassword)
        
        // Actualizar en la tabla usuarios
        await query(
          'UPDATE usuarios SET password_hash = ? WHERE id = ?',
          [passwordHash, targetUserId]
        )
        
        return res.status(200).json({ 
          success: true, 
          message: 'Contraseña actualizada correctamente' 
        })

      case 'createUser':
        // Crear nuevo usuario
        console.log('📝 Creando usuario...')
        console.log('📝 req.body:', JSON.stringify(req.body, null, 2))
        const { email: newEmail, password: newPasswordUser, username: newUsername, nombreCompleto, departamentoId, rolId } = req.body
        
        console.log('📝 Datos extraídos:', { newEmail, newPasswordUser: '***', newUsername, nombreCompleto, departamentoId, rolId })
        
        if (!newEmail || !newPasswordUser || !newUsername) {
          console.log('❌ Faltan campos requeridos')
          return res.status(400).json({ 
            error: 'Email, contraseña y username son requeridos', 
            success: false 
          })
        }
        
        // Verificar que el email no exista
        const emailExists = await query(
          'SELECT id FROM usuarios WHERE email = ? LIMIT 1',
          [newEmail]
        )
        
        if (emailExists && emailExists.length > 0) {
          return res.status(400).json({ 
            error: 'Ya existe un usuario con este email', 
            success: false 
          })
        }
        
        // Verificar que el username no exista
        const usernameExists = await query(
          'SELECT id FROM sum_usuarios_departamentos WHERE username = ? LIMIT 1',
          [newUsername]
        )
        
        if (usernameExists && usernameExists.length > 0) {
          return res.status(400).json({ 
            error: 'Ya existe un usuario con este username', 
            success: false 
          })
        }
        
        // Hashear la contraseña
        const newPasswordHash = await hashPassword(newPasswordUser)
        
        // Crear usuario en la tabla usuarios
        const pool = getPool()
        const [insertUsuarioResult] = await pool.execute(
          'INSERT INTO usuarios (email, password_hash, email_verificado) VALUES (?, ?, ?)',
          [newEmail, newPasswordHash, true]
        )
        
        const newUserId = insertUsuarioResult.insertId
        
        // Crear registro en sum_usuarios_departamentos
        await query(
          'INSERT INTO sum_usuarios_departamentos (user_id, username, email, nombre_completo, departamento_id, rol_id) VALUES (?, ?, ?, ?, ?, ?)',
          [
            newUserId,
            newUsername,
            newEmail,
            nombreCompleto || null,
            departamentoId ? parseInt(departamentoId) : null,
            rolId ? parseInt(rolId) : null
          ]
        )
        
        return res.status(200).json({ 
          success: true, 
          message: 'Usuario creado correctamente',
          userId: newUserId
        })

      default:
        console.log('❌ Acción no reconocida:', action)
        console.log('❌ Tipo:', typeof action)
        console.log('❌ Acciones válidas: login, verify, hash, updatePassword, createUser')
        return res.status(400).json({ error: `Acción no válida: ${action}` })
    }
  } catch (error) {
    console.error('Error en API de autenticación:', error)
    return res.status(500).json({ error: error.message })
  }
}

