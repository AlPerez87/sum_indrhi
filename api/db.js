/**
 * API Route para operaciones de base de datos MySQL
 * Funciona tanto en Vercel Serverless Functions como en servidor Express local
 */

import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Cargar variables de entorno
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '..', '.env') })

// Configuración de MySQL desde variables de entorno
// Prioridad: MYSQL_* (para servidor) > VITE_MYSQL_* (para frontend)
const mysqlConfig = {
  host: process.env.MYSQL_HOST || process.env.VITE_MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || process.env.VITE_MYSQL_PORT || '3306'),
  user: process.env.MYSQL_USER || process.env.VITE_MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || process.env.VITE_MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || process.env.VITE_MYSQL_DATABASE || 'sum_indrhi',
}

let pool = null

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      ...mysqlConfig,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    })
  }
  return pool
}

export async function query(sql, params = []) {
  const pool = getPool()
  try {
    const [results] = await pool.execute(sql, params)
    return results
  } catch (error) {
    console.error('MySQL Error:', error)
    throw error
  }
}

export async function select(table, conditions = {}, options = {}) {
  let sql = `SELECT * FROM ${table}`
  const params = []
  
  if (Object.keys(conditions).length > 0) {
    const whereClause = Object.keys(conditions)
      .map(key => {
        params.push(conditions[key])
        return `${key} = ?`
      })
      .join(' AND ')
    sql += ` WHERE ${whereClause}`
  }
  
  if (options.orderBy) {
    sql += ` ORDER BY ${options.orderBy}`
  }
  
  if (options.limit) {
    sql += ` LIMIT ${options.limit}`
  }
  
  return await query(sql, params)
}

export async function insert(table, data) {
  const keys = Object.keys(data)
  const values = keys.map(key => data[key])
  const placeholders = keys.map(() => '?').join(', ')
  const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`
  
  const pool = getPool()
  const [result] = await pool.execute(sql, values)
  return { id: result.insertId, ...data }
}

export async function update(table, id, data) {
  const keys = Object.keys(data)
  const values = [...Object.values(data), id]
  const setClause = keys.map(key => `${key} = ?`).join(', ')
  const sql = `UPDATE ${table} SET ${setClause} WHERE id = ?`
  
  await query(sql, values)
  return { id, ...data }
}

export async function remove(table, id) {
  const sql = `DELETE FROM ${table} WHERE id = ?`
  await query(sql, [id])
  return { success: true }
}

