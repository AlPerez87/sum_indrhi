/**
 * Database Adapter
 * Permite cambiar entre Supabase y MySQL sin modificar el código de los servicios
 */

import { supabase } from './supabaseClient'
import { isSupabase, isMySQL } from '../config/database'
import * as mysqlClient from './mysqlClient'

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
          const [column, direction] = options.orderBy.split(' ')
          query = query.order(column, { ascending: direction !== 'desc' })
        }
        
        if (options.limit) {
          query = query.limit(options.limit)
        }
        
        const { data, error } = await query
        
        if (error) throw error
        return data
      } else {
        // MySQL
        const conditions = options.where || {}
        const mysqlOptions = {
          orderBy: options.orderBy,
          limit: options.limit
        }
        return await mysqlClient.selectMySQL(table, conditions, mysqlOptions)
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
        return await mysqlClient.insertMySQL(table, data)
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
        return await mysqlClient.updateMySQL(table, id, data)
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
        return await mysqlClient.deleteMySQL(table, id)
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
        
        if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned
        return data || null
      } else {
        return await mysqlClient.queryOneMySQL(
          `SELECT * FROM ${table} WHERE ${Object.keys(conditions).map(k => `${k} = ?`).join(' AND ')}`,
          Object.values(conditions)
        )
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
        return await mysqlClient.selectMySQL(table, conditions)
      }
    }
  },
  
  /**
   * Autenticación (solo para Supabase, MySQL usa sistema propio)
   */
  auth: isSupabase() ? supabase.auth : null,
  
  /**
   * Ejecuta una query SQL personalizada (solo MySQL)
   */
  query: async (sql, params = []) => {
    if (isMySQL()) {
      return await mysqlClient.queryMySQL(sql, params)
    } else {
      throw new Error('Query SQL personalizada solo disponible en MySQL')
    }
  }
}

/**
 * Helper para construir queries complejas con joins (MySQL)
 */
export const buildJoinQuery = async (baseTable, joins = [], conditions = {}, options = {}) => {
  if (isSupabase()) {
    // Para Supabase, usar select con relaciones
    let select = baseTable
    if (joins.length > 0) {
      const relations = joins.map(j => `${j.table}:${j.foreignKey}(${j.columns || '*'})`).join(', ')
      select = `${baseTable}(${relations})`
    }
    
    let query = supabase.from(baseTable).select(select)
    
    Object.keys(conditions).forEach(key => {
      query = query.eq(key, conditions[key])
    })
    
    if (options.orderBy) {
      const [column, direction] = options.orderBy.split(' ')
      query = query.order(column, { ascending: direction !== 'desc' })
    }
    
    const { data, error } = await query
    if (error) throw error
    return data
  } else {
    // MySQL: construir JOIN manualmente
    let sql = `SELECT ${baseTable}.*`
    
    joins.forEach(join => {
      sql += `, ${join.table}.${join.columns || '*'}`
    })
    
    sql += ` FROM ${baseTable}`
    
    joins.forEach(join => {
      sql += ` LEFT JOIN ${join.table} ON ${baseTable}.${join.foreignKey} = ${join.table}.${join.on}`
    })
    
    if (Object.keys(conditions).length > 0) {
      const whereClause = Object.keys(conditions)
        .map(key => `${baseTable}.${key} = ?`)
        .join(' AND ')
      sql += ` WHERE ${whereClause}`
    }
    
    if (options.orderBy) {
      sql += ` ORDER BY ${options.orderBy}`
    }
    
    return await mysqlClient.queryMySQL(sql, Object.values(conditions))
  }
}

