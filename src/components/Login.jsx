import { useState } from 'react'
import { AlertCircle, Sun, Moon } from 'lucide-react'
import { authService } from '../services/authService'
import { useTheme } from '../context/ThemeContext'

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { theme, toggleTheme } = useTheme()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!username || !password) {
      setError('Por favor, complete todos los campos')
      return
    }

    setLoading(true)

    try {
      const result = await authService.login(username, password)
      
      if (result.success) {
        onLogin()
      } else {
        setError(result.message || 'Credenciales inválidas')
      }
    } catch (err) {
      setError('Error al conectar con el servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-800 dark:from-primary-900 dark:to-gray-900 p-4">
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 p-3 bg-white/10 hover:bg-white/20 dark:bg-gray-800/50 dark:hover:bg-gray-700/50 backdrop-blur-sm rounded-full transition-all duration-200 shadow-lg z-10"
        aria-label="Cambiar tema"
      >
        {theme === 'light' ? (
          <Moon className="w-5 h-5 text-white" />
        ) : (
          <Sun className="w-5 h-5 text-yellow-300" />
        )}
      </button>

      <div className="w-full max-w-md">
        <div className="card p-8 animate-slide-up">
          {/* Logo y Header */}
          <div className="text-center mb-8">
            <img 
              src="/logo-indrhi.png" 
              alt="INDRHI Logo" 
              className="max-w-[280px] h-auto mx-auto mb-6"
            />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Sistema de Suministros
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Instituto Nacional de Recursos Hidráulicos
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg animate-shake">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
              </div>
            )}

            {/* Username Field */}
            <div>
              <label 
                htmlFor="username" 
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
              >
                Usuario o Correo Electrónico
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingrese su usuario o correo"
                disabled={loading}
                autoComplete="username"
                className="input-field"
              />
            </div>

            {/* Password Field */}
            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingrese su contraseña"
                disabled={loading}
                autoComplete="current-password"
                className="input-field"
              />
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="w-full btn-primary flex items-center justify-center gap-2 mt-6"
              disabled={loading}
            >
              {loading && <div className="spinner-small"></div>}
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              &copy; 2025 INDRHI. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>

    </div>
  )
}

export default Login
