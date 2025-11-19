/**
 * Script Final de Migración Completa
 * Migra TODOS los datos desde Supabase a MySQL en el orden correcto
 */

import mysql from 'mysql2/promise'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '..', '.env') })

const MYSQL_CONFIG = {
  host: process.env.VITE_MYSQL_HOST || 'localhost',
  port: parseInt(process.env.VITE_MYSQL_PORT || '3306'),
  user: process.env.VITE_MYSQL_USER || 'root',
  password: process.env.VITE_MYSQL_PASSWORD || '',
  database: process.env.VITE_MYSQL_DATABASE || 'sum_indrhi',
}

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

async function insertData(tableName, data, transformFn = null) {
  if (!data || data.length === 0) {
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
  
  return { success: successCount, errors: errorCount }
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
  if (transformed.usuario_id && typeof transformed.usuario_id === 'string' && transformed.usuario_id.includes('-')) {
    const numericId = uuidToIdMap.get(transformed.usuario_id)
    if (numericId) {
      transformed.usuario_id = numericId
    } else {
      transformed.usuario_id = null
    }
  }
  if (transformed.despachado_por_id && typeof transformed.despachado_por_id === 'number') {
    // Buscar el ID numérico del usuario en usuarios_departamentos
    // Por ahora mantenemos el valor original
  }
  return transformed
}

async function main() {
  try {
    console.log('🚀 Iniciando migración COMPLETA de datos...')
    console.log('📊 Destino: MySQL')
    console.log('')
    
    await connectMySQL()
    
    const results = {}
    
    // 1. Migrar roles (sin dependencias)
    console.log('\n📦 Migrando sum_roles...')
    const roles = JSON.parse(readFileSync(join(__dirname, 'data-roles.json'), 'utf8'))
    results.sum_roles = await insertData('sum_roles', roles)
    console.log(`   ✅ ${results.sum_roles.success} roles migrados`)
    
    // 2. Migrar departamentos (sin dependencias)
    console.log('\n📦 Migrando sum_departamentos...')
    const departamentos = JSON.parse(readFileSync(join(__dirname, 'data-departamentos.json'), 'utf8'))
    results.sum_departamentos = await insertData('sum_departamentos', departamentos)
    console.log(`   ✅ ${results.sum_departamentos.success} departamentos migrados`)
    
    // 3. Migrar artículos (sin dependencias)
    console.log('\n📦 Migrando sum_articulos...')
    const articulos = JSON.parse(readFileSync(join(__dirname, 'data-articulos.json'), 'utf8'))
    results.sum_articulos = await insertData('sum_articulos', articulos)
    console.log(`   ✅ ${results.sum_articulos.success} artículos migrados`)
    
    // 4. Migrar usuarios (crea mapeo UUID->ID)
    console.log('\n📦 Migrando usuarios...')
    const usuarios = [
      { id: '77ad0f05-d01b-4008-a8d0-70e5d216e4da', email: 'emencia@indrhi.gob.do' },
      { id: '9c1572ad-1e73-4523-8007-17fa8d7ad6c6', email: 'tic@indrhi.gob.do' },
      { id: 'c6ff352b-d40d-45d1-bded-dfea3dc8ea66', email: 'administrativo@indrhi.gob.do' },
      { id: 'f4f8340b-b9f7-4674-8466-52b5819c57dd', email: 'ing.aperezp@gmail.com' }
    ]
    
    for (const usuario of usuarios) {
      const passwordHash = await bcrypt.hash('TempPassword123!', 10)
      try {
        const [result] = await mysqlConnection.execute(
          `INSERT INTO usuarios (email, password_hash, email_verificado) 
           VALUES (?, ?, ?)`,
          [usuario.email, passwordHash, true]
        )
        uuidToIdMap.set(usuario.id, result.insertId)
        console.log(`   ✅ Usuario migrado: ${usuario.email} (ID: ${result.insertId})`)
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
        }
      }
    }
    
    console.log(`   ✅ Mapeo creado: ${uuidToIdMap.size} usuarios`)
    
    // 5. Migrar usuarios_departamentos (usa mapeo)
    console.log('\n📦 Migrando sum_usuarios_departamentos...')
    const usuariosDepto = [
      {id:4,user_id:"c6ff352b-d40d-45d1-bded-dfea3dc8ea66",username:"Administrativo",email:"administrativo@indrhi.gob.do",departamento_id:43,fecha_asignacion:"2025-11-17 01:29:14.841213",actualizado:"2025-11-17 15:01:54.066568",nombre_completo:"Departamento Administrativo",rol_id:5},
      {id:10,user_id:"f4f8340b-b9f7-4674-8466-52b5819c57dd",username:"App",email:"ing.aperezp@gmail.com",departamento_id:81,fecha_asignacion:"2025-11-14 13:38:09.353062",actualizado:"2025-11-15 02:33:03.432298",nombre_completo:"Albert Perez",rol_id:1},
      {id:11,user_id:"9c1572ad-1e73-4523-8007-17fa8d7ad6c6",username:"TIC",email:"tic@indrhi.gob.do",departamento_id:81,fecha_asignacion:"2025-11-14 13:38:09.353062",actualizado:"2025-11-17 20:28:04.96109",nombre_completo:"Direccion de Tecnologia de la Informacion",rol_id:8},
      {id:12,user_id:"77ad0f05-d01b-4008-a8d0-70e5d216e4da",username:"emencia",email:"emencia@indrhi.gob.do",departamento_id:198,fecha_asignacion:"2025-11-14 13:38:09.353062",actualizado:"2025-11-17 20:26:35.259067",nombre_completo:"Edison Mencia",rol_id:6}
    ]
    results.sum_usuarios_departamentos = await insertData('sum_usuarios_departamentos', usuariosDepto, transformUserId)
    console.log(`   ✅ ${results.sum_usuarios_departamentos.success} usuarios_departamentos migrados`)
    
    // 6. Migrar entrada_mercancia
    console.log('\n📦 Migrando sum_entrada_mercancia...')
    const entradaMercancia = [
      {id:4,numero_entrada:"INDRHI-EM-2025-0001",numero_orden:"INDRHI-DAF-CD-2025-0001",fecha:"2025-11-17",suplidor:"EQUIPASA, SRL",articulos_cantidades_unidades:"[{\"codigo\":\"01-001\",\"nombre\":\"AGENDAS DE ESCRITORIO\",\"cantidad\":1,\"unidad\":\"UNIDAD\"},{\"codigo\":\"01-005\",\"nombre\":\"BANDEJAS P/ ESCRITORIO\",\"cantidad\":3,\"unidad\":\"UNIDAD\"}]"}
    ]
    results.sum_entrada_mercancia = await insertData('sum_entrada_mercancia', entradaMercancia)
    console.log(`   ✅ ${results.sum_entrada_mercancia.success} entradas migradas`)
    
    // 7. Migrar solicitudes (usa mapeo)
    console.log('\n📦 Migrando sum_solicitudes...')
    const solicitudes = [
      {id:9,numero_solicitud:"SD81-2025-0001",fecha:"2025-11-17",departamento:"DIRECCION DE TECNOLOGIAS DE LA INFORMACION Y COMUNICACIONES",departamento_id:81,usuario_id:"9c1572ad-1e73-4523-8007-17fa8d7ad6c6",articulos_cantidades:"[{\"articulo\":\"CAFE MOLIDO SANTO DOMINGO (1 LBR.)\",\"codigo\":\"01-009\",\"cantidad\":2},{\"articulo\":\"AZUCAR LIBRAS\",\"codigo\":\"01-004\",\"cantidad\":4},{\"articulo\":\"AMBIENTADOR SPRAY\",\"codigo\":\"02-002\",\"cantidad\":2}]",enviada:1},
      {id:10,numero_solicitud:"SD81-2025-0002",fecha:"2025-11-17",departamento:"DIRECCION DE TECNOLOGIAS DE LA INFORMACION Y COMUNICACIONES",departamento_id:81,usuario_id:"9c1572ad-1e73-4523-8007-17fa8d7ad6c6",articulos_cantidades:"[{\"articulo\":\"CD EN BLANCO\",\"codigo\":\"01-018\",\"cantidad\":34},{\"articulo\":\"CLIPS JUMBO\",\"codigo\":\"01-032\",\"cantidad\":12},{\"articulo\":\"CLIP DE BILLETERO 2 PULGADAS (PEQUEÑO)\",\"codigo\":\"01-029\",\"cantidad\":5},{\"articulo\":\"ETIQUETAS P/ FOLDERS\",\"codigo\":\"01-046\",\"cantidad\":6},{\"articulo\":\"FOLDER PENDAFLEX 8 1/2 X 11\",\"codigo\":\"01-049\",\"cantidad\":16},{\"articulo\":\"GRAPAS DE 3/8\",\"codigo\":\"01-058\",\"cantidad\":4},{\"articulo\":\"REGLAS PLÁSTICAS\",\"codigo\":\"01-091\",\"cantidad\":15},{\"articulo\":\"PAPEL CALCULAR\",\"codigo\":\"01-078\",\"cantidad\":12}]",enviada:1},
      {id:12,numero_solicitud:"SD81-2025-0003",fecha:"2025-11-18",departamento:"DIRECCION DE TECNOLOGIAS DE LA INFORMACION Y COMUNICACIONES",departamento_id:81,usuario_id:"f4f8340b-b9f7-4674-8466-52b5819c57dd",articulos_cantidades:"[{\"articulo\":\"CAFE MOLIDO SANTO DOMINGO (1 LBR.)\",\"codigo\":\"01-009\",\"cantidad\":2},{\"articulo\":\"AZUCAR LIBRAS\",\"codigo\":\"01-004\",\"cantidad\":4},{\"articulo\":\"AGENDAS DE ESCRITORIO\",\"codigo\":\"01-001\",\"cantidad\":3}]",enviada:1}
    ]
    results.sum_solicitudes = await insertData('sum_solicitudes', solicitudes, transformUserId)
    console.log(`   ✅ ${results.sum_solicitudes.success} solicitudes migradas`)
    
    // 8. Migrar solicitudes_aprobadas
    console.log('\n📦 Migrando sum_solicitudes_aprobadas...')
    const solicitudesAprobadas = [
      {id:6,numero_solicitud:"SD81-2025-0003",fecha:"2025-11-18",departamento:"DIRECCION DE TECNOLOGIAS DE LA INFORMACION Y COMUNICACIONES",articulos_cantidades:"[{\"articulo\":\"CAFE MOLIDO SANTO DOMINGO (1 LBR.)\",\"codigo\":\"01-009\",\"cantidad\":2},{\"articulo\":\"AZUCAR LIBRAS\",\"codigo\":\"01-004\",\"cantidad\":4},{\"articulo\":\"AGENDAS DE ESCRITORIO\",\"codigo\":\"01-001\",\"cantidad\":3}]"}
    ]
    results.sum_solicitudes_aprobadas = await insertData('sum_solicitudes_aprobadas', solicitudesAprobadas)
    console.log(`   ✅ ${results.sum_solicitudes_aprobadas.success} solicitudes aprobadas migradas`)
    
    // 9. Migrar solicitudes_despachadas
    console.log('\n📦 Migrando sum_solicitudes_despachadas...')
    const solicitudesDespachadas = [
      {id:4,numero_solicitud:"SD81-2025-0001",fecha:"2025-11-17",departamento:"DIRECCION DE TECNOLOGIAS DE LA INFORMACION Y COMUNICACIONES",articulos_cantidades:"[{\"articulo\":\"CAFE MOLIDO SANTO DOMINGO (1 LBR.)\",\"codigo\":\"01-009\",\"cantidad\":2,\"existencia\":600},{\"articulo\":\"AZUCAR LIBRAS\",\"codigo\":\"01-004\",\"cantidad\":4,\"existencia\":363},{\"articulo\":\"AMBIENTADOR SPRAY\",\"codigo\":\"02-002\",\"cantidad\":2,\"existencia\":8}]",despachado_por:"Edison Medina",despachado_por_id:12},
      {id:5,numero_solicitud:"SD81-2025-0002",fecha:"2025-11-17",departamento:"DIRECCION DE TECNOLOGIAS DE LA INFORMACION Y COMUNICACIONES",articulos_cantidades:"[{\"articulo\":\"CD EN BLANCO\",\"codigo\":\"01-018\",\"cantidad\":\"5\",\"existencia\":44},{\"articulo\":\"CLIPS JUMBO\",\"codigo\":\"01-032\",\"cantidad\":\"3\",\"existencia\":152},{\"articulo\":\"CLIP DE BILLETERO 2 PULGADAS (PEQUEÑO)\",\"codigo\":\"01-029\",\"cantidad\":5,\"existencia\":19},{\"articulo\":\"ETIQUETAS P/ FOLDERS\",\"codigo\":\"01-046\",\"cantidad\":\"5\",\"existencia\":62},{\"articulo\":\"FOLDER PENDAFLEX 8 1/2 X 11\",\"codigo\":\"01-049\",\"cantidad\":\"4\",\"existencia\":15},{\"articulo\":\"GRAPAS DE 3/8\",\"codigo\":\"01-058\",\"cantidad\":4,\"existencia\":29},{\"articulo\":\"REGLAS PLÁSTICAS\",\"codigo\":\"01-091\",\"cantidad\":\"2\",\"existencia\":2},{\"articulo\":\"PAPEL CALCULAR\",\"codigo\":\"01-078\",\"cantidad\":\"6\",\"existencia\":37}]",despachado_por:"Edison Medina",despachado_por_id:12}
    ]
    results.sum_solicitudes_despachadas = await insertData('sum_solicitudes_despachadas', solicitudesDespachadas, transformUserId)
    console.log(`   ✅ ${results.sum_solicitudes_despachadas.success} solicitudes despachadas migradas`)
    
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
    console.error('\n❌ Error:', error)
    process.exit(1)
  } finally {
    await closeMySQL()
  }
}

main()

