import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  Package, 
  Building2, 
  LogOut, 
  Menu, 
  X, 
  Sun, 
  Moon,
  Home,
  Users,
  PackageOpen,
  FileText,
  FileCheck,
  CheckCircle,
  ClipboardCheck,
  Truck,
  LayoutDashboard,
  Warehouse,
  Settings,
  FileBarChart,
  ClipboardList,
  ChevronDown,
  ChevronRight,
  Bell,
  Key,
  ChevronsUpDown,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react'
import { authService } from '../services/authService'
import { useTheme } from '../context/ThemeContext'
import { crmService } from '../services/crmService'
import CambiarPasswordModal from './CambiarPasswordModal'
import { filterMenuItems } from '../utils/permissions'
import { formatDateTime } from '../utils/dateUtils'

const Dashboard = ({ onLogout, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [openSubmenu, setOpenSubmenu] = useState({})
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const userMenuRef = useRef(null)
  const notificationsRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()
  const user = authService.getCurrentUser()

  // Verificar si el usuario puede ver notificaciones
  const canViewNotifications = () => {
    if (!user) return false
    const userRole = user.roles?.[0] || user.perfil || user.rol || ''
    const roleLower = userRole.toLowerCase()
    return roleLower === 'administrador' || 
           roleLower === 'encargado de suministro' || 
           roleLower === 'suministro'
  }

  // Cerrar menús al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Cargar notificaciones de solicitudes aprobadas (solo si el usuario puede verlas)
  useEffect(() => {
    if (!canViewNotifications()) return

    const loadNotifications = async () => {
      try {
        const result = await crmService.getSolicitudesAprobadas()
        if (result.success && result.data) {
          // Crear notificaciones desde las solicitudes aprobadas
          const newNotifications = result.data.map(solicitud => ({
            id: solicitud.id,
            tipo: 'solicitud_aprobada',
            titulo: `Nueva Solicitud Aprobada #${solicitud.numero_solicitud}`,
            descripcion: `${solicitud.departamento} - ${solicitud.total_articulos} artículo(s)`,
            fecha: solicitud.fecha,
            leida: false
          }))
          
          // Obtener notificaciones guardadas del localStorage
          const savedNotifications = JSON.parse(localStorage.getItem('indrhi_notifications') || '[]')
          const savedIds = savedNotifications.map(n => n.id)
          
          // Filtrar solo las notificaciones nuevas
          const recentNotifications = newNotifications.filter(n => !savedIds.includes(n.id))
          
          // Combinar y limitar a las últimas 10
          const allNotifications = [...recentNotifications, ...savedNotifications].slice(0, 10)
          
          setNotifications(allNotifications)
          setUnreadCount(allNotifications.filter(n => !n.leida).length)
          
          // Guardar en localStorage
          localStorage.setItem('indrhi_notifications', JSON.stringify(allNotifications))
        }
      } catch (error) {
        console.error('Error al cargar notificaciones:', error)
      }
    }

    loadNotifications()
    // Verificar cada 30 segundos
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [user])

  const toggleSubmenu = (key) => {
    // Si el sidebar está colapsado, no permitir abrir submenús
    if (sidebarCollapsed) return
    
    setOpenSubmenu(prev => {
      // Si el submenú ya está abierto, lo cerramos
      if (prev[key]) {
        return {
          ...prev,
          [key]: false
        }
      }
      // Si está cerrado, cerramos todos los demás y abrimos este
      return {
        [key]: true
      }
    })
  }

  const collapseAllMenus = () => {
    setOpenSubmenu({})
  }

  const expandAllMenus = () => {
    const allMenus = {}
    allMenuItems.forEach(item => {
      if (item.submenu) {
        allMenus[item.key] = true
      }
    })
    setOpenSubmenu(allMenus)
  }

  const toggleAllMenus = () => {
    const hasOpenMenus = Object.values(openSubmenu).some(value => value === true)
    if (hasOpenMenus) {
      collapseAllMenus()
    } else {
      expandAllMenus()
    }
  }

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(prev => {
      // Si vamos a colapsar, cerrar todos los submenús
      if (!prev) {
        setOpenSubmenu({})
      }
      return !prev
    })
  }

  const markNotificationAsRead = (notificationId) => {
    const updatedNotifications = notifications.map(n => 
      n.id === notificationId ? { ...n, leida: true } : n
    )
    setNotifications(updatedNotifications)
    setUnreadCount(updatedNotifications.filter(n => !n.leida).length)
    localStorage.setItem('indrhi_notifications', JSON.stringify(updatedNotifications))
  }

  const handleNotificationClick = (notification) => {
    markNotificationAsRead(notification.id)
    setNotificationsOpen(false)
    navigate('/solicitudes-aprobadas')
  }

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(n => ({ ...n, leida: true }))
    setNotifications(updatedNotifications)
    setUnreadCount(0)
    localStorage.setItem('indrhi_notifications', JSON.stringify(updatedNotifications))
  }

  const allMenuItems = [
    { 
      path: '/dashboard', 
      icon: LayoutDashboard, 
      label: 'Panel' 
    },
    { 
      path: '/solicitud-articulos', 
      icon: FileText, 
      label: 'Solicitud de Artículos' 
    },
    { 
      path: '/autorizar-solicitudes', 
      icon: FileCheck, 
      label: 'Autorizar Solicitudes' 
    },
    {
      key: 'manejo-solicitudes',
      icon: ClipboardList,
      label: 'Manejo de Solicitudes',
      submenu: [
        { 
          path: '/solicitudes-aprobadas', 
          icon: CheckCircle, 
          label: 'Solicitudes Aprobadas' 
        },
        { 
          path: '/solicitudes-gestionadas', 
          icon: ClipboardCheck, 
          label: 'Solicitudes Gestionadas' 
        }
      ]
    },
    {
      key: 'reportes',
      icon: FileBarChart,
      label: 'Reportes',
      submenu: [
        { 
          path: '/solicitudes-despachadas', 
          icon: Truck, 
          label: 'Solicitudes Despachadas' 
        }
      ]
    },
    {
      key: 'almacen',
      icon: Warehouse,
      label: 'Almacén',
      submenu: [
        { 
          path: '/articulos', 
          icon: Package, 
          label: 'Artículos' 
        },
        { 
          path: '/entrada-mercancia', 
          icon: PackageOpen, 
          label: 'Entrada de Mercancía' 
        },
        { 
          path: '/departamentos', 
          icon: Building2, 
          label: 'Departamentos' 
        }
      ]
    },
    {
      key: 'administracion',
      icon: Settings,
      label: 'Administración',
      submenu: [
        { 
          path: '/usuarios', 
          icon: Users, 
          label: 'Usuarios' 
        }
      ]
    }
  ]

  // Filtrar elementos del menú según los permisos del usuario
  const menuItems = filterMenuItems(allMenuItems, user)

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header - Ocupa todo el ancho */}
      <header className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700 fixed top-0 left-0 right-0 z-50 w-full">
        <div className="flex items-center justify-between px-4 py-4 w-full">
          {/* Left Side: Logo y botón contraer */}
          <div className="flex items-center gap-4">
            {/* Menu Button Mobile */}
            <div className="lg:hidden">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {sidebarOpen ? (
                  <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                )}
              </button>
            </div>

            {/* Logo y Botón Contraer (Desktop) */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Logo */}
              <img 
                src={theme === 'dark' ? '/logo-indrhi-white.png' : '/logo-indrhi.png'}
                alt="INDRHI" 
                className="h-12 w-auto cursor-pointer transition-all duration-300" 
                onClick={() => navigate('/dashboard')}
              />
              
              {/* Botón para contraer/expandir */}
              <button
                onClick={toggleSidebarCollapse}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title={sidebarCollapsed ? "Expandir menú" : "Contraer menú"}
              >
                {sidebarCollapsed ? (
                  <PanelLeftOpen className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                ) : (
                  <PanelLeftClose className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                )}
              </button>
            </div>
          </div>

          {/* Spacer for center */}
          <div className="flex-1"></div>

          {/* User Info y Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Cambiar tema"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <Sun className="w-5 h-5 text-yellow-500" />
              )}
            </button>

            {/* Notificaciones - Solo para Administrador, Encargado de Suministro y Suministro */}
            {canViewNotifications() && (
              <div className="relative" ref={notificationsRef}>
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  aria-label="Notificaciones"
                >
                  <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

              {/* Dropdown Notificaciones */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 animate-fade-in max-h-96 flex flex-col">
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Notificaciones
                    </h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        Marcar todas como leídas
                      </button>
                    )}
                  </div>

                  {/* Lista de Notificaciones */}
                  <div className="overflow-y-auto flex-1">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          No hay notificaciones
                        </p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <button
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 ${
                            !notification.leida ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                              !notification.leida ? 'bg-primary-600' : 'bg-gray-300'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {notification.titulo}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 truncate">
                                {notification.descripcion}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                {formatDateTime(notification.fecha, {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
              </div>
            )}

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-10 h-10 rounded-full bg-primary-600 hover:bg-primary-700 flex items-center justify-center transition-colors shadow-md hover:shadow-lg"
                aria-label="Menú de usuario"
              >
                <span className="text-white font-semibold text-sm">
                  {(user?.nombre_completo || user?.display_name || user?.username)?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50 animate-fade-in">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {user?.nombre_completo || user?.display_name || user?.username}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 break-words">
                      {user?.email}
                    </p>
                    <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                      {(user?.perfil || user?.roles?.[0] || 'Usuario').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                  </div>

                  {/* Cambiar Contraseña */}
                  <button
                    onClick={() => {
                      setUserMenuOpen(false)
                      setShowPasswordModal(true)
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
                  >
                    <Key className="w-4 h-4" />
                    Cambiar Contraseña
                  </button>

                  {/* Logout Button */}
                  <button
                    onClick={() => {
                      setUserMenuOpen(false)
                      onLogout()
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors border-t border-gray-200 dark:border-gray-700 mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Content Area con Sidebar */}
      <div className="flex flex-1">
        {/* Sidebar - Debajo del header */}
        <aside
          className={`
            fixed top-[73px] bottom-0 left-0 z-40 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 
            transform transition-all duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            ${sidebarCollapsed ? 'w-20' : 'w-64'}
            flex flex-col
          `}
        >
          <nav className="p-4 space-y-2 flex-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <div key={item.path || item.key}>
              {/* Menu item con o sin submenú */}
              {item.submenu ? (
                // Item con submenú
                <div>
                  <button
                    onClick={() => toggleSubmenu(item.key)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      sidebarCollapsed ? 'justify-center' : ''
                    }`}
                    title={sidebarCollapsed ? item.label : ''}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {!sidebarCollapsed && (
                      <>
                        <span className="font-medium text-left flex-1">{item.label}</span>
                        {openSubmenu[item.key] ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </>
                    )}
                  </button>
                  
                  {/* Submenú colapsable con animación suave */}
                  <div 
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      openSubmenu[item.key] && !sidebarCollapsed ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="ml-4 space-y-1">
                      {item.submenu.map((subitem) => (
                        <button
                          key={subitem.path}
                          onClick={() => {
                            navigate(subitem.path)
                            setSidebarOpen(false)
                          }}
                          className={`
                            w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm
                            ${isActive(subitem.path)
                              ? 'bg-primary-600 text-white shadow-md'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }
                          `}
                        >
                          <subitem.icon className="w-4 h-4 flex-shrink-0" />
                          <span className="font-medium text-left">{subitem.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                // Item sin submenú
                <button
                  onClick={() => {
                    navigate(item.path)
                    setSidebarOpen(false)
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${isActive(item.path)
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                    ${sidebarCollapsed ? 'justify-center' : ''}
                  `}
                  title={sidebarCollapsed ? item.label : ''}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && (
                    <span className="font-medium text-left">{item.label}</span>
                  )}
                </button>
              )}
            </div>
          ))}
        </nav>
      </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 pt-[73px] ${
          sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}>
          <div className="p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Modal Cambiar Contraseña */}
      {showPasswordModal && (
        <CambiarPasswordModal
          onClose={() => setShowPasswordModal(false)}
          userId={user?.id}
        />
      )}
    </div>
  )
}

export default Dashboard
