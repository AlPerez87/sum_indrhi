/**
 * Configuración de Base de Datos
 * Permite cambiar entre Supabase y MySQL fácilmente
 */

export const DATABASE_TYPE = import.meta.env.VITE_DATABASE_TYPE || 'supabase' // 'supabase' o 'mysql'

export const DATABASE_CONFIG = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
  mysql: {
    host: import.meta.env.VITE_MYSQL_HOST || 'localhost',
    port: parseInt(import.meta.env.VITE_MYSQL_PORT || '3306'),
    user: import.meta.env.VITE_MYSQL_USER || 'root',
    password: import.meta.env.VITE_MYSQL_PASSWORD || '',
    database: import.meta.env.VITE_MYSQL_DATABASE || 'sum_indrhi',
    connectionLimit: parseInt(import.meta.env.VITE_MYSQL_CONNECTION_LIMIT || '10'),
  }
}

export const isSupabase = () => DATABASE_TYPE === 'supabase'
export const isMySQL = () => DATABASE_TYPE === 'mysql'

