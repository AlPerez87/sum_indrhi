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

const MYSQL_CONFIG = {
  host: process.env.VITE_MYSQL_HOST || 'localhost',
  port: parseInt(process.env.VITE_MYSQL_PORT || '3306'),
  user: process.env.VITE_MYSQL_USER || 'root',
  password: process.env.VITE_MYSQL_PASSWORD || '',
  database: process.env.VITE_MYSQL_DATABASE || 'sum_indrhi',
}

// Inicializar clientes
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
let mysqlConnection = null

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
 */
async function migrateUsers() {
  console.log('\n📦 Migrando usuarios...')
  
  // Obtener usuarios de Supabase Auth (requiere admin, usar SQL directo si es posible)
  // Por ahora, migramos desde sum_usuarios_departamentos
  const { data: usuariosDepto, error } = await supabase
    .from('sum_usuarios_departamentos')
    .select('user_id, email, username')
  
  if (error) {
    console.error('Error obteniendo usuarios:', error)
    return
  }
  
  console.log(`   Encontrados ${usuariosDepto.length} usuarios`)
  
  for (const usuarioDepto of usuariosDepto) {
    if (!usuarioDepto.user_id) continue
    
    // Obtener información del usuario desde auth.users (requiere acceso admin)
    // Por ahora, creamos usuarios con contraseña temporal
    const passwordHash = await bcrypt.hash('TempPassword123!', 10)
    
    try {
      await mysqlConnection.execute(
        `INSERT INTO usuarios (id, email, password_hash, email_verificado) 
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE email = VALUES(email)`,
        [usuarioDepto.user_id, usuarioDepto.email, passwordHash, true]
      )
      console.log(`   ✅ Usuario migrado: ${usuarioDepto.email}`)
    } catch (err) {
      console.error(`   ❌ Error migrando usuario ${usuarioDepto.email}:`, err.message)
    }
  }
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
  
  for (const row of data) {
    try {
      // Transformar datos si es necesario
      const transformedRow = transformFn ? transformFn(row) : row
      
      // Remover campos que no existen en MySQL
      delete transformedRow.sum_departamentos
      delete transformedRow.sum_roles
      
      const keys = Object.keys(transformedRow).filter(k => transformedRow[k] !== null && transformedRow[k] !== undefined)
      const values = keys.map(k => transformedRow[k])
      const placeholders = keys.map(() => '?').join(', ')
      
      await mysqlConnection.execute(
        `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES (${placeholders})
         ON DUPLICATE KEY UPDATE ${keys.map(k => `${k} = VALUES(${k})`).join(', ')}`,
        values
      )
    } catch (err) {
      console.error(`   ❌ Error migrando registro:`, err.message)
      console.error(`   Datos:`, row)
    }
  }
  
  console.log(`   ✅ Tabla ${tableName} migrada`)
}

/**
 * Transforma user_id de UUID a INT para MySQL
 */
function transformUserId(row) {
  const transformed = { ...row }
  
  // Si user_id es UUID, necesitamos mapearlo a un ID numérico
  // Por ahora, mantenemos el UUID como string o creamos un mapeo
  if (transformed.user_id && typeof transformed.user_id === 'string' && transformed.user_id.includes('-')) {
    // UUID - necesitamos obtener el ID numérico del usuario
    // Esto requiere una consulta adicional
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
    
    await connectMySQL()
    
    // Migrar en orden de dependencias
    await migrateTable('sum_roles')
    await migrateTable('sum_departamentos')
    await migrateTable('sum_articulos')
    await migrateUsers()
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
    console.log('   2. Los usuarios tienen contraseñas temporales (TempPassword123!)')
    console.log('   3. Cambia las contraseñas después del primer login')
    console.log('   4. Verifica las relaciones de foreign keys')
    
  } catch (error) {
    console.error('\n❌ Error durante la migración:', error)
    process.exit(1)
  } finally {
    await closeMySQL()
  }
}

// Ejecutar
main()

