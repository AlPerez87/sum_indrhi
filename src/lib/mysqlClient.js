/**
 * Cliente MySQL usando mysql2
 * Solo se carga si DATABASE_TYPE es 'mysql'
 */

let mysqlPool = null

export const initMySQL = async () => {
  if (mysqlPool) return mysqlPool

  try {
    const mysql = await import('mysql2/promise')
    const { DATABASE_CONFIG } = await import('../config/database.js')

    mysqlPool = mysql.createPool({
      host: DATABASE_CONFIG.mysql.host,
      port: DATABASE_CONFIG.mysql.port,
      user: DATABASE_CONFIG.mysql.user,
      password: DATABASE_CONFIG.mysql.password,
      database: DATABASE_CONFIG.mysql.database,
      waitForConnections: true,
      connectionLimit: DATABASE_CONFIG.mysql.connectionLimit,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    })

    return mysqlPool
  } catch (error) {
    console.error('Error inicializando MySQL:', error)
    throw error
  }
}

export const getMySQLPool = () => {
  if (!mysqlPool) {
    throw new Error('MySQL no está inicializado. Llama a initMySQL() primero.')
  }
  return mysqlPool
}

export const closeMySQL = async () => {
  if (mysqlPool) {
    await mysqlPool.end()
    mysqlPool = null
  }
}

/**
 * Ejecuta una query SQL y retorna los resultados
 */
export const queryMySQL = async (sql, params = []) => {
  const pool = await initMySQL()
  const [rows] = await pool.execute(sql, params)
  return rows
}

/**
 * Ejecuta una query y retorna el primer resultado
 */
export const queryOneMySQL = async (sql, params = []) => {
  const results = await queryMySQL(sql, params)
  return results[0] || null
}

/**
 * Inserta un registro y retorna el ID insertado
 */
export const insertMySQL = async (table, data) => {
  const pool = await initMySQL()
  const keys = Object.keys(data)
  const values = Object.values(data)
  const placeholders = keys.map(() => '?').join(', ')
  
  const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`
  const [result] = await pool.execute(sql, values)
  
  return {
    id: result.insertId,
    ...data
  }
}

/**
 * Actualiza un registro
 */
export const updateMySQL = async (table, id, data) => {
  const pool = await initMySQL()
  const keys = Object.keys(data)
  const values = Object.values(data)
  const setClause = keys.map(key => `${key} = ?`).join(', ')
  
  const sql = `UPDATE ${table} SET ${setClause} WHERE id = ?`
  await pool.execute(sql, [...values, id])
  
  return {
    id,
    ...data
  }
}

/**
 * Elimina un registro
 */
export const deleteMySQL = async (table, id) => {
  const pool = await initMySQL()
  await pool.execute(`DELETE FROM ${table} WHERE id = ?`, [id])
  return { success: true }
}

/**
 * Selecciona registros con condiciones opcionales
 */
export const selectMySQL = async (table, conditions = {}, options = {}) => {
  const pool = await initMySQL()
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
  
  return await queryMySQL(sql, params)
}

