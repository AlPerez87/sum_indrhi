/**
 * Servidor de desarrollo para API Routes MySQL
 * Ejecuta: node server.js
 * 
 * Este servidor maneja las peticiones a /api/* y se conecta a MySQL
 */

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Cargar variables de entorno
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '.env') })

// Importar funciones de base de datos
import { select, insert, update, remove, query } from './api/db.js'
import authHandler from './api/auth.js'

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())

// Ruta de API para queries MySQL
app.all('/api/query', async (req, res) => {
  console.log(`📥 ${req.method} /api/query`, req.query)
  try {
    const { method } = req
    // Para GET/DELETE, leer de query params; para POST/PUT, leer de body y query params
    let table, where, data, id, sql, params
    
    if (method === 'GET' || method === 'DELETE') {
      ({ table, where, data, id, sql, params } = req.query)
    } else {
      // POST/PUT: combinar query params y body
      const queryData = req.query
      const bodyData = req.body || {}
      table = queryData.table || bodyData.table
      where = queryData.where || bodyData.where
      data = queryData.data || bodyData.data
      id = queryData.id || bodyData.id
      sql = queryData.sql || bodyData.sql
      params = queryData.params || bodyData.params
    }

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
})

// Ruta de autenticación
app.post('/api/auth', async (req, res) => {
  console.log('🔐 POST /api/auth recibido')
  console.log('   Body:', JSON.stringify(req.body, null, 2))
  
  try {
    // Asegurar que los headers sean correctos
    res.setHeader('Content-Type', 'application/json')
    
    // Llamar al handler
    await authHandler(req, res)
  } catch (error) {
    console.error('❌ Error en /api/auth:', error)
    console.error('   Stack:', error.stack)
    
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'application/json')
      res.status(500).json({ 
        error: error.message,
        success: false 
      })
    }
  }
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MySQL API Server running' })
})

app.listen(PORT, () => {
  console.log(`🚀 MySQL API Server running on http://localhost:${PORT}`)
  console.log(`📊 Database: ${process.env.VITE_MYSQL_DATABASE || 'sum_indrhi'}`)
})

