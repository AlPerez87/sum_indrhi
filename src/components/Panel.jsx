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

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    
    try {
      // Cargar estadísticas en paralelo
      const [
        articulosRes,
        solicitudesRes,
        approbadasRes,
        gestionadasRes,
        despachadasRes,
        deptosRes,
        usuariosRes
      ] = await Promise.all([
        crmService.getArticulos(),
        crmService.getSolicitudes(),
        crmService.getSolicitudesAprobadas(),
        crmService.getSolicitudesGestionadas(),
        crmService.getSolicitudesDespachadas(),
        crmService.getDepartamentos(),
        crmService.getUsuariosDepartamentos()
      ])

      // Calcular artículos con bajo stock (menos de 10 unidades)
      const articulosBajo = articulosRes.success 
        ? articulosRes.data.filter(a => a.existencia < 10).length 
        : 0

      // Filtrar solicitudes pendientes
      const pendientes = solicitudesRes.success
        ? solicitudesRes.data.filter(s => s.estado === 'borrador' || s.estado === 'pendiente').length
        : 0

      setStats({
        totalArticulos: articulosRes.success ? articulosRes.data.length : 0,
        articulosBajoStock: articulosBajo,
        solicitudesPendientes: pendientes,
        solicitudesAprobadas: approbadasRes.success ? approbadasRes.data.length : 0,
        solicitudesGestionadas: gestionadasRes.success ? gestionadasRes.data.length : 0,
        solicitudesDespachadas: despachadasRes.success ? despachadasRes.data.length : 0,
        totalDepartamentos: deptosRes.success ? deptosRes.data.length : 0,
        totalUsuarios: usuariosRes.success ? usuariosRes.data.length : 0
      })

      // Actividad reciente (últimas 5 solicitudes)
      if (solicitudesRes.success) {
        const recent = solicitudesRes.data
          .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
          .slice(0, 5)
        setRecentActivity(recent)
      }

    } catch (error) {
      console.error('Error al cargar datos del panel:', error)
    } finally {
      setLoading(false)
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
      {/* Encabezado */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          ¡Bienvenido, {user?.display_name || user?.username}! 👋
        </h1>
        <p className="text-primary-100">
          Aquí está el resumen de tu sistema de suministros
        </p>
      </div>

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
                    solicitud.estado === 'enviado' 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {solicitud.estado}
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
                Hay {stats.articulosBajoStock} artículo(s) con menos de 10 unidades en existencia. 
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

