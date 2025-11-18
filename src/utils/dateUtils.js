/**
 * Utilidades para manejo de fechas con zona horaria de Santo Domingo, República Dominicana
 * Zona horaria: America/Santo_Domingo (UTC-4)
 */

/**
 * Obtiene la fecha actual en la zona horaria de Santo Domingo
 * @returns {Date} Fecha actual en zona horaria de Santo Domingo
 */
export const getSantoDomingoDate = () => {
  const now = new Date()
  // Convertir a zona horaria de Santo Domingo (UTC-4)
  const santoDomingoTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Santo_Domingo' }))
  return santoDomingoTime
}

/**
 * Formatea una fecha a string ISO (YYYY-MM-DD) usando la zona horaria de Santo Domingo
 * @param {Date|string} date - Fecha a formatear
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
export const formatDateToISO = (date) => {
  if (!date) {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  
  // Si ya es una fecha ISO (YYYY-MM-DD), retornarla directamente
  if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return date
  }
  
  const dateObj = date instanceof Date ? date : new Date(date)
  
  // Obtener fecha en zona horaria de Santo Domingo usando Intl.DateTimeFormat
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Santo_Domingo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
  
  return formatter.format(dateObj)
}

/**
 * Formatea una fecha para mostrar usando la zona horaria de Santo Domingo
 * @param {Date|string} date - Fecha a formatear
 * @param {Object} options - Opciones de formato (mismas que toLocaleDateString)
 * @returns {string} Fecha formateada
 */
export const formatDate = (date, options = {}) => {
  const dateObj = date instanceof Date ? date : new Date(date)
  
  // Si la fecha viene como string sin hora, agregar hora local de Santo Domingo
  let dateToFormat = dateObj
  
  if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    // Es una fecha sin hora, crear fecha en zona horaria de Santo Domingo
    const [year, month, day] = date.split('-')
    dateToFormat = new Date(`${year}-${month}-${day}T00:00:00-04:00`)
  }
  
  return dateToFormat.toLocaleDateString('es-DO', {
    timeZone: 'America/Santo_Domingo',
    ...options
  })
}

/**
 * Formatea una fecha con hora usando la zona horaria de Santo Domingo
 * @param {Date|string} date - Fecha a formatear
 * @param {Object} options - Opciones de formato
 * @returns {string} Fecha y hora formateada
 */
export const formatDateTime = (date, options = {}) => {
  const dateObj = date instanceof Date ? date : new Date(date)
  
  return dateObj.toLocaleString('es-DO', {
    timeZone: 'America/Santo_Domingo',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options
  })
}

/**
 * Obtiene la fecha actual en formato ISO (YYYY-MM-DD) usando zona horaria de Santo Domingo
 * @returns {string} Fecha actual en formato YYYY-MM-DD
 */
export const getTodayISO = () => {
  return formatDateToISO(getSantoDomingoDate())
}

/**
 * Obtiene el año actual en zona horaria de Santo Domingo
 * @returns {number} Año actual
 */
export const getCurrentYear = () => {
  return getSantoDomingoDate().getFullYear()
}

