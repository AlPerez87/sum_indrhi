/**
 * Database Adapter
 * Permite cambiar entre Supabase y MySQL sin modificar el código de los servicios
 * 
 * NOTA: Para producción con Supabase, este archivo solo usa Supabase.
 * MySQL se carga dinámicamente solo cuando VITE_DATABASE_TYPE=mysql
 */

import { supabase } from './supabaseClient'
import { isSupabase, isMySQL } from '../config/database'

/**
 * Importación dinámica de mysqlClient solo cuando sea necesario
 * Esto evita problemas en el build cuando solo se usa Supabase
 * 
 * En producción (Vercel), usa mysqlClientApi que hace peticiones HTTP
 * En desarrollo local, usa mysqlClient que se conecta directamente
 */
let mysqlClientModule = null
const getMySQLClient = async () => {
  if (!isMySQL()) {
    return null
  }
  
  if (!mysqlClientModule) {
    try {
      // Siempre usar API Routes porque mysql2 no puede ejecutarse en el navegador
      // Las API Routes funcionan tanto en desarrollo como en producción
      mysqlClientModule = await import('./mysqlClientApi')
    } catch (error) {
      console.warn('MySQL client no disponible:', error)
      return null
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
 * Adaptador que proporciona una interfaz común para ambas bases de datos
 */
export const db = {
  /**
   * Selecciona registros de una tabla
   */
  from: (table) => ({
    select: async (columns = '*', options = {}) => {
      if (isSupabase()) {
        let query = supabase.from(table).select(columns)
        
        if (options.where) {
          Object.keys(options.where).forEach(key => {
            query = query.eq(key, options.where[key])
          })
        }
        
        if (options.orderBy) {
          const parts = options.orderBy.split(' ')
          const column = parts[0]
          const direction = parts[1]
          query = query.order(column, { ascending: direction !== 'desc' })
        }
        
        if (options.limit) {
          query = query.limit(options.limit)
        }
        
        const { data, error } = await query
        
        if (error) throw error
        return data
      } else {
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
      }
    },
    
    /**
     * Inserta un registro
     */
    insert: async (data) => {
      if (isSupabase()) {
        const { data: result, error } = await supabase
          .from(table)
          .insert(data)
          .select()
          .single()
        
        if (error) throw error
        return result
      } else {
        const client = await getMySQLClient()
        if (!client) {
          throw new Error('MySQL client no disponible')
        }
        const insertMySQL = getMySQLFunction(client, 'insertMySQL')
        if (!insertMySQL) {
          throw new Error('insertMySQL no disponible')
        }
        return await insertMySQL(table, data)
      }
    },
    
    /**
     * Actualiza un registro
     */
    update: async (id, data) => {
      if (isSupabase()) {
        const { data: result, error } = await supabase
          .from(table)
          .update(data)
          .eq('id', id)
          .select()
          .single()
        
        if (error) throw error
        return result
      } else {
        const client = await getMySQLClient()
        if (!client) {
          throw new Error('MySQL client no disponible')
        }
        const updateMySQL = getMySQLFunction(client, 'updateMySQL')
        if (!updateMySQL) {
          throw new Error('updateMySQL no disponible')
        }
        return await updateMySQL(table, id, data)
      }
    },
    
    /**
     * Elimina un registro
     */
    delete: async (id) => {
      if (isSupabase()) {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('id', id)
        
        if (error) throw error
        return { success: true }
      } else {
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
    },
    
    /**
     * Busca un registro por condiciones
     */
    findOne: async (conditions) => {
      if (isSupabase()) {
        let query = supabase.from(table).select('*')
        
        Object.keys(conditions).forEach(key => {
          query = query.eq(key, conditions[key])
        })
        
        const { data, error } = await query.single()
        
        if (error && error.code !== 'PGRST116') throw error
        return data || null
      } else {
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
      }
    },
    
    /**
     * Busca múltiples registros por condiciones
     */
    find: async (conditions = {}) => {
      if (isSupabase()) {
        let query = supabase.from(table).select('*')
        
        Object.keys(conditions).forEach(key => {
          query = query.eq(key, conditions[key])
        })
        
        const { data, error } = await query
        
        if (error) throw error
        return data || []
      } else {
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
    }
  }),
  
  /**
   * Autenticación (solo para Supabase, MySQL usa sistema propio)
   */
  getAuth: function() {
    return isSupabase() ? supabase.auth : null
  },
  
  /**
   * Ejecuta una query SQL personalizada (solo MySQL)
   */
  query: async function(sql, params) {
    params = params || []
    if (isMySQL()) {
      const client = await getMySQLClient()
      if (!client) {
        throw new Error('MySQL client no disponible')
      }
      const queryMySQL = getMySQLFunction(client, 'queryMySQL')
      if (!queryMySQL) {
        throw new Error('queryMySQL no disponible')
      }
      return await queryMySQL(sql, params)
    } else {
      throw new Error('Query SQL personalizada solo disponible en MySQL')
    }
  },
  
  /**
   * Inserta un registro en una tabla
   * @param {string} table - Nombre de la tabla
   * @param {object} data - Datos a insertar
   * @returns {Promise<object>} - Registro insertado
   */
  insert: async function(table, data) {
    if (isSupabase()) {
      const { data: result, error } = await supabase
        .from(table)
        .insert([data])
        .select()
        .single()
      
      if (error) throw error
      return result
    } else {
      const client = await getMySQLClient()
      if (!client) {
        throw new Error('MySQL client no disponible')
      }
      const insertMySQL = getMySQLFunction(client, 'insertMySQL')
      if (!insertMySQL) {
        throw new Error('insertMySQL no disponible')
      }
      return await insertMySQL(table, data)
    }
  },
  
  /**
   * Actualiza un registro en una tabla
   * @param {string} table - Nombre de la tabla
   * @param {number|string} id - ID del registro a actualizar
   * @param {object} data - Datos a actualizar
   * @returns {Promise<object>} - Registro actualizado
   */
  update: async function(table, id, data) {
    if (isSupabase()) {
      const { data: result, error } = await supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return result
    } else {
      const client = await getMySQLClient()
      if (!client) {
        throw new Error('MySQL client no disponible')
      }
      const updateMySQL = getMySQLFunction(client, 'updateMySQL')
      if (!updateMySQL) {
        throw new Error('updateMySQL no disponible')
      }
      return await updateMySQL(table, id, data)
    }
  },
  
  /**
   * Elimina un registro de una tabla
   * @param {string} table - Nombre de la tabla
   * @param {number|string} id - ID del registro a eliminar
   * @returns {Promise<object>} - Resultado de la eliminación
   */
  remove: async function(table, id) {
    if (isSupabase()) {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return { success: true }
    } else {
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
}

/**
 * Helper para construir queries complejas con joins (MySQL)
 */
export const buildJoinQuery = async function(baseTable, joins, conditions, options) {
  joins = joins || []
  conditions = conditions || {}
  options = options || {}
  
  if (isSupabase()) {
    let select = baseTable
    if (joins.length > 0) {
      const relations = joins.map(function(j) {
        const cols = j.columns || '*'
        return j.table + ':' + j.foreignKey + '(' + cols + ')'
      })
      select = baseTable + '(' + relations.join(', ') + ')'
    }
    
    let query = supabase.from(baseTable).select(select)
    
    Object.keys(conditions).forEach(function(key) {
      query = query.eq(key, conditions[key])
    })
    
    if (options.orderBy) {
      const parts = options.orderBy.split(' ')
      const column = parts[0]
      const direction = parts[1]
      query = query.order(column, { ascending: direction !== 'desc' })
    }
    
    const { data, error } = await query
    if (error) throw error
    return data
  } else {
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
}
