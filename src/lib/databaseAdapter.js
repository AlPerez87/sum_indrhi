/**
 * Database Adapter
 * Sistema configurado para usar MySQL únicamente
 * 
 * En producción (Vercel), usa mysqlClientApi que hace peticiones HTTP
 * En desarrollo local, usa mysqlClient que se conecta directamente
 */

import { isMySQL } from '../config/database'

/**
 * Importación dinámica de mysqlClient
 * Siempre usar API Routes porque mysql2 no puede ejecutarse en el navegador
 * Las API Routes funcionan tanto en desarrollo como en producción
 */
let mysqlClientModule = null
const getMySQLClient = async () => {
  if (!isMySQL()) {
    throw new Error('MySQL no está configurado')
  }
  
  if (!mysqlClientModule) {
    try {
      mysqlClientModule = await import('./mysqlClientApi')
    } catch (error) {
      console.error('MySQL client no disponible:', error)
      throw new Error('MySQL client no disponible')
    }
  }
  return mysqlClientModule
}

/**
 * Helper para obtener funciones de MySQL de forma segura
 */
const getMySQLFunction = (client, functionName) => {
  if (!client) return null
  return client[functionName] || (client.default && client.default[functionName])
}

/**
 * Adaptador que proporciona una interfaz común para MySQL
 */
export const db = {
  /**
   * Selecciona registros de una tabla
   */
  from: (table) => ({
    select: async (columns = '*', options = {}) => {
      const client = await getMySQLClient()
      if (!client) {
        throw new Error('MySQL client no disponible')
      }
      const selectMySQL = getMySQLFunction(client, 'selectMySQL')
      if (!selectMySQL) {
        throw new Error('selectMySQL no disponible')
      }
      const conditions = options.where || {}
      const mysqlOptions = {
        orderBy: options.orderBy,
        limit: options.limit
      }
      return await selectMySQL(table, conditions, mysqlOptions)
    },
    
    /**
     * Inserta un registro
     */
    insert: async (data) => {
      const client = await getMySQLClient()
      if (!client) {
        throw new Error('MySQL client no disponible')
      }
      const insertMySQL = getMySQLFunction(client, 'insertMySQL')
      if (!insertMySQL) {
        throw new Error('insertMySQL no disponible')
      }
      return await insertMySQL(table, data)
    },
    
    /**
     * Actualiza un registro
     */
    update: async (id, data) => {
      const client = await getMySQLClient()
      if (!client) {
        throw new Error('MySQL client no disponible')
      }
      const updateMySQL = getMySQLFunction(client, 'updateMySQL')
      if (!updateMySQL) {
        throw new Error('updateMySQL no disponible')
      }
      return await updateMySQL(table, id, data)
    },
    
    /**
     * Elimina un registro
     */
    delete: async (id) => {
      const client = await getMySQLClient()
      if (!client) {
        throw new Error('MySQL client no disponible')
      }
      const deleteMySQL = getMySQLFunction(client, 'deleteMySQL')
      if (!deleteMySQL) {
        throw new Error('deleteMySQL no disponible')
      }
      return await deleteMySQL(table, id)
    },
    
    /**
     * Busca un registro por condiciones
     */
    findOne: async (conditions) => {
      const client = await getMySQLClient()
      if (!client) {
        throw new Error('MySQL client no disponible')
      }
      const queryOneMySQL = getMySQLFunction(client, 'queryOneMySQL')
      if (!queryOneMySQL) {
        throw new Error('queryOneMySQL no disponible')
      }
      const keys = Object.keys(conditions)
      const whereParts = keys.map(function(k) { return k + ' = ?' })
      const whereClause = whereParts.join(' AND ')
      const sql = 'SELECT * FROM ' + table + ' WHERE ' + whereClause
      return await queryOneMySQL(sql, Object.values(conditions))
    },
    
    /**
     * Busca múltiples registros por condiciones
     */
    find: async (conditions = {}) => {
      const client = await getMySQLClient()
      if (!client) {
        throw new Error('MySQL client no disponible')
      }
      const selectMySQL = getMySQLFunction(client, 'selectMySQL')
      if (!selectMySQL) {
        throw new Error('selectMySQL no disponible')
      }
      return await selectMySQL(table, conditions)
    }
  }),
  
  /**
   * Ejecuta una query SQL personalizada
   */
  query: async function(sql, params) {
    params = params || []
    const client = await getMySQLClient()
    if (!client) {
      throw new Error('MySQL client no disponible')
    }
    const queryMySQL = getMySQLFunction(client, 'queryMySQL')
    if (!queryMySQL) {
      throw new Error('queryMySQL no disponible')
    }
    return await queryMySQL(sql, params)
  },
  
  /**
   * Inserta un registro en una tabla
   * @param {string} table - Nombre de la tabla
   * @param {object} data - Datos a insertar
   * @returns {Promise<object>} - Registro insertado
   */
  insert: async function(table, data) {
    const client = await getMySQLClient()
    if (!client) {
      throw new Error('MySQL client no disponible')
    }
    const insertMySQL = getMySQLFunction(client, 'insertMySQL')
    if (!insertMySQL) {
      throw new Error('insertMySQL no disponible')
    }
    return await insertMySQL(table, data)
  },
  
  /**
   * Actualiza un registro en una tabla
   * @param {string} table - Nombre de la tabla
   * @param {number|string} id - ID del registro a actualizar
   * @param {object} data - Datos a actualizar
   * @returns {Promise<object>} - Registro actualizado
   */
  update: async function(table, id, data) {
    const client = await getMySQLClient()
    if (!client) {
      throw new Error('MySQL client no disponible')
    }
    const updateMySQL = getMySQLFunction(client, 'updateMySQL')
    if (!updateMySQL) {
      throw new Error('updateMySQL no disponible')
    }
    return await updateMySQL(table, id, data)
  },
  
  /**
   * Elimina un registro de una tabla
   * @param {string} table - Nombre de la tabla
   * @param {number|string} id - ID del registro a eliminar
   * @returns {Promise<object>} - Resultado de la eliminación
   */
  remove: async function(table, id) {
    const client = await getMySQLClient()
    if (!client) {
      throw new Error('MySQL client no disponible')
    }
    const deleteMySQL = getMySQLFunction(client, 'deleteMySQL')
    if (!deleteMySQL) {
      throw new Error('deleteMySQL no disponible')
    }
    return await deleteMySQL(table, id)
  }
}

