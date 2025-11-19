/**
 * Script de Migración de Datos de Supabase a MySQL
 * 
 * Uso:
 * node scripts/migrate-data-to-mysql.js
 * 
 * Requiere:
 * - Variables de entorno configuradas para Supabase y MySQL
 * - Base de datos MySQL creada y vacía
 */

import { createClient } from '@supabase/supabase-js'
import mysql from 'mysql2/promise'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

// Cargar variables de entorno
dotenv.config()

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY
// Intentar usar service role key si está disponible (bypass RLS)
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

const MYSQL_CONFIG = {
  host: process.env.VITE_MYSQL_HOST || 'localhost',
  port: parseInt(process.env.VITE_MYSQL_PORT || '3306'),
  user: process.env.VITE_MYSQL_USER || 'root',
  password: process.env.VITE_MYSQL_PASSWORD || '',
  database: process.env.VITE_MYSQL_DATABASE || 'sum_indrhi',
}

// Inicializar cliente de Supabase
// Usar service role key si está disponible para bypass RLS
const supabaseKey = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY
const supabase = createClient(SUPABASE_URL, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

if (SUPABASE_SERVICE_ROLE_KEY) {
  console.log('✅ Usando SERVICE_ROLE_KEY (bypass RLS)')
} else {
  console.log('⚠️  Usando ANON_KEY (puede tener limitaciones por RLS)')
  console.log('   Para migrar todos los datos, configura VITE_SUPABASE_SERVICE_ROLE_KEY en .env')
}

let mysqlConnection = null

// Mapeo de UUIDs de Supabase a IDs numéricos de MySQL
const uuidToIdMap = new Map()

/**
 * Conecta a MySQL
 */
async function connectMySQL() {
  mysqlConnection = await mysql.createConnection(MYSQL_CONFIG)
  console.log('✅ Conectado a MySQL')
}

/**
 * Cierra la conexión a MySQL
 */
async function closeMySQL() {
  if (mysqlConnection) {
    await mysqlConnection.end()
    console.log('✅ Conexión MySQL cerrada')
  }
}

/**
 * Migra usuarios desde Supabase Auth a MySQL
 * Crea un mapeo UUID -> ID numérico
 */
async function migrateUsers() {
  console.log('\n📦 Migrando usuarios...')
  
  // Obtener usuarios desde sum_usuarios_departamentos
  const { data: usuariosDepto, error } = await supabase
    .from('sum_usuarios_departamentos')
    .select('user_id, email, username')
  
  if (error) {
    console.error('Error obteniendo usuarios:', error)
    return
  }
  
  console.log(`   Encontrados ${usuariosDepto.length} usuarios`)
  
  let userIdCounter = 1
  
  for (const usuarioDepto of usuariosDepto) {
    if (!usuarioDepto.user_id) continue
    
    // Crear contraseña temporal para todos los usuarios
    const passwordHash = await bcrypt.hash('TempPassword123!', 10)
    
    try {
      // Insertar usuario con ID numérico secuencial
      const [result] = await mysqlConnection.execute(
        `INSERT INTO usuarios (email, password_hash, email_verificado) 
         VALUES (?, ?, ?)`,
        [usuarioDepto.email, passwordHash, true]
      )
      
      const mysqlUserId = result.insertId
      
      // Guardar mapeo UUID -> ID numérico
      uuidToIdMap.set(usuarioDepto.user_id, mysqlUserId)
      
      console.log(`   ✅ Usuario migrado: ${usuarioDepto.email} (UUID: ${usuarioDepto.user_id} -> ID: ${mysqlUserId})`)
      userIdCounter++
    } catch (err) {
      // Si el usuario ya existe, obtener su ID
      if (err.code === 'ER_DUP_ENTRY') {
        const [existing] = await mysqlConnection.execute(
          'SELECT id FROM usuarios WHERE email = ?',
          [usuarioDepto.email]
        )
        if (existing.length > 0) {
          uuidToIdMap.set(usuarioDepto.user_id, existing[0].id)
          console.log(`   ⚠️  Usuario ya existe: ${usuarioDepto.email} (ID: ${existing[0].id})`)
        }
      } else {
        console.error(`   ❌ Error migrando usuario ${usuarioDepto.email}:`, err.message)
      }
    }
  }
  
  console.log(`   ✅ Mapeo creado: ${uuidToIdMap.size} usuarios`)
}

/**
 * Migra una tabla genérica
 */
async function migrateTable(tableName, transformFn = null) {
  console.log(`\n📦 Migrando tabla: ${tableName}...`)
  
  const { data, error } = await supabase.from(tableName).select('*')
  
  if (error) {
    console.error(`   ❌ Error obteniendo datos de ${tableName}:`, error)
    return
  }
  
  console.log(`   Encontrados ${data.length} registros`)
  
  if (data.length === 0) {
    console.log(`   ⚠️  Tabla vacía, saltando...`)
    return
  }
  
  let successCount = 0
  let errorCount = 0
  
  for (const row of data) {
    try {
      // Transformar datos si es necesario
      const transformedRow = transformFn ? transformFn(row) : { ...row }
      
      // Remover campos que no existen en MySQL (relaciones de Supabase)
      delete transformedRow.sum_departamentos
      delete transformedRow.sum_roles
      
      // Filtrar solo campos que tienen valor
      const keys = Object.keys(transformedRow).filter(k => {
        const value = transformedRow[k]
        return value !== null && value !== undefined && value !== ''
      })
      const values = keys.map(k => transformedRow[k])
      const placeholders = keys.map(() => '?').join(', ')
      
      // Construir query de actualización para ON DUPLICATE KEY
      const updateClause = keys.map(k => `${k} = VALUES(${k})`).join(', ')
      
      await mysqlConnection.execute(
        `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES (${placeholders})
         ON DUPLICATE KEY UPDATE ${updateClause}`,
        values
      )
      successCount++
    } catch (err) {
      errorCount++
      console.error(`   ❌ Error migrando registro ID ${row.id || 'N/A'}:`, err.message)
      if (errorCount <= 3) {
        console.error(`   Datos:`, JSON.stringify(row, null, 2).substring(0, 200))
      }
    }
  }
  
  console.log(`   ✅ Tabla ${tableName} migrada: ${successCount} exitosos, ${errorCount} errores`)
}

/**
 * Transforma user_id de UUID a INT para MySQL
 */
function transformUserId(row) {
  const transformed = { ...row }
  
  // Si user_id es UUID, convertirlo a ID numérico usando el mapeo
  if (transformed.user_id && typeof transformed.user_id === 'string' && transformed.user_id.includes('-')) {
    const numericId = uuidToIdMap.get(transformed.user_id)
    if (numericId) {
      transformed.user_id = numericId
    } else {
      console.warn(`   ⚠️  No se encontró mapeo para UUID: ${transformed.user_id}`)
      // Mantener null si no hay mapeo
      transformed.user_id = null
    }
  }
  
  return transformed
}

/**
 * Función principal
 */
async function main() {
  try {
    console.log('🚀 Iniciando migración de datos...')
    console.log('📊 Origen: Supabase PostgreSQL')
    console.log('📊 Destino: MySQL')
    console.log('')
    
    // Verificar conexiones
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Variables de entorno de Supabase no configuradas')
    }
    
    if (!MYSQL_CONFIG.host || !MYSQL_CONFIG.database) {
      throw new Error('Variables de entorno de MySQL no configuradas')
    }
    
    await connectMySQL()
    
    // Migrar en orden de dependencias
    console.log('\n📋 Orden de migración:')
    console.log('   1. sum_roles (sin dependencias)')
    console.log('   2. sum_departamentos (sin dependencias)')
    console.log('   3. sum_articulos (sin dependencias)')
    console.log('   4. usuarios (crea mapeo UUID->ID)')
    console.log('   5. sum_usuarios_departamentos (usa mapeo)')
    console.log('   6. sum_entrada_mercancia')
    console.log('   7. sum_solicitudes (usa mapeo)')
    console.log('   8. sum_autorizar_solicitudes')
    console.log('   9. sum_solicitudes_aprobadas')
    console.log('   10. sum_solicitudes_gestionadas')
    console.log('   11. sum_solicitudes_despachadas')
    console.log('')
    
    await migrateTable('sum_roles')
    await migrateTable('sum_departamentos')
    await migrateTable('sum_articulos')
    await migrateUsers() // Crea el mapeo UUID->ID
    await migrateTable('sum_usuarios_departamentos', transformUserId)
    await migrateTable('sum_entrada_mercancia')
    await migrateTable('sum_solicitudes', transformUserId)
    await migrateTable('sum_autorizar_solicitudes')
    await migrateTable('sum_solicitudes_aprobadas')
    await migrateTable('sum_solicitudes_gestionadas')
    await migrateTable('sum_solicitudes_despachadas')
    
    console.log('\n✅ Migración completada exitosamente!')
    console.log('\n⚠️  IMPORTANTE:')
    console.log('   1. Verifica que todos los datos se migraron correctamente')
    console.log('   2. Los usuarios tienen contraseñas temporales: TempPassword123!')
    console.log('   3. Cambia las contraseñas después del primer login')
    console.log('   4. Verifica las relaciones de foreign keys')
    console.log('   5. Cambia VITE_DATABASE_TYPE=mysql en .env')
    console.log('')
    console.log('📊 Resumen del mapeo UUID->ID:')
    uuidToIdMap.forEach((id, uuid) => {
      console.log(`   ${uuid} -> ${id}`)
    })
    
  } catch (error) {
    console.error('\n❌ Error durante la migración:', error)
    console.error(error.stack)
    process.exit(1)
  } finally {
    await closeMySQL()
  }
}

// Ejecutar
main()
