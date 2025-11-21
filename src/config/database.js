/**
 * Configuración de Base de Datos
 * Sistema configurado para usar MySQL únicamente
 */

export const DATABASE_CONFIG = {
  mysql: {
    host: import.meta.env.VITE_MYSQL_HOST || 'localhost',
    port: parseInt(import.meta.env.VITE_MYSQL_PORT || '3306'),
    user: import.meta.env.VITE_MYSQL_USER || 'root',
    password: import.meta.env.VITE_MYSQL_PASSWORD || '',
    database: import.meta.env.VITE_MYSQL_DATABASE || 'sum_indrhi',
    connectionLimit: parseInt(import.meta.env.VITE_MYSQL_CONNECTION_LIMIT || '10'),
  }
}

export const isMySQL = () => true

