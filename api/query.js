/**
 * API Route para queries MySQL
 * GET /api/query?table=sum_articulos&where={"id":1}
 */

import { select, insert, update, remove, query } from './db.js'

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    const { method } = req
    const { table, action, where, data, id, sql, params } = req.query

    if (!table && !sql) {
      return res.status(400).json({ error: 'Table or SQL query required' })
    }

    let result

    switch (method) {
      case 'GET':
        if (sql) {
          // Query SQL personalizada
          const parsedParams = params ? JSON.parse(params) : []
          result = await query(sql, parsedParams)
        } else {
          // SELECT
          const conditions = where ? JSON.parse(where) : {}
          const options = {
            orderBy: req.query.orderBy,
            limit: req.query.limit ? parseInt(req.query.limit) : undefined,
          }
          result = await select(table, conditions, options)
        }
        break

      case 'POST':
        if (!data) {
          return res.status(400).json({ error: 'Data required for INSERT' })
        }
        const insertData = typeof data === 'string' ? JSON.parse(data) : data
        result = await insert(table, insertData)
        break

      case 'PUT':
        if (!id || !data) {
          return res.status(400).json({ error: 'ID and data required for UPDATE' })
        }
        const updateData = typeof data === 'string' ? JSON.parse(data) : data
        result = await update(table, parseInt(id), updateData)
        break

      case 'DELETE':
        if (!id) {
          return res.status(400).json({ error: 'ID required for DELETE' })
        }
        result = await remove(table, parseInt(id))
        break

      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }

    return res.status(200).json(result)
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ error: error.message })
  }
}

