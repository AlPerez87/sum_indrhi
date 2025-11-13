import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import Panel from './components/Panel'
import Articulos from './components/Articulos'
import EntradaMercancia from './components/EntradaMercancia'
import SolicitudArticulos from './components/SolicitudArticulos'
import AutorizarSolicitudes from './components/AutorizarSolicitudes'
import SolicitudesAprobadas from './components/SolicitudesAprobadas'
import SolicitudesGestionadas from './components/SolicitudesGestionadas'
import SolicitudesDespachadas from './components/SolicitudesDespachadas'
import Departamentos from './components/Departamentos'
import Usuarios from './components/Usuarios'
import RequireRole from './components/RequireRole'
import { authService } from './services/authService'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('indrhi_token')
    if (token) {
      const isValid = await authService.validateToken(token)
      setIsAuthenticated(isValid)
    }
    setLoading(false)
  }

  const handleLogin = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    authService.logout()
    setIsAuthenticated(false)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="spinner"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando...</p>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? 
            <Navigate to="/dashboard" replace /> : 
            <Login onLogin={handleLogin} />
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            isAuthenticated ? 
            <Dashboard onLogout={handleLogout}>
              <Panel />
            </Dashboard> : 
            <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/articulos" 
          element={
            isAuthenticated ? 
            <Dashboard onLogout={handleLogout}>
              <RequireRole roles={['Administrador', 'Encargado de suministro']}>
                <Articulos />
              </RequireRole>
            </Dashboard> : 
            <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/entrada-mercancia" 
          element={
            isAuthenticated ? 
            <Dashboard onLogout={handleLogout}>
              <RequireRole roles={['Administrador', 'Encargado de suministro']}>
                <EntradaMercancia />
              </RequireRole>
            </Dashboard> : 
            <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/solicitud-articulos" 
          element={
            isAuthenticated ? 
            <Dashboard onLogout={handleLogout}>
              <SolicitudArticulos />
            </Dashboard> : 
            <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/autorizar-solicitudes" 
          element={
            isAuthenticated ? 
            <Dashboard onLogout={handleLogout}>
              <RequireRole roles={['Administrador', 'Director', 'Encargado de suministro']}>
                <AutorizarSolicitudes />
              </RequireRole>
            </Dashboard> : 
            <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/solicitudes-aprobadas" 
          element={
            isAuthenticated ? 
            <Dashboard onLogout={handleLogout}>
              <RequireRole roles={['Administrador', 'Encargado de suministro']}>
                <SolicitudesAprobadas />
              </RequireRole>
            </Dashboard> : 
            <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/solicitudes-gestionadas" 
          element={
            isAuthenticated ? 
            <Dashboard onLogout={handleLogout}>
              <RequireRole roles={['Administrador', 'Encargado de suministro']}>
                <SolicitudesGestionadas />
              </RequireRole>
            </Dashboard> : 
            <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/solicitudes-despachadas" 
          element={
            isAuthenticated ? 
            <Dashboard onLogout={handleLogout}>
              <SolicitudesDespachadas />
            </Dashboard> : 
            <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/departamentos" 
          element={
            isAuthenticated ? 
            <Dashboard onLogout={handleLogout}>
              <RequireRole roles={['Administrador']}>
                <Departamentos />
              </RequireRole>
            </Dashboard> : 
            <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/usuarios" 
          element={
            isAuthenticated ? 
            <Dashboard onLogout={handleLogout}>
              <RequireRole roles={['Administrador']}>
                <Usuarios />
              </RequireRole>
            </Dashboard> : 
            <Navigate to="/login" replace />
          } 
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}

export default App
