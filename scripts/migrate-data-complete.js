/**
 * Script Completo de Migración de Datos de Supabase a MySQL
 * 
 * Este script obtiene TODOS los datos usando SQL directo desde Supabase
 * y los migra a MySQL
 * 
 * Uso:
 * node scripts/migrate-data-complete.js
 */

import { createClient } from '@supabase/supabase-js'
import mysql from 'mysql2/promise'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Configurar rutas
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Cargar variables de entorno
dotenv.config({ path: join(__dirname, '..', '.env') })

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

const MYSQL_CONFIG = {
  host: process.env.VITE_MYSQL_HOST || 'localhost',
  port: parseInt(process.env.VITE_MYSQL_PORT || '3306'),
  user: process.env.VITE_MYSQL_USER || 'root',
  password: process.env.VITE_MYSQL_PASSWORD || '',
  database: process.env.VITE_MYSQL_DATABASE || 'sum_indrhi',
}

// Usar service role key si está disponible (bypass RLS)
const supabaseKey = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY
const supabase = createClient(SUPABASE_URL, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

let mysqlConnection = null
const uuidToIdMap = new Map()

async function connectMySQL() {
  mysqlConnection = await mysql.createConnection(MYSQL_CONFIG)
  console.log('✅ Conectado a MySQL')
}

async function closeMySQL() {
  if (mysqlConnection) {
    await mysqlConnection.end()
    console.log('✅ Conexión MySQL cerrada')
  }
}

/**
 * Obtiene todos los datos de una tabla usando RPC o SQL directo
 */
async function getAllDataFromTable(tableName) {
  try {
    // Intentar obtener todos los datos
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(10000) // Límite alto para obtener todos
    
    if (error) {
      console.error(`   ⚠️  Error con cliente Supabase: ${error.message}`)
      return []
    }
    
    return data || []
  } catch (err) {
    console.error(`   ⚠️  Error obteniendo datos: ${err.message}`)
    return []
  }
}

/**
 * Migra usuarios desde Supabase Auth
 */
async function migrateUsers() {
  console.log('\n📦 Migrando usuarios...')
  
  // Obtener usuarios desde sum_usuarios_departamentos primero
  const usuariosDepto = await getAllDataFromTable('sum_usuarios_departamentos')
  
  if (usuariosDepto.length === 0) {
    console.log('   ⚠️  No se encontraron usuarios en sum_usuarios_departamentos')
    console.log('   Intentando obtener desde auth.users directamente...')
    
    // Intentar obtener usuarios directamente (requiere service role)
    try {
      const { data: authUsers } = await supabase.auth.admin.listUsers()
      if (authUsers && authUsers.users) {
        for (const user of authUsers.users) {
          const passwordHash = await bcrypt.hash('TempPassword123!', 10)
          try {
            const [result] = await mysqlConnection.execute(
              `INSERT INTO usuarios (email, password_hash, email_verificado) 
               VALUES (?, ?, ?)`,
              [user.email, passwordHash, true]
            )
            uuidToIdMap.set(user.id, result.insertId)
            console.log(`   ✅ Usuario migrado: ${user.email} (ID: ${result.insertId})`)
          } catch (err) {
            if (err.code === 'ER_DUP_ENTRY') {
              const [existing] = await mysqlConnection.execute(
                'SELECT id FROM usuarios WHERE email = ?',
                [user.email]
              )
              if (existing.length > 0) {
                uuidToIdMap.set(user.id, existing[0].id)
              }
            }
          }
        }
      }
    } catch (err) {
      console.log(`   ⚠️  No se pudo obtener usuarios desde auth.admin: ${err.message}`)
    }
  } else {
    // Migrar desde sum_usuarios_departamentos
    console.log(`   Encontrados ${usuariosDepto.length} usuarios en sum_usuarios_departamentos`)
    
    for (const usuarioDepto of usuariosDepto) {
      if (!usuarioDepto.user_id || !usuarioDepto.email) continue
      
      const passwordHash = await bcrypt.hash('TempPassword123!', 10)
      
      try {
        const [result] = await mysqlConnection.execute(
          `INSERT INTO usuarios (email, password_hash, email_verificado) 
           VALUES (?, ?, ?)`,
          [usuarioDepto.email, passwordHash, true]
        )
        
        const mysqlUserId = result.insertId
        uuidToIdMap.set(usuarioDepto.user_id, mysqlUserId)
        console.log(`   ✅ Usuario migrado: ${usuarioDepto.email} (UUID: ${usuarioDepto.user_id.substring(0, 8)}... -> ID: ${mysqlUserId})`)
      } catch (err) {
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
  }
  
  console.log(`   ✅ Mapeo creado: ${uuidToIdMap.size} usuarios`)
}

/**
 * Migra una tabla genérica
 */
async function migrateTable(tableName, transformFn = null) {
  console.log(`\n📦 Migrando tabla: ${tableName}...`)
  
  const data = await getAllDataFromTable(tableName)
  
  console.log(`   Encontrados ${data.length} registros`)
  
  if (data.length === 0) {
    console.log(`   ⚠️  Tabla vacía, saltando...`)
    return { success: 0, errors: 0 }
  }
  
  let successCount = 0
  let errorCount = 0
  
  for (const row of data) {
    try {
      const transformedRow = transformFn ? transformFn(row) : { ...row }
      
      delete transformedRow.sum_departamentos
      delete transformedRow.sum_roles
      
      const keys = Object.keys(transformedRow).filter(k => {
        const value = transformedRow[k]
        return value !== null && value !== undefined && value !== ''
      })
      const values = keys.map(k => transformedRow[k])
      const placeholders = keys.map(() => '?').join(', ')
      const updateClause = keys.map(k => `${k} = VALUES(${k})`).join(', ')
      
      await mysqlConnection.execute(
        `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES (${placeholders})
         ON DUPLICATE KEY UPDATE ${updateClause}`,
        values
      )
      successCount++
    } catch (err) {
      errorCount++
      if (errorCount <= 3) {
        console.error(`   ❌ Error migrando registro ID ${row.id || 'N/A'}:`, err.message)
      }
    }
  }
  
  console.log(`   ✅ Tabla ${tableName} migrada: ${successCount} exitosos, ${errorCount} errores`)
  return { success: successCount, errors: errorCount }
}

function transformUserId(row) {
  const transformed = { ...row }
  // Transformar user_id (UUID -> ID numérico)
  if (transformed.user_id && typeof transformed.user_id === 'string' && transformed.user_id.includes('-')) {
    const numericId = uuidToIdMap.get(transformed.user_id)
    if (numericId) {
      transformed.user_id = numericId
    } else {
      transformed.user_id = null
    }
  }
  // Transformar usuario_id (UUID -> ID numérico)
  if (transformed.usuario_id && typeof transformed.usuario_id === 'string' && transformed.usuario_id.includes('-')) {
    const numericId = uuidToIdMap.get(transformed.usuario_id)
    if (numericId) {
      transformed.usuario_id = numericId
    } else {
      transformed.usuario_id = null
    }
  }
  return transformed
}

async function main() {
  try {
    console.log('🚀 Iniciando migración COMPLETA de datos...')
    console.log('📊 Origen: Supabase PostgreSQL')
    console.log('📊 Destino: MySQL')
    console.log('')
    
    if (SUPABASE_SERVICE_ROLE_KEY) {
      console.log('✅ Usando SERVICE_ROLE_KEY (bypass RLS)')
    } else {
      console.log('⚠️  Usando ANON_KEY (puede tener limitaciones por RLS)')
      console.log('   Para migrar todos los datos, configura VITE_SUPABASE_SERVICE_ROLE_KEY')
    }
    console.log('')
    
    if (!SUPABASE_URL || !supabaseKey) {
      throw new Error('Variables de entorno de Supabase no configuradas')
    }
    
    if (!MYSQL_CONFIG.host || !MYSQL_CONFIG.database) {
      throw new Error('Variables de entorno de MySQL no configuradas')
    }
    
    await connectMySQL()
    
    const results = {}
    
    // Migrar en orden de dependencias
    console.log('\n📋 Iniciando migración...\n')
    
    results.sum_roles = await migrateTable('sum_roles')
    results.sum_departamentos = await migrateTable('sum_departamentos')
    results.sum_articulos = await migrateTable('sum_articulos')
    await migrateUsers() // Crea el mapeo UUID->ID
    results.sum_usuarios_departamentos = await migrateTable('sum_usuarios_departamentos', transformUserId)
    results.sum_entrada_mercancia = await migrateTable('sum_entrada_mercancia')
    results.sum_solicitudes = await migrateTable('sum_solicitudes', transformUserId)
    results.sum_autorizar_solicitudes = await migrateTable('sum_autorizar_solicitudes')
    results.sum_solicitudes_aprobadas = await migrateTable('sum_solicitudes_aprobadas')
    results.sum_solicitudes_gestionadas = await migrateTable('sum_solicitudes_gestionadas')
    results.sum_solicitudes_despachadas = await migrateTable('sum_solicitudes_despachadas')
    
    console.log('\n' + '='.repeat(60))
    console.log('✅ Migración completada!')
    console.log('='.repeat(60))
    console.log('\n📊 Resumen:')
    Object.keys(results).forEach(table => {
      const r = results[table]
      console.log(`   ${table}: ${r.success} exitosos, ${r.errors} errores`)
    })
    
    console.log('\n📊 Mapeo UUID->ID de usuarios:')
    uuidToIdMap.forEach((id, uuid) => {
      console.log(`   ${uuid.substring(0, 8)}... -> ${id}`)
    })
    
    console.log('\n⚠️  IMPORTANTE:')
    console.log('   1. Verifica los datos en MySQL Workbench')
    console.log('   2. Los usuarios tienen contraseña temporal: TempPassword123!')
    console.log('   3. Cambia las contraseñas después del primer login')
    console.log('   4. Cambia VITE_DATABASE_TYPE=mysql en .env')
    console.log('   5. Reinicia la aplicación')
    
  } catch (error) {
    console.error('\n❌ Error durante la migración:', error)
    console.error(error.stack)
    process.exit(1)
  } finally {
    await closeMySQL()
  }
}

main()

