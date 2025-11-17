import { useState, useEffect } from 'react'
import { 
  Package, 
  FileText, 
  CheckCircle, 
  Truck, 
  AlertTriangle,
  TrendingUp,
  Users,
  Building2,
  Clock,
  BarChart3
} from 'lucide-react'
import { crmService } from '../services/crmService'
import { authService } from '../services/authService'

const Panel = () => {
  const [stats, setStats] = useState({
    totalArticulos: 0,
    articulosBajoStock: 0,
    solicitudesPendientes: 0,
    solicitudesAprobadas: 0,
    solicitudesGestionadas: 0,
    solicitudesDespachadas: 0,
    totalDepartamentos: 0,
    totalUsuarios: 0
  })
  const [loading, setLoading] = useState(true)
  const [recentActivity, setRecentActivity] = useState([])
  const user = authService.getCurrentUser()

  // Verificar si el usuario puede ver todas las solicitudes (Encargado de Suministro o Suministro)
  const canViewAllSolicitudes = () => {
    if (!user) return false
    const userRole = user.roles?.[0] || user.perfil || user.rol || ''
    const roleLower = userRole.toLowerCase()
    return roleLower === 'administrador' || 
           roleLower === 'encargado de suministro' || 
           roleLower === 'suministro'
  }

  useEffect(() => {
    loadDashboardData(true)
    
    // Actualizar datos cada 30 segundos
    const interval = setInterval(() => {
      loadDashboardData(false)
    }, 30000)
    
    // Actualizar cuando la ventana recupera el foco
    const handleFocus = () => {
      loadDashboardData(false)
    }
    window.addEventListener('focus', handleFocus)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const loadDashboardData = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true)
    }
    
    try {
      const canViewAll = canViewAllSolicitudes()
      
      // Cargar estadísticas en paralelo
      const [
        articulosRes,
        solicitudesRes,
        pendientesRes,
        approbadasRes,
        gestionadasRes,
        despachadasRes,
        deptosRes,
        usuariosRes
      ] = await Promise.all([
        crmService.getArticulos(1, 10000, ''), // Obtener todos los artículos
        crmService.getSolicitudes(),
        crmService.getAutorizarSolicitudes(), // Obtener solicitudes pendientes de autorización
        crmService.getSolicitudesAprobadas(),
        crmService.getSolicitudesGestionadas(),
        crmService.getSolicitudesDespachadas(),
        crmService.getDepartamentos(1, 10000, ''), // Obtener todos los departamentos
        crmService.getUsuariosDepartamentos()
      ])

      // Calcular artículos con bajo stock (existencia < cantidad_minima)
      const articulosBajo = articulosRes.success 
        ? articulosRes.data.filter(a => {
            const existencia = parseFloat(a.existencia || 0)
            const minimo = parseFloat(a.cantidad_minima || 0)
            return minimo > 0 && existencia < minimo
          }).length 
        : 0

      // Filtrar solicitudes pendientes
      const pendientes = solicitudesRes.success
        ? solicitudesRes.data.filter(s => s.estado === 'borrador' || s.estado === 'pendiente').length
        : 0

      setStats({
        totalArticulos: articulosRes.success ? articulosRes.data.length : 0,
        articulosBajoStock: articulosBajo,
        solicitudesPendientes: pendientes,
        solicitudesAprobadas: solicitudesAprobadas,
        solicitudesGestionadas: solicitudesGestionadas,
        solicitudesDespachadas: solicitudesDespachadas,
        totalDepartamentos: deptosRes.success ? deptosRes.data.length : 0,
        totalUsuarios: usuariosRes.success ? usuariosRes.data.length : 0
      })

      // Actividad reciente
      // Para Encargado de Suministro y Suministro: combinar todas las solicitudes de todas las tablas
      // Para otros usuarios: solo solicitudes de su departamento
      if (canViewAll) {
        // Combinar todas las solicitudes de todas las tablas
        const allSolicitudes = []
        
        if (solicitudesRes.success) {
          allSolicitudes.push(...solicitudesRes.data.map(s => ({
            ...s,
            tipo: 'pendiente'
          })))
        }
        if (approbadasRes.success && approbadasRes.data) {
          allSolicitudes.push(...approbadasRes.data.filter(s => s && s.id).map(s => ({
            ...s,
            tipo: 'aprobada',
            estado: 'aprobada',
            departamento: s.departamento || 'N/A',
            total_articulos: s.total_articulos || 0
          })))
        }
        if (gestionadasRes.success && gestionadasRes.data) {
          allSolicitudes.push(...gestionadasRes.data.filter(s => s && s.id).map(s => ({
            ...s,
            tipo: 'gestionada',
            estado: 'gestionada',
            departamento: s.departamento || 'N/A',
            total_articulos: s.total_articulos || 0
          })))
        }
        if (despachadasRes.success && despachadasRes.data) {
          allSolicitudes.push(...despachadasRes.data.filter(s => s && s.id).map(s => ({
            ...s,
            tipo: 'despachada',
            estado: 'despachada',
            departamento: s.departamento || 'N/A',
            total_articulos: s.total_articulos || 0
          })))
        }
        
        // Ordenar por fecha y tomar las últimas 5
        const recent = allSolicitudes
          .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
          .slice(0, 5)
        setRecentActivity(recent)
      } else {
        // Solo solicitudes del departamento del usuario
        if (solicitudesRes.success) {
          const recent = solicitudesRes.data
            .map(s => ({
              ...s,
              tipo: s.enviada ? 'enviada' : 'pendiente'
            }))
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
            .slice(0, 5)
          setRecentActivity(recent)
        }
      }

    } catch (error) {
      console.error('Error al cargar datos del panel:', error)
    } finally {
      if (showLoading) {
        setLoading(false)
      }
    }
  }

  const StatCard = ({ title, value, icon: Icon, color, trend, onClick }) => (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-lg hover:scale-105' : ''
      }`}
      style={{ borderLeftColor: color }}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {loading ? '...' : value}
          </p>
          {trend && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {trend}
            </p>
          )}
        </div>
        <div 
          className="p-3 rounded-full"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-8 h-8" style={{ color }} />
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner"></div>
        <p className="ml-4 text-gray-600 dark:text-gray-400">Cargando estadísticas...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas principales */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-6 h-6" />
          Estadísticas Generales
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Artículos"
            value={stats.totalArticulos}
            icon={Package}
            color="#3B82F6"
          />
          <StatCard
            title="Artículos Bajo Stock"
            value={stats.articulosBajoStock}
            icon={AlertTriangle}
            color="#EF4444"
          />
          <StatCard
            title="Departamentos"
            value={stats.totalDepartamentos}
            icon={Building2}
            color="#8B5CF6"
          />
          <StatCard
            title="Usuarios Activos"
            value={stats.totalUsuarios}
            icon={Users}
            color="#10B981"
          />
        </div>
      </div>

      {/* Flujo de Solicitudes */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FileText className="w-6 h-6" />
          Flujo de Solicitudes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Pendientes"
            value={stats.solicitudesPendientes}
            icon={Clock}
            color="#F59E0B"
          />
          <StatCard
            title="Aprobadas"
            value={stats.solicitudesAprobadas}
            icon={CheckCircle}
            color="#10B981"
          />
          <StatCard
            title="En Gestión"
            value={stats.solicitudesGestionadas}
            icon={Package}
            color="#3B82F6"
          />
          <StatCard
            title="Despachadas"
            value={stats.solicitudesDespachadas}
            icon={Truck}
            color="#6366F1"
          />
        </div>
      </div>

      {/* Actividad Reciente */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Clock className="w-6 h-6" />
          Actividad Reciente
        </h2>
        {recentActivity.length > 0 ? (
          <div className="space-y-3">
            {recentActivity.map((solicitud) => (
              <div 
                key={solicitud.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary-600" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Solicitud #{solicitud.numero_solicitud}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {solicitud.departamento} - {solicitud.total_articulos} artículo(s)
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    solicitud.tipo === 'despachada' 
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      : solicitud.tipo === 'gestionada'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : solicitud.tipo === 'aprobada'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : solicitud.estado === 'enviado' 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {solicitud.tipo === 'pendiente' ? 'Pendiente' :
                     solicitud.tipo === 'aprobada' ? 'Aprobada' :
                     solicitud.tipo === 'gestionada' ? 'En Gestión' :
                     solicitud.tipo === 'despachada' ? 'Despachada' :
                     solicitud.estado === 'enviado' ? 'Enviada' : 'Borrador'}
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(solicitud.fecha).toLocaleDateString('es-DO')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            No hay actividad reciente
          </p>
        )}
      </div>

      {/* Alertas */}
      {stats.articulosBajoStock > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded-lg">
          <div className="flex items-start">
            <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                ⚠️ Atención: Artículos con Stock Bajo
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Hay {stats.articulosBajoStock} artículo(s) con existencia por debajo de su cantidad mínima. 
                Considera realizar una entrada de mercancía pronto.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Panel

