/**
 * Script de Migración de Datos de Supabase a MySQL (Usando SQL Directo)
 * 
 * Este script usa el MCP de Supabase para obtener datos directamente,
 * evitando problemas de RLS
 */

import mysql from 'mysql2/promise'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Cargar variables de entorno
dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '..', '.env') })

const MYSQL_CONFIG = {
  host: process.env.VITE_MYSQL_HOST || 'localhost',
  port: parseInt(process.env.VITE_MYSQL_PORT || '3306'),
  user: process.env.VITE_MYSQL_USER || 'root',
  password: process.env.VITE_MYSQL_PASSWORD || '',
  database: process.env.VITE_MYSQL_DATABASE || 'sum_indrhi',
}

let mysqlConnection = null
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
 * Obtiene datos usando SQL directo desde Supabase
 * Necesitarás ejecutar estas queries manualmente desde Supabase Dashboard
 * o usar el MCP de Supabase si está disponible
 */
async function getDataFromSupabase(tableName) {
  // Por ahora, retornamos datos vacíos
  // El usuario necesitará exportar manualmente o usar el MCP
  console.log(`   ⚠️  Necesitas exportar datos de ${tableName} manualmente desde Supabase`)
  return []
}

/**
 * Migra usuarios desde Supabase Auth a MySQL
 */
async function migrateUsers() {
  console.log('\n📦 Migrando usuarios...')
  
  // Datos de usuarios obtenidos desde Supabase (usar MCP o exportar manualmente)
  const usuariosSupabase = [
    { id: '77ad0f05-d01b-4008-a8d0-70e5d216e4da', email: 'emencia@indrhi.gob.do' },
    { id: '9c1572ad-1e73-4523-8007-17fa8d7ad6c6', email: 'tic@indrhi.gob.do' },
    { id: 'c6ff352b-d40d-45d1-bded-dfea3dc8ea66', email: 'administrativo@indrhi.gob.do' },
    { id: 'f4f8340b-b9f7-4674-8466-52b5819c57dd', email: 'ing.aperezp@gmail.com' }
  ]
  
  console.log(`   Encontrados ${usuariosSupabase.length} usuarios`)
  
  for (const usuario of usuariosSupabase) {
    const passwordHash = await bcrypt.hash('TempPassword123!', 10)
    
    try {
      const [result] = await mysqlConnection.execute(
        `INSERT INTO usuarios (email, password_hash, email_verificado) 
         VALUES (?, ?, ?)`,
        [usuario.email, passwordHash, true]
      )
      
      const mysqlUserId = result.insertId
      uuidToIdMap.set(usuario.id, mysqlUserId)
      console.log(`   ✅ Usuario migrado: ${usuario.email} (UUID: ${usuario.id} -> ID: ${mysqlUserId})`)
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        const [existing] = await mysqlConnection.execute(
          'SELECT id FROM usuarios WHERE email = ?',
          [usuario.email]
        )
        if (existing.length > 0) {
          uuidToIdMap.set(usuario.id, existing[0].id)
          console.log(`   ⚠️  Usuario ya existe: ${usuario.email} (ID: ${existing[0].id})`)
        }
      } else {
        console.error(`   ❌ Error migrando usuario ${usuario.email}:`, err.message)
      }
    }
  }
  
  console.log(`   ✅ Mapeo creado: ${uuidToIdMap.size} usuarios`)
}

/**
 * Migra una tabla usando datos proporcionados
 */
async function migrateTableData(tableName, data, transformFn = null) {
  console.log(`\n📦 Migrando tabla: ${tableName}...`)
  console.log(`   Encontrados ${data.length} registros`)
  
  if (data.length === 0) {
    console.log(`   ⚠️  Tabla vacía, saltando...`)
    return
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
      if (errorCount <= 5) {
        console.error(`   ❌ Error migrando registro ID ${row.id || 'N/A'}:`, err.message)
      }
    }
  }
  
  console.log(`   ✅ Tabla ${tableName} migrada: ${successCount} exitosos, ${errorCount} errores`)
}

function transformUserId(row) {
  const transformed = { ...row }
  if (transformed.user_id && typeof transformed.user_id === 'string' && transformed.user_id.includes('-')) {
    const numericId = uuidToIdMap.get(transformed.user_id)
    if (numericId) {
      transformed.user_id = numericId
    } else {
      transformed.user_id = null
    }
  }
  return transformed
}

async function main() {
  try {
    console.log('🚀 Iniciando migración de datos...')
    console.log('📊 Origen: Supabase PostgreSQL')
    console.log('📊 Destino: MySQL')
    console.log('')
    console.log('⚠️  NOTA: Este script migra usuarios conocidos.')
    console.log('   Para migrar otras tablas, usa el script principal con SERVICE_ROLE_KEY')
    console.log('')
    
    await connectMySQL()
    
    // Migrar usuarios primero (crea el mapeo)
    await migrateUsers()
    
    console.log('\n✅ Migración de usuarios completada!')
    console.log('\n📊 Resumen del mapeo UUID->ID:')
    uuidToIdMap.forEach((id, uuid) => {
      console.log(`   ${uuid} -> ${id}`)
    })
    console.log('\n💡 Para migrar otras tablas:')
    console.log('   1. Configura VITE_SUPABASE_SERVICE_ROLE_KEY en .env')
    console.log('   2. Ejecuta: node scripts/migrate-data-to-mysql.js')
    
  } catch (error) {
    console.error('\n❌ Error durante la migración:', error)
    process.exit(1)
  } finally {
    await closeMySQL()
  }
}

main()