/**
 * Helper para construir queries complejas con joins (MySQL)
 */
export const buildJoinQuery = async function(baseTable, joins, conditions, options) {
  joins = joins || []
  conditions = conditions || {}
  options = options || {}
  
  let sql = 'SELECT ' + baseTable + '.*'
  
  joins.forEach(function(join) {
    const cols = join.columns || '*'
    sql += ', ' + join.table + '.' + cols
  })
  
  sql += ' FROM ' + baseTable
  
  joins.forEach(function(join) {
    sql += ' LEFT JOIN ' + join.table + ' ON ' + baseTable + '.' + join.foreignKey + ' = ' + join.table + '.' + join.on
  })
  
  if (Object.keys(conditions).length > 0) {
    const keys = Object.keys(conditions)
    const whereParts = keys.map(function(key) {
      return baseTable + '.' + key + ' = ?'
    })
    sql += ' WHERE ' + whereParts.join(' AND ')
  }
  
  if (options.orderBy) {
    sql += ' ORDER BY ' + options.orderBy
  }
  
  const client = await getMySQLClient()
  if (!client) {
    throw new Error('MySQL client no disponible')
  }
  const queryMySQL = getMySQLFunction(client, 'queryMySQL')
  if (!queryMySQL) {
    throw new Error('queryMySQL no disponible')
  }
  return await queryMySQL(sql, Object.values(conditions))
}
