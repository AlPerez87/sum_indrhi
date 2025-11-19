/**
 * Script de Prueba de Conexión MySQL
 * 
 * Uso: node test-mysql-connection.js
 * 
 * Este script prueba la conexión a MySQL y verifica que:
 * - La conexión funciona
 * - La base de datos existe
 * - Las tablas están creadas
 */

import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Configurar rutas para ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Cargar variables de entorno
dotenv.config({ path: join(__dirname, '.env') })

const MYSQL_CONFIG = {
  host: process.env.VITE_MYSQL_HOST || '127.0.0.1',
  port: parseInt(process.env.VITE_MYSQL_PORT || '3306'),
  user: process.env.VITE_MYSQL_USER || 'root',
  password: process.env.VITE_MYSQL_PASSWORD || '',
  database: process.env.VITE_MYSQL_DATABASE || 'sum_indrhi',
}

const TABLES_REQUIRED = [
  'usuarios',
  'sum_articulos',
  'sum_departamentos',
  'sum_roles',
  'sum_usuarios_departamentos',
  'sum_entrada_mercancia',
  'sum_solicitudes',
  'sum_autorizar_solicitudes',
  'sum_solicitudes_aprobadas',
  'sum_solicitudes_gestionadas',
  'sum_solicitudes_despachadas',
]

async function testConnection() {
  let connection = null
  
  try {
    console.log('🔌 Intentando conectar a MySQL...')
    console.log(`   Host: ${MYSQL_CONFIG.host}`)
    console.log(`   Port: ${MYSQL_CONFIG.port}`)
    console.log(`   User: ${MYSQL_CONFIG.user}`)
    console.log(`   Database: ${MYSQL_CONFIG.database}`)
    console.log('')
    
    // Intentar conectar
    connection = await mysql.createConnection(MYSQL_CONFIG)
    console.log('✅ Conexión exitosa a MySQL!\n')
    
    // Verificar que la base de datos existe
    const [databases] = await connection.execute(
      `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`,
      [MYSQL_CONFIG.database]
    )
    
    if (databases.length === 0) {
      console.log(`⚠️  La base de datos '${MYSQL_CONFIG.database}' no existe.`)
      console.log('   Ejecuta el script mysql-migration.sql primero.\n')
      return
    }
    
    console.log(`✅ Base de datos '${MYSQL_CONFIG.database}' encontrada\n`)
    
    // Verificar tablas
    console.log('📋 Verificando tablas...\n')
    const [tables] = await connection.execute(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?`,
      [MYSQL_CONFIG.database]
    )
    
    const existingTables = tables.map(t => t.TABLE_NAME)
    const missingTables = TABLES_REQUIRED.filter(t => !existingTables.includes(t))
    
    if (missingTables.length > 0) {
      console.log('❌ Faltan las siguientes tablas:')
      missingTables.forEach(table => console.log(`   - ${table}`))
      console.log('\n   Ejecuta el script mysql-migration.sql completo.\n')
    } else {
      console.log('✅ Todas las tablas requeridas están creadas:\n')
      TABLES_REQUIRED.forEach(table => {
        const exists = existingTables.includes(table)
        console.log(`   ${exists ? '✅' : '❌'} ${table}`)
      })
      console.log('')
    }
    
    // Probar algunas queries simples
    console.log('🧪 Probando queries...\n')
    
    try {
      const [articulos] = await connection.execute('SELECT COUNT(*) as total FROM sum_articulos')
      console.log(`   📊 Artículos: ${articulos[0].total}`)
    } catch (err) {
      console.log(`   ⚠️  No se pudo contar artículos: ${err.message}`)
    }
    
    try {
      const [departamentos] = await connection.execute('SELECT COUNT(*) as total FROM sum_departamentos')
      console.log(`   📊 Departamentos: ${departamentos[0].total}`)
    } catch (err) {
      console.log(`   ⚠️  No se pudo contar departamentos: ${err.message}`)
    }
    
    try {
      const [usuarios] = await connection.execute('SELECT COUNT(*) as total FROM usuarios')
      console.log(`   📊 Usuarios: ${usuarios[0].total}`)
    } catch (err) {
      console.log(`   ⚠️  No se pudo contar usuarios: ${err.message}`)
    }
    
    console.log('\n✅ Todas las pruebas completadas exitosamente!')
    console.log('\n💡 Próximos pasos:')
    console.log('   1. Si faltan tablas, ejecuta: guides/mysql-migration.sql')
    console.log('   2. Para migrar datos, ejecuta: node scripts/migrate-data-to-mysql.js')
    console.log('   3. Cambia VITE_DATABASE_TYPE=mysql en .env cuando estés listo\n')
    
  } catch (error) {
    console.error('\n❌ Error conectando a MySQL:')
    console.error(`   ${error.message}\n`)
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Soluciones:')
      console.log('   1. Verifica que MySQL esté corriendo (en XAMPP, verifica que MySQL esté iniciado)')
      console.log('   2. Verifica que el puerto sea correcto (3306 por defecto)')
      console.log('   3. Verifica que el host sea correcto (localhost)')
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('💡 Soluciones:')
      console.log('   1. Verifica usuario y contraseña en .env')
      console.log('   2. Si usas XAMPP sin contraseña, deja VITE_MYSQL_PASSWORD vacío')
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('💡 Soluciones:')
      console.log('   1. La base de datos no existe, ejecuta: guides/mysql-migration.sql')
    }
    
    process.exit(1)
  } finally {
    if (connection) {
      await connection.end()
      console.log('🔌 Conexión cerrada\n')
    }
  }
}

// Ejecutar
testConnection()

