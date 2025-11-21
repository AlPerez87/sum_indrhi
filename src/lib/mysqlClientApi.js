/**
 * Cliente MySQL usando API Routes (para Vercel/Producción)
 * Este cliente hace peticiones HTTP a las API Routes en lugar de conectarse directamente
 */

// En desarrollo, usar el servidor Express en puerto 3000
// En producción (Vercel), usar la ruta relativa /api
const API_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:3000' 
  : (import.meta.env.VITE_API_URL || '')

/**
 * Hace una petición a la API
 */
async function apiRequest(endpoint, options = {}) {
  // Asegurar que el endpoint comience con /api
  const apiEndpoint = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`
  const url = `${API_BASE_URL}${apiEndpoint}`
  
  // Logs solo en modo desarrollo y solo para errores
  const isDev = import.meta.env.DEV
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { error: response.statusText || `HTTP ${response.status}` }
      }
      console.error('❌ API Error:', {
        url,
        status: response.status,
        error: errorData.error || errorData.message
      })
      throw new Error(errorData.error || `API Error: ${response.status}`)
    }

    const data = await response.json()
    // Solo log en desarrollo si hay un problema obvio
    if (isDev && data && Array.isArray(data) && data.length === 0) {
      // No loggear arrays vacíos, es normal
    }
    return data
  } catch (error) {
    console.error('❌ Fetch Error:', {
      url,
      method: options.method || 'GET',
      error: error.message
    })
    throw error
  }
}

/**
 * Ejecuta una query SQL y retorna los resultados
 */
export const queryMySQL = async (sql, params = []) => {
  // Codificar el SQL correctamente
  const queryParams = new URLSearchParams()
  queryParams.append('sql', sql)
  queryParams.append('params', JSON.stringify(params))
  
  const url = `/api/query?${queryParams.toString()}`
  return await apiRequest(url, { method: 'GET' })
}

/**
 * Ejecuta una query y retorna el primer resultado
 */
export const queryOneMySQL = async (sql, params = []) => {
  const results = await queryMySQL(sql, params)
  return results[0] || null
}

/**
 * Selecciona registros de una tabla
 */
export const selectMySQL = async (table, conditions = {}, options = {}) => {
  const queryParams = new URLSearchParams({
    table,
    where: JSON.stringify(conditions),
  })
  
  if (options.orderBy) {
    queryParams.append('orderBy', options.orderBy)
  }
  if (options.limit) {
    queryParams.append('limit', options.limit.toString())
  }
  
  return await apiRequest(`/query?${queryParams.toString()}`, { method: 'GET' })
}

/**
 * Inserta un registro y retorna el ID insertado
 */
export const insertMySQL = async (table, data) => {
  const queryParams = new URLSearchParams({
    table,
    data: JSON.stringify(data),
  })
  return await apiRequest(`/query?${queryParams.toString()}`, { method: 'POST' })
}

/**
 * Actualiza un registro
 */
export const updateMySQL = async (table, id, data) => {
  const queryParams = new URLSearchParams({
    table,
    id: id.toString(),
    data: JSON.stringify(data),
  })
  return await apiRequest(`/query?${queryParams.toString()}`, { method: 'PUT' })
}

/**
 * Elimina un registro
 */
export const deleteMySQL = async (table, id) => {
  const queryParams = new URLSearchParams({
    table,
    id: id.toString(),
  })
  return await apiRequest(`/query?${queryParams.toString()}`, { method: 'DELETE' })
}

